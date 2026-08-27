import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchMultipleQuotes, calculateUnrealizedPnl } from "@/lib/yahoo-finance";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const trades = await prisma.trade.findMany({
    where: { userId },
    select: {
      id: true,
      symbol: true,
      exchange: true,
      status: true,
      direction: true,
      avgEntryPrice: true,
      totalBuyQty: true,
      totalSellQty: true,
      setup: true,
      netPnl: true,
      grossPnl: true,
      rMultiple: true,
      entryTime: true,
      exitTime: true,
      holdingPeriodMs: true,
    },
    orderBy: { entryTime: "asc" },
  });

  const openTrades = trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL");
  const uniqueSymbols = [
    ...new Set(openTrades.map((t) => JSON.stringify({ symbol: t.symbol, exchange: t.exchange }))),
  ].map((s) => JSON.parse(s) as { symbol: string; exchange: string });

  let liveQuotes = new Map<string, { regularMarketPrice: number }>();
  try {
    if (uniqueSymbols.length > 0) {
      liveQuotes = await fetchMultipleQuotes(uniqueSymbols);
    }
  } catch (e) {
    console.error("Failed to fetch live quotes for analytics:", e);
  }

  const serializedTrades = trades.map((t) => {
    let netPnl = t.netPnl;
    if (t.status === "OPEN" || t.status === "PARTIAL") {
      const quote = liveQuotes.get(`${t.symbol}:${t.exchange}`);
      if (quote) {
        const openQty = t.totalBuyQty - t.totalSellQty;
        if (openQty > 0) {
          const { pnl } = calculateUnrealizedPnl(t.avgEntryPrice, quote.regularMarketPrice, openQty, t.direction as "LONG" | "SHORT");
          netPnl = pnl;
        }
      }
    }

    return {
      id: t.id,
      symbol: t.symbol,
      direction: t.direction,
      setup: t.setup,
      netPnl,
      grossPnl: t.grossPnl,
      rMultiple: t.rMultiple,
      entryTime: t.entryTime.toISOString(),
      exitTime: t.exitTime?.toISOString() || t.entryTime.toISOString(),
      holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
    };
  });

  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description text-muted">Deep dive into your trading performance.</p>
        </div>
      </div>
      <AnalyticsDashboard initialTrades={serializedTrades as any} />
    </>
  );
}
