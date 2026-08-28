import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        settings: {
          select: {
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch(e) {
    console.error('Failed to fetch users:', e);
    return NextResponse.json({ success: false, data: [] });
  }
}
