import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/database";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actionPlans = await prisma.actionPlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(actionPlans);
  } catch (error) {
    console.error("Failed to fetch action plans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const newActionPlan = await prisma.actionPlan.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
      },
    });

    return NextResponse.json(newActionPlan);
  } catch (error) {
    console.error("Failed to create action plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
