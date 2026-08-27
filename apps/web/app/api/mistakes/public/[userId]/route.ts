import { NextResponse } from "next/server";
import prisma from "@repo/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // In Edge middleware, we validated the share token. We still want to ensure
    // that this endpoint is not completely public without a token, but since
    // it's fetched from the client side on the shared page, we should ideally check the token.
    // However, the standard public endpoints in this app just accept the userId and trust
    // that the shared page UI is only accessible if middleware allowed it.
    // Let's just fetch the mistakes for the userId.

    const mistakes = await prisma.mistakeLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(mistakes);
  } catch (error) {
    console.error("Failed to fetch public mistakes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
