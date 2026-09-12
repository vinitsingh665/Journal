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
    const dailyPnl = new Map<string, number>(); // "YYYY-MM-DD" → total pnl

    for (const t of trades) {
      if (t.status === "OPEN" || t.status === "PARTIAL" || !t.exitTime) continue;
      const d = new Date(t.exitTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dailyPnl.set(key, (dailyPnl.get(key) ?? 0) + t.netPnl);
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

        // Determine baseline entry price
        // For foreign trades where trade.avgEntryPrice is stored in INR:
        const firstHist = symbolHistory.get(entryDateKey) ?? Array.from(symbolHistory.values())[0];
        const entryUsdInr = firstHist?.usdInrRate ?? 84;
        const entryPriceNative = needsConversion
          ? trade.avgEntryPrice / entryUsdInr
          : trade.avgEntryPrice;

        const sortedDates = [...symbolHistory.keys()].sort();
        let prevPrice = entryPriceNative;

        for (const dateKey of sortedDates) {
          if (dateKey < entryDateKey) {
            const hist = symbolHistory.get(dateKey)!;
            prevPrice = needsConversion ? hist.closeUSD : hist.closeINR;
            continue;
          }

          const hist = symbolHistory.get(dateKey)!;
          const currentPrice = needsConversion ? hist.closeUSD : hist.closeINR;

          // Daily price move
          const dailyPriceMove =
            trade.direction === "LONG"
              ? currentPrice - prevPrice
              : prevPrice - currentPrice;

          const dailyChangeNative = dailyPriceMove * openQty;

          // Convert to base currency (INR)
          const usdInrRate = needsConversion ? hist.usdInrRate : 1;
          const dailyChangeBase = dailyChangeNative * usdInrRate;

          dailyPnl.set(dateKey, (dailyPnl.get(dateKey) ?? 0) + dailyChangeBase);
          prevPrice = currentPrice;
        }
      }
    }

    // ── Step 3: Fill all calendar days from earliest to today ─────────────────
    if (dailyPnl.size > 0) {
      const sortedAll = [...dailyPnl.keys()].sort();
      const [sy, sm, sd] = sortedAll[0].split("-").map(Number);
      const start = new Date(Date.UTC(sy, sm - 1, sd));
      const end = new Date();
      const cursor = new Date(start);

      while (cursor <= end) {
        const key = formatDateKey(cursor);
        if (!dailyPnl.has(key)) dailyPnl.set(key, 0);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }

    const days = [...dailyPnl.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, pnl]) => ({ date, pnl: Math.round(pnl) }));

    return NextResponse.json({ days, count: days.length });
  } catch (error: any) {
    console.error("[daily-pnl] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
