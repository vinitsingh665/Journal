import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

async function SharedAnalyticsContent({ userId }: { userId: string }) {
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

  if (!trades || trades.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <p className="text-muted">No trades found for this user.</p>
      </div>
    );
  }

  // Use DB-stored P&L values (live prices fetched client-side)
  const serializedTrades = trades.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    direction: t.direction,
    setup: t.setup,
    netPnl: t.netPnl,
    grossPnl: t.grossPnl,
    rMultiple: t.rMultiple,
    entryTime: t.entryTime.toISOString(),
    exitTime: t.exitTime?.toISOString() || t.entryTime.toISOString(),
    holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
  }));

  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-description text-muted">Deep dive into trading performance.</p>
        </div>
      </div>
      <AnalyticsDashboard initialTrades={serializedTrades as any} />
    </>
  );
}

export default async function SharedAnalyticsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedAnalyticsContent userId={userId} />
    </Suspense>
  );
}
