import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { fetchStockQuote } from "@/lib/yahoo-finance";

// This route can be called by Vercel Cron or a frontend poller
export async function GET(request: Request) {
  // Optional: Verify Vercel Cron Secret if you want to secure it in production
  // const authHeader = request.headers.get('authorization');
  // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const openTrades = await prisma.trade.findMany({
      where: {
        status: { in: ["OPEN", "PARTIAL"] },
        stopLoss: { not: null },
      },
    });

    if (openTrades.length === 0) {
      return NextResponse.json({ success: true, message: "No open trades with stop loss found" });
    }

    const uniqueSymbols = Array.from(new Set(openTrades.map(t => `${t.symbol}:${t.exchange}`)));
    const quotes = new Map();

    // Fetch live quotes
    for (const key of uniqueSymbols) {
      const [symbol, exchange] = key.split(":");
      const quote = await fetchStockQuote(symbol, exchange);
      if (quote && quote.regularMarketPrice) {
        quotes.set(key, quote.regularMarketPrice);
      }
    }

    const closedTrades = [];

    for (const trade of openTrades) {
      const livePrice = quotes.get(`${trade.symbol}:${trade.exchange}`);
      if (!livePrice || !trade.stopLoss) continue;

      let isHit = false;
      if (trade.direction === "LONG" && livePrice <= trade.stopLoss) {
        isHit = true;
      } else if (trade.direction === "SHORT" && livePrice >= trade.stopLoss) {
        isHit = true;
      }

      if (isHit) {
        // Auto-close trade
        const openQty = trade.direction === "LONG" 
          ? trade.totalBuyQty - trade.totalSellQty 
          : trade.totalSellQty - trade.totalBuyQty;
          
        if (openQty <= 0) continue; // safety check

        const exitSide = trade.direction === "LONG" ? "SELL" : "BUY";
        const exitTime = new Date();
        const exitPrice = livePrice;

        await prisma.$transaction(async (tx) => {
          // 1. Create Execution
          await tx.execution.create({
            data: {
              userId: trade.userId,
              tradeId: trade.id,
              symbol: trade.symbol,
              exchange: trade.exchange,
              side: exitSide,
              quantity: openQty,
              executedQty: openQty,
              price: exitPrice,
              avgPrice: exitPrice,
              orderType: "MARKET",
              productType: "CNC", // Default fallback
              orderStatus: "COMPLETE",
              executionTime: exitTime,
              fingerprint: `auto-sl-${Date.now()}-${trade.id}`,
            },
          });

          // 2. Update Trade Quantities
          let newBuyQty = trade.totalBuyQty;
          let newSellQty = trade.totalSellQty;
          
          if (exitSide === "BUY") newBuyQty += openQty;
          else newSellQty += openQty;
          
          // Re-calculate averages (simplified for exit)
          const allExecs = await tx.execution.findMany({ where: { tradeId: trade.id } });
          let totalBuyValue = 0;
          let totalSellValue = 0;
          let actualBuyQty = 0;
          let actualSellQty = 0;
          
          allExecs.forEach(e => {
            if (e.side === "BUY") { actualBuyQty += e.quantity; totalBuyValue += (e.quantity * e.price); }
            else { actualSellQty += e.quantity; totalSellValue += (e.quantity * e.price); }
          });

          const newAvgEntry = trade.direction === "LONG" 
            ? (actualBuyQty ? totalBuyValue / actualBuyQty : 0) 
            : (actualSellQty ? totalSellValue / actualSellQty : 0);
          
          const newAvgExit = trade.direction === "LONG" 
            ? (actualSellQty ? totalSellValue / actualSellQty : null) 
            : (actualBuyQty ? totalBuyValue / actualBuyQty : null);

          // 3. P&L Calc
          let grossPnl = 0;
          const totalEntryQty = trade.direction === "LONG" ? actualBuyQty : actualSellQty;
          const totalExitQty = trade.direction === "LONG" ? actualSellQty : actualBuyQty;

          if (totalExitQty > 0) {
            if (trade.direction === "LONG") {
              grossPnl = (newAvgExit! - newAvgEntry) * totalExitQty;
            } else {
              grossPnl = (newAvgEntry - newAvgExit!) * totalExitQty;
            }
          }

          const investment = newAvgEntry * totalEntryQty;
          const pnlPercentage = investment > 0 ? (grossPnl / investment) * 100 : 0;
          let rMultiple = trade.rMultiple;
          if (trade.riskAmount && trade.riskAmount > 0) {
            rMultiple = grossPnl / trade.riskAmount;
          }

          const holdingPeriodMs = exitTime.getTime() - trade.entryTime.getTime();

          // 4. Update Trade
          await tx.trade.update({
            where: { id: trade.id },
            data: {
              status: "STOP_LOSS_HIT",
              totalBuyQty: newBuyQty,
              totalSellQty: newSellQty,
              avgEntryPrice: newAvgEntry,
              avgExitPrice: newAvgExit,
              grossPnl,
              netPnl: grossPnl,
              pnlPercentage,
              rMultiple,
              exitTime,
              holdingPeriodMs,
            }
          });

          // 5. Update or Delete Position
          const existingPos = await tx.position.findUnique({
            where: { userId_symbol_exchange: { userId: trade.userId, symbol: trade.symbol, exchange: trade.exchange } },
          });

          if (existingPos) {
            const newPosQty = exitSide === "BUY" ? existingPos.quantity + openQty : existingPos.quantity - openQty;
            
            if (newPosQty === 0) {
              await tx.position.delete({ where: { id: existingPos.id } });
            } else {
              const newPosAvgPrice = exitSide === "BUY" && newPosQty > 0 
                ? (existingPos.avgPrice * existingPos.quantity + exitPrice * openQty) / newPosQty 
                : existingPos.avgPrice;
                
              await tx.position.update({
                where: { id: existingPos.id },
                data: { quantity: newPosQty, avgPrice: newPosAvgPrice },
              });
            }
          }
        });
        
        closedTrades.push(trade.symbol);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Checked ${openTrades.length} trades. Closed ${closedTrades.length} trades: ${closedTrades.join(", ")}` 
    });
  } catch (error: any) {
    console.error("Stop loss cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
