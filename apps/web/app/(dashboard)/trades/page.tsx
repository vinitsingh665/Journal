import { Suspense } from "react";
import DashboardLoading from "../loading";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchMultipleQuotes, calculateUnrealizedPnl } from "@/lib/finance";
import TradesList from "@/components/trades/TradesList";
import DhanSyncButton from "@/components/trades/DhanSyncButton";

async function TradesContent() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const trades = await prisma.trade.findMany({
    where: { userId, isArchived: false },
    include: {
      mistakes: { include: { mistakeTag: true } },
      executions: { orderBy: { executionTime: "asc" } },
    },
    orderBy: { entryTime: "desc" },
  });

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  const baseCurrency = userSettings?.currency || "INR";

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

  return <TradesList trades={serializedTrades} />;
}

export default function TradesPage() {
  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Trades</h1>
          <p className="page-description text-muted">
            All your executed trades. Review each trade and learn from it.
          </p>
        </div>
        <div className="page-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* <DhanSyncButton /> */}
          <Link href="/import" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import CSV
          </Link>
          <Link href="/trades/new" className="btn btn-primary">
            + Add Trade
          </Link>
        </div>
      </div>
      <Suspense fallback={<DashboardLoading />}>
        <TradesContent />
      </Suspense>
    </>
  );
}
