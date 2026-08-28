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
      from: 'TraderLabs Security <onboarding@resend.dev>',
      to: user.email!,
      subject: 'Reset your TraderLabs password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px;">
            We received a request to reset your password for your TraderLabs account. 
            Click the button below to choose a new password.
          </p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this, you can safely ignore this email. This link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'If an account exists, a reset link was sent.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
