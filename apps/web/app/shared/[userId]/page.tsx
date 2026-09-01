import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import {
  calculatePerformanceMetrics,
  calculateEquityCurve,
  calculateStrategyPerformance,
  calculateDailyPnl,
} from "@repo/trading-engine";
import KpiCards from "@/components/dashboard/KpiCards";
import OpenPositions from "@/components/dashboard/OpenPositions";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import EquityCurve from "@/components/dashboard/EquityCurve";
import PnlDistribution from "@/components/dashboard/PnlDistribution";
import RecentTrades from "@/components/dashboard/RecentTrades";
import { Suspense } from "react";
import DashboardLoading from "../../(dashboard)/loading";

async function SharedDashboardContent({ userId }: { userId: string }) {
  // Fetch user settings and trades in parallel
  const [userSettings, trades] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.trade.findMany({
      where: { userId, isArchived: false },
      include: {
        mistakes: { include: { mistakeTag: true } },
      },
      orderBy: { entryTime: "desc" },
    }),
  ]);

  const totalCapital = userSettings?.defaultCapital || 500000;

  if (!trades) notFound();

  // Fetch open positions
  const openTrades = trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL");

  // Use database-stored P&L values (live prices will be fetched client-side)
  const enrichedTrades = trades.map((t) => ({
    ...t,
    todayPnl: 0,
  }));

  // Calculate metrics using DB-stored P&L values
  const metrics = calculatePerformanceMetrics(
    enrichedTrades.map((t) => ({
      netPnl: t.netPnl,
      grossPnl: t.grossPnl,
      rMultiple: t.rMultiple,
      holdingPeriodMs: t.holdingPeriodMs,
      status: t.status,
      entryTime: t.entryTime,
      exitTime: t.exitTime,
      strategy: t.strategy,
      avgEntryPrice: t.avgEntryPrice,
      totalBuyQty: t.totalBuyQty,
      totalSellQty: t.totalSellQty,
      todayPnl: t.todayPnl,
    }))
  );

  const equityCurve = calculateEquityCurve(
    enrichedTrades.map((t) => ({
      netPnl: t.netPnl,
      grossPnl: t.grossPnl,
      rMultiple: t.rMultiple,
      holdingPeriodMs: t.holdingPeriodMs,
      status: t.status,
      entryTime: t.entryTime,
      exitTime: t.exitTime,
      strategy: t.strategy,
      avgEntryPrice: t.avgEntryPrice,
    }))
  );

  const strategyPerf = calculateStrategyPerformance(
    enrichedTrades.map((t) => ({
      netPnl: t.netPnl,
      grossPnl: t.grossPnl,
      rMultiple: t.rMultiple,
      holdingPeriodMs: t.holdingPeriodMs,
      status: t.status,
      entryTime: t.entryTime,
      exitTime: t.exitTime,
      strategy: t.strategy,
      avgEntryPrice: t.avgEntryPrice,
    }))
  );

  // Count mistakes
  const allMistakes = trades.flatMap((t) => t.mistakes);
  const mistakeCounts = new Map<string, { name: string; count: number; color: string }>();
  for (const m of allMistakes) {
    const key = m.mistakeTag.name;
    const existing = mistakeCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      mistakeCounts.set(key, {
        name: m.mistakeTag.name,
        count: 1,
        color: m.mistakeTag.color || "#6366F1",
      });
    }
  }
  const topMistakes = [...mistakeCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate total investment
  const openInvestment = openTrades.reduce(
    (sum, t) => sum + t.avgEntryPrice * t.totalBuyQty,
    0
  );

  // Recent trades (last 8)
  const recentTrades = enrichedTrades.slice(0, 8).map((t) => ({
    id: t.id,
    symbol: t.symbol,
    direction: t.direction,
    entryPrice: t.avgEntryPrice,
    exitPrice: t.avgExitPrice,
    rMultiple: t.rMultiple,
    pnl: t.netPnl,
    pnlPercentage: t.pnlPercentage,
    entryTime: t.entryTime.toISOString(),
    status: t.status,
  }));

  // Total risk on open positions
  const totalRisk = openTrades.reduce((sum, t) => {
    if (t.stopLoss && t.avgEntryPrice) {
      const riskPerShare = Math.abs(t.avgEntryPrice - t.stopLoss);
      const openQty = t.totalBuyQty - t.totalSellQty;
      return sum + riskPerShare * openQty;
    }
    return sum;
  }, 0);

  // Calculate all-time investment
  const allTimeInvestment = enrichedTrades.reduce((sum, t) => {
    const entryQty = t.direction === "LONG" ? t.totalBuyQty : t.totalSellQty;
    return sum + (t.avgEntryPrice * entryQty);
  }, 0);
  
  const totalReturnPercent = allTimeInvestment > 0 ? (metrics.totalPnl / allTimeInvestment) * 100 : 0;
  const todayReturnPercent = allTimeInvestment > 0 ? (metrics.todayPnl / allTimeInvestment) * 100 : 0;

  return (
    <>
      <KpiCards
        totalPnl={metrics.totalPnl}
        todayPnl={metrics.todayPnl}
        totalCapital={totalCapital}
        availableCapital={totalCapital - openInvestment}
        totalInvestment={openInvestment}
        totalRisk={totalRisk}
        winRate={metrics.winRate}
        totalTrades={metrics.totalTrades}
        totalReturnPercent={totalReturnPercent}
        todayReturnPercent={todayReturnPercent}
      />

      {/* Open Positions */}
      {openTrades.length > 0 && (
        <OpenPositions
          positions={openTrades.map((t) => ({
            id: t.id,
            symbol: t.symbol,
            exchange: t.exchange,
            direction: t.direction,
            avgEntryPrice: t.avgEntryPrice,
            quantity: t.totalBuyQty - t.totalSellQty,
            stopLoss: t.stopLoss,
            target: t.target,
            entryTime: t.entryTime.toISOString(),
            pnlPercent: t.pnlPercentage,
          }))}
        />
      )}

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid mt-6">
        {/* Performance Overview */}
        <div className="col-span-4">
          <PerformanceOverview metrics={metrics} />
        </div>

        {/* Equity Curve */}
        <div className="col-span-5">
          <EquityCurve
            data={equityCurve.map((p) => ({
              date: p.date.toISOString().split("T")[0],
              equity: p.cumulativePnl,
            }))}
          />
        </div>

        {/* P&L Distribution */}
        <div className="col-span-3">
          <PnlDistribution
            totalTrades={metrics.totalTrades}
            winningTrades={metrics.winningTrades}
            losingTrades={metrics.losingTrades}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-grid mt-4">
        {/* Recent Trades */}
        <div className="col-span-12">
          <RecentTrades trades={recentTrades} />
        </div>
      </div>
    </>
  );
}

export default async function SharedDashboardPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <SharedDashboardContent userId={userId} />
    </Suspense>
  );
}
