import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { fetchMultipleQuotes } from "@/lib/finance";

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
        isArchived: false,
      },
    });

    if (openTrades.length === 0) {
      return NextResponse.json({ success: true, message: "No open trades with stop loss found" });
    }

    // Group unique symbols and fetch all users' base currencies
    const uniqueUserIds = [...new Set(openTrades.map(t => t.userId))];
    const userSettingsMap = new Map<string, string>();
    for (const userId of uniqueUserIds) {
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      userSettingsMap.set(userId, settings?.currency || "INR");
    }

    // Group trades by base currency so we can batch fetch with the correct target currency
    const tradesByCurrency = new Map<string, typeof openTrades>();
    for (const trade of openTrades) {
      const currency = userSettingsMap.get(trade.userId) || "INR";
      if (!tradesByCurrency.has(currency)) tradesByCurrency.set(currency, []);
      tradesByCurrency.get(currency)!.push(trade);
    }

    const closedTrades: string[] = [];

    for (const [baseCurrency, trades] of tradesByCurrency) {
      // Fetch all quotes for this currency group via TradingView (already handles USDT→USD→INR)
      const uniqueSymbols = [
        ...new Map(trades.map(t => [
          `${t.symbol}:${t.exchange}`,
          { symbol: t.symbol, exchange: t.exchange }
        ])).values()
      ];

      const quotes = await fetchMultipleQuotes(uniqueSymbols, baseCurrency);

      for (const trade of trades) {
        const quote = quotes.get(`${trade.symbol}:${trade.exchange}`);
        if (!quote || !trade.stopLoss) continue;

        // SAFETY: Skip if currency conversion failed (quote still in different currency than base)
        // This prevents false SL triggers from comparing prices in different currencies.
        const quoteCurrency = quote.currency?.toUpperCase();
        if (quoteCurrency && quoteCurrency !== baseCurrency.toUpperCase()) {
          console.warn(
            `[cron/stop-loss] Skipping ${trade.symbol}: quote currency "${quoteCurrency}" ≠ base currency "${baseCurrency}". Forex conversion likely failed.`
          );
          continue;
        }

        const livePrice = quote.regularMarketPrice;
        const isLong = trade.direction === "LONG";

        // Check SL / Target hit
        const slHit = trade.stopLoss !== null && (isLong ? livePrice <= trade.stopLoss : livePrice >= trade.stopLoss);
        const targetHit = trade.target !== null && (isLong ? livePrice >= trade.target : livePrice <= trade.target);

        if (!slHit && !targetHit) continue;

        const exitPrice = slHit ? trade.stopLoss! : trade.target!;
        const hitType = slHit ? "Stop Loss" : "Target";
        const newStatus = slHit ? "STOP_LOSS_HIT" : "CLOSED";

        const openQty = trade.totalBuyQty - trade.totalSellQty;
        if (openQty <= 0) continue; // safety check

        const exitSide = isLong ? "SELL" : "BUY";
        const exitTime = new Date();

        await prisma.$transaction(async (tx) => {
          // 1. Create exit execution
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
              productType: "CNC",
              orderStatus: "COMPLETE",
              executionTime: exitTime,
              fingerprint: `auto-${slHit ? "sl" : "tp"}-${Date.now()}-${trade.id}`,
            },
          });

          // 2. P&L calculation using openQty (not totalBuyQty)
          const grossPnl = isLong
            ? (exitPrice - trade.avgEntryPrice) * openQty
            : (trade.avgEntryPrice - exitPrice) * openQty;

          const investment = trade.avgEntryPrice * openQty;
          const pnlPercentage = investment > 0 ? (grossPnl / investment) * 100 : 0;

          let rMultiple = trade.rMultiple;
          if (trade.riskAmount && trade.riskAmount > 0) {
            rMultiple = grossPnl / trade.riskAmount;
          }

          const holdingPeriodMs = exitTime.getTime() - trade.entryTime.getTime();

          const newBuyQty = isLong ? trade.totalBuyQty : trade.totalBuyQty + openQty;
          const newSellQty = isLong ? trade.totalSellQty + openQty : trade.totalSellQty;

          // 3. Update trade
          await tx.trade.update({
            where: { id: trade.id },
            data: {
              status: newStatus,
              totalBuyQty: newBuyQty,
              totalSellQty: newSellQty,
              avgExitPrice: exitPrice,
              grossPnl,
              netPnl: grossPnl,
              pnlPercentage,
              rMultiple,
              exitTime,
              holdingPeriodMs,
            },
          });

          // 4. Log trade event
          await tx.tradeEvent.create({
            data: {
              tradeId: trade.id,
              type: "AUTO_CLOSED",
              description: `Auto-closed by ${hitType} hit at ${exitPrice.toFixed(2)} (via TradingView)`,
            },
          });

          // 5. Update or delete position
          const existingPos = await tx.position.findUnique({
            where: {
              userId_symbol_exchange: {
                userId: trade.userId,
                symbol: trade.symbol,
                exchange: trade.exchange,
              },
            },
          });

          if (existingPos) {
            const newPosQty = exitSide === "BUY"
              ? existingPos.quantity + openQty
              : existingPos.quantity - openQty;

            if (newPosQty <= 0) {
              await tx.position.delete({ where: { id: existingPos.id } });
            } else {
              await tx.position.update({
                where: { id: existingPos.id },
                data: { quantity: newPosQty },
              });
            }
          }
        });

        closedTrades.push(`${trade.symbol} (${hitType})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${openTrades.length} trades. Closed ${closedTrades.length}: ${closedTrades.join(", ")}`,
    });
  } catch (error: any) {
    console.error("Stop loss cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
