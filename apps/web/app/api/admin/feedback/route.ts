import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { Resend } from 'resend';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function GET() {
  try {
    const feedback = await (prisma as any).appFeedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: feedback
    });
  } catch(e) {
    console.error('Failed to fetch feedback:', e);
    return NextResponse.json({ success: false, data: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, id, ...data } = body;

    if (action === 'resolve' && id) {
      await prisma.appFeedback.update({
        where: { id },
        data: { status: 'resolved' }
      });
      return NextResponse.json({ success: true, message: 'Ticket resolved' });
    }
    
    if (action === 'create') {
      const newFeedback = await prisma.appFeedback.create({
        data: {
          type: data.type || 'contact',
          subject: data.subject || 'No Subject',
          body: data.body || '',
          senderName: data.senderName || 'Anonymous',
          senderEmail: data.senderEmail || 'No Email',
          severity: data.severity || null,
          affectedPage: data.affectedPage || null,
          stepsToReproduce: data.stepsToReproduce || null,
          expectedBehavior: data.expectedBehavior || null,
          actualBehavior: data.actualBehavior || null,
          status: 'new'
        }
      });

      // Send email notification to traderlabs.in@gmail.com
      const resendApiKey = process.env.RESEND_API_KEY;
      const targetEmail = process.env.FEEDBACK_RECIPIENT_EMAIL || 'traderlabs.in@gmail.com';
      const fromEmail = process.env.FEEDBACK_FROM_EMAIL || 'TraderLabs Support <noreply@traderlabs.in>';
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://traderlabs.in';

      if (resendApiKey) {
        try {
          const resend = new Resend(resendApiKey);
          const isBug = (data.type || '').toLowerCase() === 'bug';
          
          const subject = isBug
            ? `🐛 [Bug Report] ${data.severity ? `[${data.severity.split(' ')[0]}] ` : ''}${data.subject || 'New Bug'}`
            : `✉️ [Contact Us] ${data.subject || 'New Feedback'} from ${data.senderName || 'Visitor'}`;

          const senderEmail = (data.senderEmail || '').trim();
          const hasValidSenderEmail = senderEmail.includes('@') && senderEmail !== 'No Email';
          const senderName = (data.senderName || 'Anonymous').trim();

          // 1. Sender Avatar (clean UI avatar matching reference mockup, or user setting if present)
          let senderCustomAvatar: string | null = null;
          if (hasValidSenderEmail) {
            try {
              const existingUser = await (prisma as any).user.findUnique({
                where: { email: senderEmail },
                include: { settings: true }
              });
              if (existingUser?.settings?.avatar && existingUser.settings.avatar.startsWith('http')) {
                senderCustomAvatar = existingUser.settings.avatar;
              }
            } catch (err) {
              // ignore
            }
          }

          // 2. Receiver Avatar (Official TraderLabs Website Logo)
          const receiverLogo = 'https://traderlabs.in/brand-logo.png';

          // 3. 3D Mail Badge Image (Hosted CDN & domain fallback - NO email attachments)
          const badgeImgSrc = 'https://files.catbox.moe/t2dbm4.jpg';


          const textContent = isBug
            ? `[Bug Report] ${data.subject || 'New Bug'}\n\n` +
              `Reporter: ${senderName} (${senderEmail || 'No Email'})\n` +
              `Severity: ${data.severity || 'N/A'}\n` +
              `Affected Page: ${data.affectedPage || 'N/A'}\n` +
              `Ticket ID: #${newFeedback.id}\n\n` +
              `Steps to Reproduce / Details:\n${data.stepsToReproduce || data.body || 'N/A'}\n\n` +
              (data.expectedBehavior ? `Expected Behavior:\n${data.expectedBehavior}\n\n` : '') +
              (data.actualBehavior ? `Actual Behavior:\n${data.actualBehavior}\n\n` : '') +
              `\nView in admin dashboard: ${baseUrl}/admin/feedback`
            : `[Contact Us / Feedback] ${data.subject || 'New Message'}\n\n` +
              `Sender: ${senderName} (${senderEmail || 'No Email'})\n` +
              `Ticket ID: #${newFeedback.id}\n\n` +
              `Message:\n${data.body || 'N/A'}\n\n` +
              `Reply to: ${senderEmail || 'N/A'}\n` +
              `View in admin dashboard: ${baseUrl}/admin/feedback`;
          const badgeText = isBug ? '🐛 BUG REPORT' : '✉️ NEW MESSAGE';
          const headerSubtitle = isBug ? 'A NEW ISSUE HAS BEEN REPORTED' : 'A NEW MESSAGE HAS BEEN RECEIVED';
          const headerCategory = isBug ? 'WEBSITE BUG REPORT' : 'WEBSITE CONTACT FORM';
          const subHeading = isBug
            ? "You've received a new bug report from your website issue tracker."
            : "You've received a new message from your website contact form.";

          const messageText = isBug ? (data.stepsToReproduce || data.body) : data.body;
          const replySubject = encodeURIComponent(`Re: ${data.subject || (isBug ? 'Bug Report' : 'Contact Message')}`);
          const mailtoLink = hasValidSenderEmail
            ? `mailto:${escapeHtml(senderEmail)}?subject=${replySubject}`
            : '#';

          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${escapeHtml(subject)}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
                <tr>
                  <td align="center">
                    <!-- Main Card Container -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                      
                      <!-- Header Banner -->
                      <tr>
                        <td style="background: #080f24; background: linear-gradient(135deg, #070d1e 0%, #0c1630 50%, #152d68 85%, #1d4ed8 100%); padding: 26px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <!-- Left: Logo & Brand -->
                              <td style="vertical-align: middle;">
                                <table border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td style="vertical-align: middle;">
                                      <img src="${receiverLogo}" alt="TraderLabs Logo" width="34" height="34" style="display: block; border-radius: 6px;" />
                                    </td>
                                    <td style="padding-left: 12px; vertical-align: middle;">
                                      <div style="font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1.1;">
                                        Trader<span style="color: #60a5fa;">Labs</span>
                                      </div>
                                      <div style="font-size: 9px; font-weight: 700; color: #94a3b8; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase;">
                                        PLAN &bull; EXECUTE &bull; IMPROVE
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <!-- Right: Header Category Notice -->
                              <td style="vertical-align: middle; text-align: right;">
                                <div style="font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                                  ${headerCategory}
                                </div>
                                <div style="font-size: 9px; font-weight: 600; color: #93c5fd; letter-spacing: 0.5px; margin-top: 3px; text-transform: uppercase;">
                                  ${headerSubtitle}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Card Body -->
                      <tr>
                        <td style="padding: 32px 32px 28px 32px; background-color: #ffffff;">
                          
                          <!-- Badge + Heading & Perfectly Centered 3D Mail Illustration Row -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="vertical-align: middle; padding-right: 16px;">
                                <!-- Badge -->
                                <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                                  <tr>
                                    <td style="background-color: ${isBug ? '#fff7ed' : '#eff6ff'}; border: 1px solid ${isBug ? '#fed7aa' : '#bfdbfe'}; border-radius: 9999px; padding: 4px 12px;">
                                      <span style="font-size: 11px; font-weight: 700; color: ${isBug ? '#ea580c' : '#2563eb'}; letter-spacing: 0.5px; text-transform: uppercase;">
                                        ${badgeText}
                                      </span>
                                    </td>
                                  </tr>
                                </table>

                                <!-- Title -->
                                <h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.25; letter-spacing: -0.5px;">
                                  ${escapeHtml(data.subject || (isBug ? 'Bug Report' : 'General Question'))}
                                </h1>
                                <p style="margin: 0; font-size: 13.5px; color: #64748b; line-height: 1.5;">
                                  ${subHeading}
                                </p>
                              </td>
                              <!-- Right: Perfectly Centered 3D Envelope Illustration -->
                              <td width="110" align="center" style="vertical-align: middle; width: 110px; text-align: center;">
                                <img src="${badgeImgSrc}" alt="Mail Icon" width="105" height="105" style="display: block; width: 105px; height: 105px; margin: 0 auto; border: 0;" />
                              </td>
                            </tr>
                          </table>

                          <!-- Sender & Recipient Box -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <tr>
                              <!-- Left: From Sender (Clean UI avatar matching mockup) -->
                              <td width="50%" style="padding: 14px 16px; border-right: 1px solid #e2e8f0; vertical-align: middle;">
                                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                                  <tr>
                                    <td width="40" style="vertical-align: middle;">
                                      ${senderCustomAvatar ? `
                                        <img src="${escapeHtml(senderCustomAvatar)}" alt="Sender DP" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1;" />
                                      ` : `
                                        <div style="width: 38px; height: 38px; border-radius: 50%; background-color: #e0f2fe; text-align: center; line-height: 38px; font-size: 18px; border: 1px solid #bfdbfe; margin: 0 auto;">
                                          👤
                                        </div>
                                      `}
                                    </td>
                                    <td style="padding-left: 10px; vertical-align: middle;">
                                      <div style="font-size: 9.5px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">
                                        FROM (SENDER)
                                      </div>
                                      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; word-break: break-all;">
                                        ${escapeHtml(senderEmail || senderName || 'Anonymous')}
                                      </div>
                                      ${senderName && senderName !== senderEmail && senderName !== 'Anonymous' ? `
                                        <div style="font-size: 11px; color: #64748b; font-weight: 500; margin-top: 1px;">
                                          ${escapeHtml(senderName)}
                                        </div>
                                      ` : ''}
                                    </td>
                                  </tr>
                                </table>
                              </td>

                              <!-- Right: To Recipient (With Official TraderLabs Logo DP) -->
                              <td width="50%" style="padding: 14px 16px; vertical-align: middle;">
                                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                                  <tr>
                                    <td width="40" style="vertical-align: middle;">
                                      <img src="${receiverLogo}" alt="TraderLabs Logo" width="38" height="38" style="display: block; width: 38px; height: 38px; border-radius: 50%; object-fit: contain; background: #080f24; border: 1px solid #cbd5e1; padding: 2px; box-sizing: border-box;" />
                                    </td>
                                    <td style="padding-left: 10px; vertical-align: middle;">
                                      <div style="font-size: 9.5px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase;">
                                        TO (RECIPIENT)
                                      </div>
                                      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; word-break: break-all;">
                                        ${escapeHtml(targetEmail)}
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          ${isBug && (data.severity || data.affectedPage) ? `
                          <!-- Bug Severity & Affected Page Info Bar -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 10px 14px;">
                            <tr>
                              <td style="font-size: 12px; color: #9a3412;">
                                ${data.severity ? `<strong>Severity:</strong> <span style="color: #ea580c; font-weight: 700;">${escapeHtml(data.severity)}</span> &nbsp;&bull;&nbsp; ` : ''}
                                ${data.affectedPage ? `<strong>Affected Page:</strong> <span style="color: #0f172a; font-weight: 600;">${escapeHtml(data.affectedPage)}</span>` : ''}
                              </td>
                            </tr>
                          </table>
                          ` : ''}

                          <!-- Highlighted Message Box -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 18px;">
                            <tr>
                              <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 12px; padding: 18px 20px;">
                                <!-- Top row: Message Icon + label + quote mark -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                                  <tr>
                                    <td style="vertical-align: middle;">
                                      <table border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                          <td width="24" height="24" style="background-color: #e0f2fe; border-radius: 6px; text-align: center; vertical-align: middle; font-size: 13px; line-height: 24px;">
                                            💬
                                          </td>
                                          <td style="padding-left: 8px; font-size: 10.5px; font-weight: 800; color: #475569; letter-spacing: 0.5px; text-transform: uppercase;">
                                            ${isBug ? 'STEPS TO REPRODUCE / ISSUE DETAILS' : 'MESSAGE'}
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="vertical-align: middle; text-align: right; font-family: Georgia, serif; font-size: 26px; color: #cbd5e1; line-height: 1;">
                                      &rdquo;
                                    </td>
                                  </tr>
                                </table>

                                <!-- Actual Message Content -->
                                <div style="font-size: 15px; color: #1e293b; line-height: 1.65; white-space: pre-wrap; font-weight: 400;">
${escapeHtml(messageText)}
                                </div>
                              </td>
                            </tr>
                          </table>

                          ${isBug && data.expectedBehavior ? `
                          <!-- Expected Behavior -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px;">
                            <tr>
                              <td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 10px; padding: 12px 16px;">
                                <div style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                  EXPECTED BEHAVIOR
                                </div>
                                <div style="font-size: 13.5px; color: #14532d; line-height: 1.5; white-space: pre-wrap;">
                                  ${escapeHtml(data.expectedBehavior)}
                                </div>
                              </td>
                            </tr>
                          </table>
                          ` : ''}

                          ${isBug && data.actualBehavior ? `
                          <!-- Actual Behavior -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px;">
                            <tr>
                              <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 10px; padding: 12px 16px;">
                                <div style="font-size: 10px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                                  ACTUAL BEHAVIOR
                                </div>
                                <div style="font-size: 13.5px; color: #7f1d1d; line-height: 1.5; white-space: pre-wrap;">
                                  ${escapeHtml(data.actualBehavior)}
                                </div>
                              </td>
                            </tr>
                          </table>
                          ` : ''}

                          <!-- Call to Action Buttons -->
                          <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                            <tr>
                              ${hasValidSenderEmail ? `
                              <td style="padding-right: 12px;">
                                <a href="${mailtoLink}" style="background-color: #2563eb; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: #ffffff; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                                  ✉️ Reply to Sender &nbsp;&rarr;
                                </a>
                              </td>
                              ` : ''}
                              <td>
                                <a href="${baseUrl}/admin/feedback" style="background-color: #f8fafc; color: #334155; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; display: inline-block; border: 1px solid #e2e8f0;">
                                  View in Admin &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Footer Divider & Note -->
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 18px;">
                            <tr>
                              <td style="font-size: 12.5px; color: #64748b; line-height: 1.5;">
                                This message was sent from the contact form on <a href="${baseUrl}" style="color: #2563eb; text-decoration: none; font-weight: 700;">TraderLabs.</a>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;

          await resend.emails.send({
            from: fromEmail,
            to: targetEmail,
            replyTo: hasValidSenderEmail ? senderEmail : undefined,
            subject,
            text: textContent,
            html: htmlContent
          });
        } catch (emailErr) {
          console.error('Failed to send feedback notification email to', targetEmail, emailErr);
          // Don't fail the response: feedback is already saved in database
        }
      } else {
        console.warn('RESEND_API_KEY is not configured; skipped sending notification to', targetEmail);
      }

      return NextResponse.json({ success: true, data: newFeedback });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Failed to update feedback:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

