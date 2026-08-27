import { NextResponse } from "next/server";
import prisma from "@repo/database";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mistakes = await prisma.mistakeLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(mistakes);
  } catch (error) {
    console.error("Failed to fetch mistakes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, desc, category, symbol, direction, priceIn, priceOut, impact, recurred, date } = body;

    const mistake = await prisma.mistakeLog.create({
      data: {
        userId,
        title,
        desc,
        category,
        symbol,
        direction,
        priceIn: Number(priceIn),
        priceOut: Number(priceOut),
        impact: Number(impact),
        recurred: Number(recurred) || 1,
        date: new Date(date),
      },
    });

    return NextResponse.json(mistake);
  } catch (error) {
    console.error("Failed to create mistake:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
