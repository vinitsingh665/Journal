import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { prisma } from "@repo/database";
import { fetchMultipleQuotes, calculateUnrealizedPnl } from "@/lib/yahoo-finance";
import TradesList from "@/components/trades/TradesList";

async function SharedTradesContent({ userId }: { userId: string }) {
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  const baseCurrency = userSettings?.currency || "INR";

  const trades = await prisma.trade.findMany({
    where: { userId, isArchived: false },
    include: {
      mistakes: { include: { mistakeTag: true } },
      executions: { orderBy: { executionTime: "asc" } },
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
      const quotes = await fetchMultipleQuotes(uniqueSymbols, baseCurrency);
      liveQuotes = quotes;
    }
  } catch (e) {
    console.error("Failed to fetch live quotes for trades:", e);
  }

  // Enrich trades with live P&L for open positions
  const serializedTrades = trades.map((t) => {
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
      stopLoss: t.stopLoss,
      target: t.target,
      marketCondition: t.marketCondition,
      notes: t.notes,
      entryTime: t.entryTime.toISOString(),
      exitTime: t.exitTime?.toISOString() || null,
      holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
      mistakes: t.mistakes.map((m) => ({ name: m.mistakeTag.name, color: m.mistakeTag.color })),
      executions: t.executions.map((e) => ({
        id: e.id,
        side: e.side,
        quantity: e.quantity,
        price: e.price,
        executionTime: e.executionTime.toISOString(),
      })),
    };
  });

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Trades</h1>
          <p className="page-description text-muted">
            All executed trades. Review each trade and learn from it.
          </p>
        </div>
      </div>
      <TradesList trades={serializedTrades} />
    </>
  );
}

export default async function SharedTradesPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedTradesContent userId={userId} />
    </Suspense>
  );
}
