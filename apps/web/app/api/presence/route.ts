import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@repo/database';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('visitor_session_id')?.value;
    const userId = await getCurrentUser() || null;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set('visitor_session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }

    // Upsert the visitor session
    await prisma.activeVisitor.upsert({
      where: { sessionId },
      update: { lastSeen: new Date(), userId },
      create: { sessionId, lastSeen: new Date(), userId },
    });

    // If user is logged in, touch their user record as well
    if (userId) {
      prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      }).catch(() => {});
    }

    // Cleanup old sessions for anonymous visitors only (keep logged-in user lastSeen records)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    prisma.activeVisitor.deleteMany({
      where: { 
        userId: null,
        lastSeen: { lt: tenMinutesAgo } 
      },
    }).catch((err) => console.error("Failed to clean up old sessions:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Presence API Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
