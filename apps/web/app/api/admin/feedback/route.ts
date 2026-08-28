import { NextResponse } from 'next/server';
import { prisma } from '@repo/database';

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
      return NextResponse.json({ success: true, data: newFeedback });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Failed to update feedback:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
