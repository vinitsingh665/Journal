import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";

// GET /api/notes — list all notes for the current user
export async function GET(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const urlFilter = searchParams.get("url");

  const notes = await prisma.note.findMany({
    where: { 
      userId,
      ...(urlFilter ? { url: urlFilter } : {})
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      color: true,
      isPinned: true,
      isMinimized: true,
      url: true,
      positionX: true,
      positionY: true,
      width: true,
      height: true,
      tradeId: true,
      createdAt: true,
      updatedAt: true,
      trade: { select: { symbol: true } },
      // Return a text preview derived from the JSON content
      content: true,
    },
  });

  return NextResponse.json(notes);
}

// POST /api/notes — create a new note
export async function POST(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const note = await prisma.note.create({
    data: {
      userId,
      title: body.title ?? "Untitled",
      content: body.content ?? { type: "doc", content: [] },
      color: body.color ?? "#1a1a2e",
      tradeId: body.tradeId ?? null,
      url: body.url ?? null,
      positionX: body.positionX ?? null,
      positionY: body.positionY ?? null,
      isPinned: body.isPinned ?? false,
      isMinimized: body.isMinimized ?? false,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
