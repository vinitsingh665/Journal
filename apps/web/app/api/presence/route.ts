import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@repo/database';
import crypto from 'crypto';

export async function POST() {
  try {
    const cookieStore = cookies();
    let sessionId = cookieStore.get('visitor_session_id')?.value;

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
      update: { lastSeen: new Date() },
      create: { sessionId, lastSeen: new Date() },
    });

    // Cleanup old sessions (older than 10 minutes to keep DB small)
    // Run this asynchronously so it doesn't block the request
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    prisma.activeVisitor.deleteMany({
      where: { lastSeen: { lt: tenMinutesAgo } },
    }).catch((err) => console.error("Failed to clean up old sessions:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Presence API Error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
