import { Suspense } from "react";
import DashboardLoading from "../loading";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import JournalList from "@/components/journal/JournalList";

async function JournalContent() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const [trades, userSettings] = await Promise.all([
    prisma.trade.findMany({
      where: { userId },
      include: {
        executions: { orderBy: { executionTime: "asc" } },
        mistakes: { include: { mistakeTag: true } },
      },
      orderBy: { entryTime: "desc" },
    }),
    prisma.userSettings.findUnique({ where: { userId } }),
  ]);

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

  return <JournalList trades={serialized} />;
}

export default function JournalPage() {
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
      <Suspense fallback={<DashboardLoading />}>
        <JournalContent />
      </Suspense>
    </>
  );
}
