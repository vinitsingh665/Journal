import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { prisma } from "@repo/database";
import JournalList from "@/components/journal/JournalList";

async function SharedJournalContent({ userId }: { userId: string }) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    include: {
      executions: { orderBy: { executionTime: "asc" } },
      mistakes: { include: { mistakeTag: true } },
    },
    orderBy: { entryTime: "desc" },
  });

  // Use DB-stored P&L values (live prices fetched client-side)
  const serialized = trades.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    exchange: t.exchange,
    direction: t.direction,
    status: t.status,
    avgEntryPrice: t.avgEntryPrice,
    avgExitPrice: t.avgExitPrice,
    totalBuyQty: t.totalBuyQty,
    totalSellQty: t.totalSellQty,
    netPnl: t.netPnl,
    pnlPercentage: t.pnlPercentage,
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
  }));

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Trading Journal</h1>
          <p className="page-description text-muted">
            Detailed log of trades, thoughts and learnings.
          </p>
        </div>
      </div>
      <JournalList trades={serialized} />
    </>
  );
}

export default async function SharedJournalPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedJournalContent userId={userId} />
    </Suspense>
  );
}
