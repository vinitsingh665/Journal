import { Suspense } from "react";
import DashboardLoading from "../loading";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

async function AnalyticsContent() {
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
      stopLoss: true,
      entryTime: true,
      exitTime: true,
      holdingPeriodMs: true,
    },
    orderBy: { entryTime: "asc" },
  });

  // Use DB-stored P&L values (live prices fetched client-side)
  const serializedTrades = trades.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    exchange: t.exchange,
    status: t.status,
    direction: t.direction,
    avgEntryPrice: t.avgEntryPrice,
    totalBuyQty: t.totalBuyQty,
    totalSellQty: t.totalSellQty,
    stopLoss: t.stopLoss,
    setup: t.setup,
    netPnl: t.netPnl,
    grossPnl: t.grossPnl,
    rMultiple: t.rMultiple,
    entryTime: t.entryTime.toISOString(),
    exitTime: t.exitTime?.toISOString() || t.entryTime.toISOString(),
    holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
  }));

  return <AnalyticsDashboard initialTrades={serializedTrades as any} />;
}

export default function AnalyticsPage() {
  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description text-muted">Deep dive into your trading performance.</p>
        </div>
      </div>
      <Suspense fallback={<DashboardLoading />}>
        <AnalyticsContent />
      </Suspense>
    </>
  );
}
