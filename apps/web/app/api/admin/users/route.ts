import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUserId = await getCurrentUser();
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    });

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MEMBER')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isGuest: true,
        role: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: users,
      currentUserRole: currentUser.role
    });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUserId = await getCurrentUser();
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden: Only admins can change roles.' }, { status: 403 });
    }

    const { userId, newRole } = await req.json();

    if (!userId || !['USER', 'MEMBER', 'ADMIN'].includes(newRole)) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (err) {
    console.error('Failed to update user role:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
