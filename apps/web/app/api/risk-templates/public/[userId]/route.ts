import { NextResponse } from "next/server";
import prisma from "@repo/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const templates = await prisma.riskTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch public risk templates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
