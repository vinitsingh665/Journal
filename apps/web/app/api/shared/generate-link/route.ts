import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetPath = body.targetPath || null;

    const token = crypto.randomBytes(4).toString("hex"); // e.g. "a1b2c3d4"
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.sharedLink.create({
      data: {
        userId,
        token,
        targetPath,
        expiresAt,
      },
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to generate shared link token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
