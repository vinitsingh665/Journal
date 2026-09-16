import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";

type Params = { params: Promise<{ noteId: string }> };

// GET /api/notes/[noteId] — fetch full note content
export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getCurrentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { trade: { select: { symbol: true, id: true } } },
  });

  if (!note || note.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

// PATCH /api/notes/[noteId] — auto-save (title, content, color, isPinned, tradeId)
export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getCurrentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  const body = await request.json().catch(() => ({}));

  // Confirm ownership
  const existing = await prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.isMinimized !== undefined && { isMinimized: body.isMinimized }),
      ...(body.positionX !== undefined && { positionX: body.positionX }),
      ...(body.positionY !== undefined && { positionY: body.positionY }),
      ...(body.width !== undefined && { width: body.width }),
      ...(body.height !== undefined && { height: body.height }),
      ...(body.url !== undefined && { url: body.url }),
      ...("tradeId" in body && { tradeId: body.tradeId }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/notes/[noteId] — delete a note
export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getCurrentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;

  const existing = await prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.note.delete({ where: { id: noteId } });
  return NextResponse.json({ success: true });
}
