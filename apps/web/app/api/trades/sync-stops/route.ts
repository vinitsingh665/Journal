import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { fetchMultipleQuotes } from "@/lib/yahoo-finance";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch open trades with stop loss set
    const openTrades = await prisma.trade.findMany({
      where: {
        userId,
        status: { in: ["OPEN", "PARTIAL"] },
        isArchived: false,
        stopLoss: { not: null },
      },
    });

    if (openTrades.length === 0) {
      return NextResponse.json({ closedCount: 0 });
    }

    // 2. Fetch live prices
    const uniqueSymbols = [
      ...new Set(openTrades.map((t) => JSON.stringify({ symbol: t.symbol, exchange: t.exchange }))),
    ].map((s) => JSON.parse(s) as { symbol: string; exchange: string });

    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    const quotes = await fetchMultipleQuotes(uniqueSymbols, baseCurrency);

    // 3. Check for hits
    let closedCount = 0;

    for (const trade of openTrades) {
      const quote = quotes.get(`${trade.symbol}:${trade.exchange}`);
      if (!quote || !trade.stopLoss) continue;

      const currentPrice = quote.regularMarketPrice;
      const isLong = trade.direction === "LONG";
      
      // Stop loss hit condition
      const slHit = isLong ? currentPrice <= trade.stopLoss : currentPrice >= trade.stopLoss;

      if (slHit) {
        // Close the trade!
        const openQty = trade.totalBuyQty - trade.totalSellQty;
        const exitTime = new Date();

        await prisma.$transaction(async (tx) => {
          // 1. Create exit execution
          const execution = await tx.execution.create({
            data: {
              userId,
              fingerprint: `auto-sl-${trade.id}-${Date.now()}`,
              symbol: trade.symbol,
              exchange: trade.exchange,
              side: isLong ? "SELL" : "BUY",
              quantity: openQty,
              executedQty: openQty,
              price: trade.stopLoss!, // execute at the stop loss price
              avgPrice: trade.stopLoss!,
              executionTime: exitTime,
              tradeId: trade.id,
            },
          });

          // 2. Update trade status
          const totalBuyQty = isLong ? trade.totalBuyQty : trade.totalBuyQty + openQty;
          const totalSellQty = isLong ? trade.totalSellQty + openQty : trade.totalSellQty;
          
          let grossPnl = 0;
          let netPnl = 0;
          let pnlPercentage = 0;

          if (isLong) {
            grossPnl = (trade.stopLoss! - trade.avgEntryPrice) * totalBuyQty;
          } else {
            grossPnl = (trade.avgEntryPrice - trade.stopLoss!) * totalSellQty;
          }
          netPnl = grossPnl;
          const investment = trade.avgEntryPrice * (isLong ? totalBuyQty : totalSellQty);
          pnlPercentage = investment > 0 ? (grossPnl / investment) * 100 : 0;
          
          const holdingPeriodMs = BigInt(exitTime.getTime() - trade.entryTime.getTime());
          
          let rMultiple = null;
          if (trade.riskAmount && trade.riskAmount > 0) {
            rMultiple = grossPnl / trade.riskAmount;
          }

          await tx.trade.update({
            where: { id: trade.id },
            data: {
              status: "CLOSED",
              totalBuyQty,
              totalSellQty,
              avgExitPrice: trade.stopLoss!,
              exitTime,
              grossPnl,
              netPnl,
              pnlPercentage,
              holdingPeriodMs,
              rMultiple,
            },
          });

          // 3. Log event
          await tx.tradeEvent.create({
            data: {
              tradeId: trade.id,
              type: "AUTO_CLOSED",
              description: `Auto-closed by Stop Loss hit at ${trade.stopLoss}`,
            },
          });

          // 4. Update Position
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
            if (existingPos.quantity <= openQty) {
              await tx.position.delete({ where: { id: existingPos.id } });
            } else {
              await tx.position.update({
                where: { id: existingPos.id },
                data: { quantity: existingPos.quantity - openQty },
              });
            }
          }
        });

        closedCount++;
      }
    }

    return NextResponse.json({ success: true, closedCount });
  } catch (error) {
    console.error("Sync stops error:", error);
    return NextResponse.json({ error: "Failed to sync stops" }, { status: 500 });
  }
}
