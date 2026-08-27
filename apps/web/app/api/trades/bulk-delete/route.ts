import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";

// POST /api/trades/bulk-delete — Delete multiple trades
export async function POST(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tradeIds } = await request.json();

    if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
      return NextResponse.json(
        { error: "tradeIds array is required" },
        { status: 400 }
      );
    }

    // Verify all trades belong to user
    const trades = await prisma.trade.findMany({
      where: { id: { in: tradeIds }, userId },
      select: { id: true, symbol: true, exchange: true },
    });

    if (trades.length !== tradeIds.length) {
      return NextResponse.json(
        { error: "Some trades were not found or don't belong to you" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const hardDelete = url.searchParams.get("hard") === "true";

    await prisma.$transaction(async (tx) => {
      if (!hardDelete) {
        await tx.trade.updateMany({
          where: { id: { in: tradeIds } },
          data: { isArchived: true },
        });
      } else {
        // Unlink executions
        await tx.execution.updateMany({
          where: { tradeId: { in: tradeIds } },
          data: { tradeId: null },
        });

        // Delete mistakes
        await tx.tradeMistake.deleteMany({
          where: { tradeId: { in: tradeIds } },
        });

        // Delete screenshots
        await tx.screenshot.deleteMany({
          where: { tradeId: { in: tradeIds } },
        });

        // Delete trades
        await tx.trade.deleteMany({
          where: { id: { in: tradeIds } },
        });
      }
    });

    // Clean up orphaned positions
    const affectedSymbols = [...new Set(trades.map((t) => `${t.symbol}:${t.exchange}`))];
    for (const key of affectedSymbols) {
      const [symbol, exchange] = key.split(":");
      const remainingOpen = await prisma.trade.count({
        where: {
          userId,
          symbol,
          exchange,
          status: { in: ["OPEN", "PARTIAL"] },
          isArchived: false,
        },
      });

      if (remainingOpen === 0) {
        await prisma.position.deleteMany({
          where: { userId, symbol, exchange },
        });
      }
    }

    return NextResponse.json({
      success: true,
      deleted: trades.length,
      message: `${trades.length} trade(s) deleted`,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete trades" },
      { status: 500 }
    );
  }
}
