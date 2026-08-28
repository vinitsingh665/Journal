import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const link = await prisma.sharedLink.findUnique({
      where: { token },
    });

    if (!link || link.expiresAt < new Date()) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true, userId: link.userId });
  } catch (e) {
    console.error("Failed to verify shared link:", e);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
