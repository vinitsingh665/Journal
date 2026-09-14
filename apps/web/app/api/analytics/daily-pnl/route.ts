import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";

/**
 * Format Date object to "YYYY-MM-DD"
 */
function formatDateKey(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * GET /api/analytics/daily-pnl
 *
 * Returns daily P&L including:
 * - Realized P&L: booked on exit date of each closed trade
 * - Unrealized MTM: daily price movement × quantity for each OPEN trade
 *
 * All values returned in user's base currency (INR for Indian users).
 * Uses persisted PriceHistory records from DB for instant response time.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryUserId = searchParams.get("userId");

  // Accept a userId query param (for shared pages with no session) or fall back to session
  const userId = queryUserId || (await getCurrentUser());
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [trades, userSettings] = await Promise.all([
      prisma.trade.findMany({
        where: { userId, isArchived: false },
        select: {
          id: true,
          symbol: true,
          exchange: true,
          direction: true,
          status: true,
          avgEntryPrice: true,
          totalBuyQty: true,
          totalSellQty: true,
          netPnl: true,
          entryTime: true,
          exitTime: true,
        },
      }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    const baseCurrency = userSettings?.currency ?? "INR";

    if (trades.length === 0) {
      return NextResponse.json({ days: [] });
    }

    // ── Step 1: Realized P&L per day (closed trades) ──────────────────────────
    const perTradeDailyPnl = new Map<string, Map<string, number>>();
    const getTradeMap = (id: string) => {
      if (!perTradeDailyPnl.has(id)) perTradeDailyPnl.set(id, new Map());
      return perTradeDailyPnl.get(id)!;
    };

    for (const t of trades) {
      if (t.status === "OPEN" || t.status === "PARTIAL" || !t.exitTime) continue;
      const d = new Date(t.exitTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const tMap = getTradeMap(t.id);
      tMap.set(key, (tMap.get(key) ?? 0) + t.netPnl);
    }

    // ── Step 2: Daily MTM for OPEN trades ─────────────────────────────────────
    const openTrades = trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL");

    if (openTrades.length > 0) {
      const symbols = [...new Set(openTrades.map((t) => t.symbol))];

      // Query PriceHistory from DB
      const priceRecords = await prisma.priceHistory.findMany({
        where: {
          symbol: { in: symbols },
        },
        orderBy: { date: "asc" },
      });

      // Group price records by symbol: Map<symbol, Map<dateKey, { closeUSD, closeINR, usdInrRate }>>
      const historyBySymbol = new Map<string, Map<string, { closeUSD: number; closeINR: number; usdInrRate: number }>>();
      for (const rec of priceRecords) {
        if (!historyBySymbol.has(rec.symbol)) {
          historyBySymbol.set(rec.symbol, new Map());
        }
        const key = formatDateKey(new Date(rec.date));
        historyBySymbol.get(rec.symbol)!.set(key, {
          closeUSD: rec.closeUSD,
          closeINR: rec.closeINR,
          usdInrRate: rec.usdInrRate,
        });
      }

      for (const trade of openTrades) {
        const symbolHistory = historyBySymbol.get(trade.symbol);
        if (!symbolHistory || symbolHistory.size === 0) continue;

        const openQty =
          trade.direction === "LONG"
            ? trade.totalBuyQty - trade.totalSellQty
            : trade.totalSellQty - trade.totalBuyQty;

        if (openQty <= 0) continue;

        const isForeign = ["NASDAQ", "NYSE", "CRYPTO"].includes(trade.exchange.toUpperCase());
        const needsConversion = isForeign && baseCurrency === "INR";

        const entryDate = new Date(trade.entryTime);
        const entryDateKey = formatDateKey(entryDate);

        // Determine baseline entry price in Base Currency (INR)
        // trade.avgEntryPrice is already in INR for foreign trades!
        const entryPriceBase = trade.avgEntryPrice;

        const sortedDates = [...symbolHistory.keys()].sort();
        let prevPriceBase = entryPriceBase;
        const tMap = getTradeMap(trade.id);

        for (const dateKey of sortedDates) {
          if (dateKey < entryDateKey) {
            const hist = symbolHistory.get(dateKey)!;
            prevPriceBase = hist.closeINR;
            continue;
          }

          const hist = symbolHistory.get(dateKey)!;
          const currentPriceBase = hist.closeINR;

          // Daily price move in base currency (INR)
          const dailyPriceMoveBase =
            trade.direction === "LONG"
              ? currentPriceBase - prevPriceBase
              : prevPriceBase - currentPriceBase;

          const dailyChangeBase = dailyPriceMoveBase * openQty;

          tMap.set(dateKey, (tMap.get(dateKey) ?? 0) + dailyChangeBase);

          prevPriceBase = currentPriceBase;
        }
      }
    }

    const tradesResult: Record<string, { date: string; pnl: number }[]> = {};
    for (const [tradeId, pnlMap] of perTradeDailyPnl.entries()) {
      tradesResult[tradeId] = [...pnlMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, pnl]) => ({ date, pnl: Math.round(pnl) }));
    }

    return NextResponse.json({ trades: tradesResult });
  } catch (error: any) {
    console.error("[daily-pnl] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
