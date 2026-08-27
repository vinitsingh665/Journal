import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchMultipleQuotes, calculateUnrealizedPnl } from "@/lib/yahoo-finance";
import JournalList from "@/components/journal/JournalList";

export default async function JournalPage() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const trades = await prisma.trade.findMany({
    where: { userId },
    include: {
      executions: { orderBy: { executionTime: "asc" } },
      mistakes: { include: { mistakeTag: true } },
    },
    orderBy: { entryTime: "desc" },
  });

  // Fetch live prices for open positions
  const openTrades = trades.filter(
    (t) => t.status === "OPEN" || t.status === "PARTIAL"
  );
  const uniqueSymbols = [
    ...new Set(
      openTrades.map((t) =>
        JSON.stringify({ symbol: t.symbol, exchange: t.exchange })
      )
    ),
  ].map((s) => JSON.parse(s) as { symbol: string; exchange: string });

  let liveQuotes = new Map<
    string,
    { regularMarketPrice: number }
  >();

  try {
    if (uniqueSymbols.length > 0) {
      const quotes = await fetchMultipleQuotes(uniqueSymbols);
      liveQuotes = quotes;
    }
  } catch (e) {
    console.error("Failed to fetch live quotes for journal:", e);
  }

  const serialized = trades.map((t) => {
    const isOpen = t.status === "OPEN" || t.status === "PARTIAL";
    let netPnl = t.netPnl;
    let pnlPercentage = t.pnlPercentage;

    if (isOpen) {
      const quoteKey = `${t.symbol}:${t.exchange}`;
      const quote = liveQuotes.get(quoteKey);
      if (quote) {
        const openQty = t.totalBuyQty - t.totalSellQty;
        if (openQty > 0) {
          const direction = t.direction as "LONG" | "SHORT";
          const { pnl, pnlPercent } = calculateUnrealizedPnl(
            t.avgEntryPrice,
            quote.regularMarketPrice,
            openQty,
            direction
          );
          netPnl = pnl;
          pnlPercentage = pnlPercent;
        }
      }
    }

    return {
      id: t.id,
      symbol: t.symbol,
      exchange: t.exchange,
      direction: t.direction,
      status: t.status,
      avgEntryPrice: t.avgEntryPrice,
      avgExitPrice: t.avgExitPrice,
      totalBuyQty: t.totalBuyQty,
      totalSellQty: t.totalSellQty,
      netPnl,
      pnlPercentage,
      rMultiple: t.rMultiple,
      strategy: t.strategy,
      setup: t.setup,
      thesis: t.thesis,
      stopLoss: t.stopLoss,
      target: t.target,
      marketCondition: t.marketCondition,
      confidence: t.confidence,
      notes: t.notes,
      postTradeReview: t.postTradeReview,
      entryTime: t.entryTime.toISOString(),
      exitTime: t.exitTime?.toISOString() || null,
      holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
      totalCharges: t.totalCharges,
      riskAmount: t.riskAmount,
    mistakes: t.mistakes.map((m) => ({
      name: m.mistakeTag.name,
      color: m.mistakeTag.color,
    })),
    executionCount: t.executions.length,
  };
  });

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-description text-muted">
            Document your trades, thoughts and learnings.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/trades/new" className="btn btn-primary">
            + New Entry
          </Link>
        </div>
      </div>
      <JournalList trades={serialized} />
    </>
  );
}
