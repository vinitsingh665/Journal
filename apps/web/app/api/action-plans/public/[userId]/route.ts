import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { userId } = resolvedParams;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const actionPlans = await prisma.actionPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
      }
    });

    return NextResponse.json(actionPlans);
  } catch (error) {
    console.error("Failed to fetch public action plans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
