import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { generateFingerprint } from "@repo/trading-engine";
import { fetchStockQuote } from "@/lib/finance";
import { formatINR } from "@/lib/utils";

// Create a manual trade
export async function POST(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    const body = await request.json();
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

    if (!symbol || !side || !quantity || !price) {
      return NextResponse.json(
        { error: "Symbol, side, quantity, and price are required" },
        { status: 400 }
      );
    }

    if (baseCurrency === "INR" && ["NASDAQ", "NYSE", "CRYPTO"].includes(exchange.toUpperCase())) {
      const quote = await fetchStockQuote("USDINR=X", "FOREX");
      if (!quote || !quote.regularMarketPrice) {
        return NextResponse.json(
          { error: "Failed to fetch live exchange rate for USD to INR conversion. Please try again." },
          { status: 500 }
        );
      }
      const rate = quote.regularMarketPrice;
      price = price * rate;
      if (exitPrice) exitPrice = exitPrice * rate;
      if (stopLoss) stopLoss = stopLoss * rate;
      if (target) target = target * rate;
      
      const conversionNote = `Auto-converted from USD to INR at exchange rate ₹${rate.toFixed(2)}`;
      notes = notes ? `${notes}\n\n${conversionNote}` : conversionNote;
    }

    const execTime = executionTime ? new Date(executionTime) : new Date();
    const direction = side === "BUY" ? "LONG" : "SHORT";
    const totalValue = quantity * price;

    // Capital check
    const totalCapital = userSettings?.defaultCapital || 500000;
    const openTrades = await prisma.trade.findMany({
      where: { userId, isArchived: false, status: { in: ["OPEN", "PARTIAL"] } },
    });
    const openInvestment = openTrades.reduce(
      (sum, t) => sum + t.avgEntryPrice * t.totalBuyQty,
      0
    );
    const availableCapital = totalCapital - openInvestment;

    if (totalValue > availableCapital) {
      return NextResponse.json(
        { error: `Capital Exceeded: This trade requires ${formatINR(totalValue)} but your available capital is only ${formatINR(availableCapital)}.` },
        { status: 400 }
      );
    }

    // Generate fingerprint for the execution
    const fingerprint = generateFingerprint({
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price,
      timestamp: execTime,
    });

    // Check for duplicate
    const existing = await prisma.execution.findUnique({
      where: { fingerprint },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This trade appears to already exist (duplicate fingerprint)" },
        { status: 409 }
      );
    }

    // Calculate risk
    let riskAmount = null;
    let rMultiple = null;
    if (stopLoss) {
      riskAmount = Math.abs(price - stopLoss) * quantity;
    }

    // Determine if trade is closed (exit data provided)
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

    let tradeStatus = isClosed ? "CLOSED" : "OPEN";
    if (isClosed && stopLoss) {
      if (direction === "LONG" && exitPrice <= stopLoss) tradeStatus = "STOP_LOSS_HIT";
      else if (direction === "SHORT" && exitPrice >= stopLoss) tradeStatus = "STOP_LOSS_HIT";
    }

    // Create trade + execution in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the trade
      const trade = await tx.trade.create({
        data: {
          userId,
          symbol: symbol.toUpperCase(),
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
          entryTime: execTime,
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

      // Create the execution
      await tx.execution.create({
        data: {
          userId,
          fingerprint,
          symbol: symbol.toUpperCase(),
          exchange,
          side,
          quantity,
          executedQty: quantity,
          price,
          avgPrice: price,
          orderType: orderType || "MARKET",
          productType: productType || "CNC",
          orderStatus: "COMPLETE",
          executionTime: execTime,
          tradeId: trade.id,
        },
      });

      // Create/update position
      const existingPos = await tx.position.findUnique({
        where: {
          userId_symbol_exchange: { userId, symbol: symbol.toUpperCase(), exchange },
        },
      });

      if (existingPos) {
        const newQty =
          side === "BUY"
            ? existingPos.quantity + quantity
            : existingPos.quantity - quantity;
        const newAvgPrice =
          side === "BUY"
            ? (existingPos.avgPrice * existingPos.quantity + price * quantity) /
              (existingPos.quantity + quantity)
            : existingPos.avgPrice;

        if (newQty === 0) {
          await tx.position.delete({
            where: { id: existingPos.id },
          });
        } else {
          await tx.position.update({
            where: { id: existingPos.id },
            data: { quantity: newQty, avgPrice: newAvgPrice },
          });
        }
      } else if (quantity > 0) {
        await tx.position.create({
          data: {
            userId,
            symbol: symbol.toUpperCase(),
            exchange,
            quantity: side === "BUY" ? quantity : -quantity,
            avgPrice: price,
          },
        });
      }

      // Store raw import data
      await tx.rawImportData.create({
        data: {
          source: "manual",
          rawData: body,
        },
      });

      return trade;
    });

    return NextResponse.json({ success: true, tradeId: result.id });
  } catch (error) {
    console.error("Create trade error:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}

// Get all trades
export async function GET() {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId, isArchived: false },
    include: {
      executions: true,
      mistakes: { include: { mistakeTag: true } },
    },
    orderBy: { entryTime: "desc" },
  });

  return NextResponse.json(trades);
}
