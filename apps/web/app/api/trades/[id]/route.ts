import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { fetchStockQuote } from "@/lib/finance";

// GET /api/trades/[id] — Get single trade detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId },
    include: {
      executions: { orderBy: { executionTime: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
      mistakes: { include: { mistakeTag: true } },
      screenshots: true,
    },
  });

  if (!trade) {
    return NextResponse.json({ error: "Trade not found" }, { status: 404 });
  }

  return NextResponse.json(trade);
}

// DELETE /api/trades/[id] — Delete a trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const url = new URL(request.url);
    const hardDelete = url.searchParams.get("hard") === "true";

    // Verify trade belongs to user
    const trade = await prisma.trade.findFirst({
      where: { id, userId },
      include: { executions: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Delete in transaction: unlink executions, delete mistakes, delete trade
    await prisma.$transaction(async (tx) => {
      if (!hardDelete) {
        // Soft delete: mark as archived and deleted, record deletion time and price
        const deletionTime = new Date();
        let deletionPrice: number | null = null;
        try {
          const quote = await fetchStockQuote(trade.symbol, trade.exchange);
          if (quote) deletionPrice = quote.regularMarketPrice;
        } catch {
          // silently fail — price is optional
        }

        await tx.trade.update({
          where: { id },
          data: {
            isArchived: true,
            status: "DELETED",
            exitTime: deletionTime,
            avgExitPrice: deletionPrice,
          },
        });
      } else {
        // Hard delete
        // Unlink executions from trade (don't delete them — they're raw data)
        await tx.execution.updateMany({
          where: { tradeId: id },
          data: { tradeId: null },
        });

        // Delete trade mistakes (cascade should handle this, but be explicit)
        await tx.tradeMistake.deleteMany({
          where: { tradeId: id },
        });

        // Delete screenshots
        await tx.screenshot.deleteMany({
          where: { tradeId: id },
        });

        // Delete the trade
        await tx.trade.delete({
          where: { id },
        });
      }

      // Update position
      const existingPos = await tx.position.findUnique({
        where: {
          userId_symbol_exchange: {
            userId,
            symbol: trade.symbol,
            exchange: trade.exchange,
          },
        },
      });

      if (existingPos) {
        // Recalculate position from remaining active trades
        const remainingTrades = await tx.trade.findMany({
          where: {
            userId,
            symbol: trade.symbol,
            exchange: trade.exchange,
            status: { in: ["OPEN", "PARTIAL"] },
            isArchived: false, // Don't count archived trades in positions
          },
        });

        if (remainingTrades.length === 0) {
          await tx.position.delete({ where: { id: existingPos.id } });
        } else {
          const totalQty = remainingTrades.reduce(
            (sum, t) => sum + (t.totalBuyQty - t.totalSellQty),
            0
          );
          if (totalQty <= 0) {
            await tx.position.delete({ where: { id: existingPos.id } });
          } else {
            const avgPrice =
              remainingTrades.reduce(
                (sum, t) => sum + t.avgEntryPrice * t.totalBuyQty,
                0
              ) / remainingTrades.reduce((sum, t) => sum + t.totalBuyQty, 0);
            await tx.position.update({
              where: { id: existingPos.id },
              data: { quantity: totalQty, avgPrice },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: "Trade deleted" });
  } catch (error) {
    console.error("Delete trade error:", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }
}

// PUT /api/trades/[id] — Full update of a trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const existingTrade = await prisma.trade.findFirst({ where: { id, userId } });
    if (!existingTrade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    let {
      symbol,
      exchange = "NSE",
      side,
      quantity,
      price,
      executionTime,
      orderType,
      productType,
      exitPrice,
      exitTime,
      stopLoss,
      target,
      expectedRR,
      strategy,
      setup,
      thesis,
      confidence,
      marketCondition,
      reasonForEntry,
      reasonForExit,
      notes,
      emotionalState,
      postTradeReview,
    } = body;

    // NOTE: No currency conversion here.
    // The TradeForm pre-fills values from the DB, which are already stored in the user's
    // base currency (INR). Re-converting would double-multiply crypto prices by the FX rate.
    // Currency conversion is handled ONLY at trade creation (POST /api/trades).

    const execTime = executionTime ? new Date(executionTime) : new Date();
    const direction = side === "BUY" ? "LONG" : "SHORT";

    // Calculate risk
    let riskAmount = null;
    let rMultiple = null;
    if (stopLoss) {
      riskAmount = Math.abs(price - stopLoss) * quantity;
    }

    const isClosed = exitPrice != null && exitPrice > 0;
    const exitDate = exitTime ? new Date(exitTime) : isClosed ? new Date() : null;

    let grossPnl = 0;
    let netPnl = 0;
    let pnlPercentage = 0;
    let holdingPeriodMs: bigint | null = null;

    if (isClosed) {
      if (direction === "LONG") {
        grossPnl = (exitPrice - price) * quantity;
      } else {
        grossPnl = (price - exitPrice) * quantity;
      }
      netPnl = grossPnl;
      const investment = price * quantity;
      pnlPercentage = investment > 0 ? (grossPnl / investment) * 100 : 0;

      if (exitDate) {
        holdingPeriodMs = BigInt(exitDate.getTime() - execTime.getTime());
      }

      if (riskAmount && riskAmount > 0) {
        rMultiple = grossPnl / riskAmount;
      }
    }

    const newEvents = [];
    if (stopLoss !== undefined && existingTrade.stopLoss !== stopLoss) {
      newEvents.push({
        type: "STOP_LOSS_UPDATE",
        description: stopLoss === null ? "Removed Stop Loss" : `Shifted Stop Loss from ${existingTrade.stopLoss != null ? Number(existingTrade.stopLoss).toFixed(2) : 'None'} to ${Number(stopLoss).toFixed(2)}`,
        oldValue: existingTrade.stopLoss?.toString() || null,
        newValue: stopLoss?.toString() || null,
      });
    }
    if (target !== undefined && existingTrade.target !== target) {
      newEvents.push({
        type: "TARGET_UPDATE",
        description: target === null ? "Removed Target" : `Updated Target from ${existingTrade.target != null ? Number(existingTrade.target).toFixed(2) : 'None'} to ${Number(target).toFixed(2)}`,
        oldValue: existingTrade.target?.toString() || null,
        newValue: target?.toString() || null,
      });
    }

    let tradeStatus = isClosed ? "CLOSED" : "OPEN";
    if (isClosed && stopLoss) {
      if (direction === "LONG" && exitPrice <= stopLoss) tradeStatus = "STOP_LOSS_HIT";
      else if (direction === "SHORT" && exitPrice >= stopLoss) tradeStatus = "STOP_LOSS_HIT";
    }

    const updated = await prisma.trade.update({
      where: { id },
      data: {
        symbol: symbol?.toUpperCase(),
        exchange,
        direction,
        status: tradeStatus,
        totalBuyQty: side === "BUY" ? quantity : (isClosed ? quantity : 0),
        totalSellQty: side === "SELL" ? quantity : (isClosed ? quantity : 0),
        avgEntryPrice: price,
        avgExitPrice: isClosed ? exitPrice : null,
        grossPnl,
        netPnl,
        pnlPercentage,
        // entryTime is intentionally NOT updated — preserve the original entry date
        exitTime: exitDate,
        holdingPeriodMs,
        strategy: strategy || null,
        setup: setup || null,
        thesis: thesis || null,
        plannedEntry: price,
        stopLoss: stopLoss || null,
        target: target || null,
        expectedRR: expectedRR || null,
        confidence: confidence || null,
        marketCondition: marketCondition || null,
        reasonForEntry: reasonForEntry || null,
        reasonForExit: reasonForExit || null,
        notes: notes || null,
        emotionalState: emotionalState || null,
        postTradeReview: postTradeReview || null,
        riskAmount,
        rMultiple,
      },
    });

    if (newEvents.length > 0) {
      await prisma.tradeEvent.createMany({
        data: newEvents.map(e => ({ ...e, tradeId: id }))
      });
    }

    const serializedTrade = {
      ...updated,
      holdingPeriodMs: updated.holdingPeriodMs ? Number(updated.holdingPeriodMs) : null,
    };

    return NextResponse.json(serializedTrade);
  } catch (error) {
    console.error("Update trade error:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

// PATCH /api/trades/[id] — Update trade journal fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const trade = await prisma.trade.findFirst({ where: { id, userId } });
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Only allow updating journal fields
    const allowedFields = [
      "strategy", "setup", "thesis", "stopLoss", "target",
      "expectedRR", "marketCondition", "confidence",
      "reasonForEntry", "reasonForExit", "emotionalState",
      "notes", "postTradeReview",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Recalculate R-multiple if stopLoss changed
    if (updateData.stopLoss && trade.avgEntryPrice && trade.netPnl) {
      const riskPerShare = Math.abs(
        trade.avgEntryPrice - (updateData.stopLoss as number)
      );
      const riskAmount = riskPerShare * trade.totalBuyQty;
      if (riskAmount > 0) {
        updateData.riskAmount = riskAmount;
        updateData.rMultiple = trade.netPnl / riskAmount;
      }
    }

    const newEvents = [];
    if (updateData.stopLoss !== undefined && trade.stopLoss !== updateData.stopLoss) {
      newEvents.push({
        type: "STOP_LOSS_UPDATE",
        description: updateData.stopLoss === null ? "Removed Stop Loss" : `Shifted Stop Loss from ${trade.stopLoss != null ? Number(trade.stopLoss).toFixed(2) : 'None'} to ${Number(updateData.stopLoss).toFixed(2)}`,
        oldValue: trade.stopLoss?.toString() || null,
        newValue: updateData.stopLoss?.toString() || null,
      });
    }
    if (updateData.target !== undefined && trade.target !== updateData.target) {
      newEvents.push({
        type: "TARGET_UPDATE",
        description: updateData.target === null ? "Removed Target" : `Updated Target from ${trade.target != null ? Number(trade.target).toFixed(2) : 'None'} to ${Number(updateData.target).toFixed(2)}`,
        oldValue: trade.target?.toString() || null,
        newValue: updateData.target?.toString() || null,
      });
    }

    const updated = await prisma.trade.update({
      where: { id },
      data: updateData,
    });

    if (newEvents.length > 0) {
      await prisma.tradeEvent.createMany({
        data: newEvents.map(e => ({ ...e, tradeId: id }))
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update trade error:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}
