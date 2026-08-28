import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { Resend } from 'resend';
import crypto from 'crypto';


export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if the user exists
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link was sent.' });
    }

    if (user.googleId) {
      return NextResponse.json({ success: false, error: 'This account uses Google Login. Please sign in with Google.' }, { status: 400 });
    }

    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Determine base URL (for local vs prod)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set! The reset email was NOT sent. Reset URL:", resetUrl);
      return NextResponse.json({ success: false, error: 'Email provider not configured.' }, { status: 500 });
    }

    // Send email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'TraderLabs Security <noreply@traderlabs.in>',
      to: user.email!,
      subject: 'Reset your TraderLabs password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0F19; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #1A1F2C; border-radius: 12px; overflow: hidden; border: 1px solid #2A2F3D; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
                  
                  <!-- Header with Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 0 20px 0; background-color: #1A1F2C; border-bottom: 1px solid #2A2F3D;">
                      <img src="https://traderlabs.in/brand-logo.png" alt="TraderLabs" width="60" style="display: block; margin-bottom: 15px;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">TraderLabs</h1>
                    </td>
                  </tr>

                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 40px 40px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
                      <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #9CA3AF;">
                        We received a request to reset the password for your TraderLabs account. If you made this request, please click the button below to choose a new password.
                      </p>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 21px; color: #6B7280;">
                        This link will expire securely in 1 hour.
                      </p>
                      <p style="margin: 0; font-size: 14px; line-height: 21px; color: #6B7280;">
                        If you did not request a password reset, you can safely ignore this email. Your account remains secure.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 24px 40px; background-color: #121620; border-top: 1px solid #2A2F3D;">
                      <p style="margin: 0; font-size: 12px; color: #6B7280;">
                        &copy; 2026 TraderLabs. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, message: 'If an account exists, a reset link was sent.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
