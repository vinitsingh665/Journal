import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { generateFingerprint } from "@repo/trading-engine";
import { fetchStockQuote } from "@/lib/finance";

export async function POST(
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
    const trade = await prisma.trade.findFirst({
      where: { id, userId },
      include: { executions: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    if (trade.status === "CLOSED" || trade.status === "STOP_LOSS_HIT") {
      return NextResponse.json({ error: "Cannot add execution to a closed trade" }, { status: 400 });
    }

    let {
      side,
      quantity,
      price,
      executionTime,
      orderType,
      productType,
    } = body;

    if (!side || !quantity || !price) {
      return NextResponse.json(
        { error: "Side, quantity, and price are required" },
        { status: 400 }
      );
    }

    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    if (baseCurrency === "INR" && ["NASDAQ", "NYSE", "CRYPTO"].includes(trade.exchange.toUpperCase())) {
      const quote = await fetchStockQuote("USDINR", "FX_IDC");
      if (!quote || !quote.regularMarketPrice) {
        return NextResponse.json(
          { error: "Failed to fetch live exchange rate for USD to INR conversion. Please try again." },
          { status: 500 }
        );
      }
      price = price * quote.regularMarketPrice;
    }

    const isExit = trade.direction === "LONG" ? side === "SELL" : side === "BUY";
    const openQty = Math.abs(trade.totalBuyQty - trade.totalSellQty);

    if (isExit && quantity > openQty) {
      return NextResponse.json(
        { error: `Cannot exit more than ${openQty} units` },
        { status: 400 }
      );
    }

    const execTime = executionTime ? new Date(executionTime) : new Date();

    const fingerprint = generateFingerprint({
      symbol: trade.symbol,
      side,
      quantity,
      price,
      timestamp: execTime,
    });

    const existingExec = await prisma.execution.findUnique({
      where: { fingerprint },
    });

    if (existingExec) {
      return NextResponse.json(
        { error: "Duplicate execution fingerprint" },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Execution
      await tx.execution.create({
        data: {
          userId,
          fingerprint,
          symbol: trade.symbol,
          exchange: trade.exchange,
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

      // 2. Recalculate Trade averages and totals
      const isScaleIn = trade.direction === "LONG" ? side === "BUY" : side === "SELL";
      
      let newTotalBuyQty = trade.totalBuyQty;
      let newTotalSellQty = trade.totalSellQty;
      let newAvgEntryPrice = trade.avgEntryPrice;
      let newAvgExitPrice = trade.avgExitPrice;
      
      if (side === "BUY") newTotalBuyQty += quantity;
      if (side === "SELL") newTotalSellQty += quantity;

      if (isScaleIn) {
        const existingEntryQty = trade.direction === "LONG" ? trade.totalBuyQty : trade.totalSellQty;
        newAvgEntryPrice = ((existingEntryQty * trade.avgEntryPrice) + (quantity * price)) / (existingEntryQty + quantity);
      } else {
        const existingExitQty = trade.direction === "LONG" ? trade.totalSellQty : trade.totalBuyQty;
        const currentAvgExit = trade.avgExitPrice || 0;
        newAvgExitPrice = ((existingExitQty * currentAvgExit) + (quantity * price)) / (existingExitQty + quantity);
      }

      const totalEntryQty = trade.direction === "LONG" ? newTotalBuyQty : newTotalSellQty;
      const totalExitQty = trade.direction === "LONG" ? newTotalSellQty : newTotalBuyQty;

      let newStatus = trade.status;
      if (totalExitQty > 0) newStatus = "PARTIAL";
      if (totalExitQty >= totalEntryQty) {
        newStatus = "CLOSED";
        if (trade.stopLoss && newAvgExitPrice !== null) {
          if (trade.direction === "LONG" && newAvgExitPrice <= trade.stopLoss) {
            newStatus = "STOP_LOSS_HIT";
          } else if (trade.direction === "SHORT" && newAvgExitPrice >= trade.stopLoss) {
            newStatus = "STOP_LOSS_HIT";
          }
        }
      }

      // 3. Recalculate P&L if exiting
      let grossPnl = trade.grossPnl;
      let netPnl = trade.netPnl;
      let pnlPercentage = trade.pnlPercentage;
      let rMultiple = trade.rMultiple;
      let holdingPeriodMs = trade.holdingPeriodMs;
      let exitDate = trade.exitTime;

      if (totalExitQty > 0) {
        if (trade.direction === "LONG") {
          grossPnl = (newAvgExitPrice! - newAvgEntryPrice) * totalExitQty;
        } else {
          grossPnl = (newAvgEntryPrice - newAvgExitPrice!) * totalExitQty;
        }
        netPnl = grossPnl;
        const investment = newAvgEntryPrice * totalEntryQty;
        pnlPercentage = investment > 0 ? (grossPnl / investment) * 100 : 0;

        if (trade.riskAmount && trade.riskAmount > 0) {
          rMultiple = grossPnl / trade.riskAmount;
        }

        if (newStatus === "CLOSED" || newStatus === "STOP_LOSS_HIT") {
          exitDate = execTime;
          holdingPeriodMs = BigInt(exitDate.getTime() - trade.entryTime.getTime());
        }
      }

      // 4. Update the Trade
      let newEntryTime = trade.entryTime;
      if (execTime < trade.entryTime) {
        newEntryTime = execTime;
      }

      const updatedTrade = await tx.trade.update({
        where: { id: trade.id },
        data: {
          totalBuyQty: newTotalBuyQty,
          totalSellQty: newTotalSellQty,
          avgEntryPrice: newAvgEntryPrice,
          avgExitPrice: newAvgExitPrice,
          status: newStatus,
          grossPnl,
          netPnl,
          pnlPercentage,
          rMultiple,
          exitTime: exitDate,
          entryTime: newEntryTime,
          holdingPeriodMs,
        },
      });

      // 5. Update Position
      const existingPos = await tx.position.findUnique({
        where: { userId_symbol_exchange: { userId, symbol: trade.symbol, exchange: trade.exchange } },
      });

      if (existingPos) {
        const newQty = side === "BUY" ? existingPos.quantity + quantity : existingPos.quantity - quantity;
        
        if (newQty === 0) {
          await tx.position.delete({ where: { id: existingPos.id } });
        } else {
          const newPosAvgPrice = side === "BUY" && newQty > 0 
            ? (existingPos.avgPrice * existingPos.quantity + price * quantity) / newQty 
            : existingPos.avgPrice;
            
          await tx.position.update({
            where: { id: existingPos.id },
            data: { quantity: newQty, avgPrice: newPosAvgPrice },
          });
        }
      }

      return updatedTrade;
    });

    const serializedTrade = {
      ...result,
      holdingPeriodMs: result.holdingPeriodMs ? Number(result.holdingPeriodMs) : null,
    };

    return NextResponse.json(serializedTrade);
  } catch (error) {
    console.error("Add execution error:", error);
    return NextResponse.json(
      { error: "Failed to add execution" },
      { status: 500 }
    );
  }
}
