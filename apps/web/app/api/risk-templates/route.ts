import { NextResponse } from "next/server";
import prisma from "@repo/database";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.riskTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Failed to fetch risk templates:", error);
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
    const { name, capital, maxPortfolioRiskPct, defaultTradeRiskPct, slippagePct, winRatePct } = body;

    const template = await prisma.riskTemplate.create({
      data: {
        userId,
        name,
        capital: Number(capital),
        maxPortfolioRiskPct: Number(maxPortfolioRiskPct),
        defaultTradeRiskPct: Number(defaultTradeRiskPct),
        slippagePct: Number(slippagePct),
        winRatePct: Number(winRatePct),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Failed to create risk template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
