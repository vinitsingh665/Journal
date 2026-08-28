import { NextResponse } from 'next/server';
import { prisma } from '@traderlabs/database';

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
    const { id, action } = await req.json();

    if (action === 'resolve') {
      await (prisma as any).appFeedback.update({
        where: { id },
        data: { status: 'resolved' }
      });
      return NextResponse.json({ success: true, message: 'Ticket resolved' });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Failed to update feedback:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
