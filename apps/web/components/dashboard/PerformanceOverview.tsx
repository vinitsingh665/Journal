"use client";

import { useMemo } from "react";
import { formatINR, formatPercent, cn } from "@/lib/utils";
import { useEnrichedPnl } from "@/hooks/useEnrichedPnl";
import { calculatePerformanceMetrics } from "@repo/trading-engine";
import type { PerformanceMetrics } from "@repo/trading-engine";

interface RawTrade {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  status: string;
  avgEntryPrice: number;
  totalBuyQty: number;
  totalSellQty: number;
  grossPnl: number;
  netPnl: number;
  rMultiple: number | null;
  holdingPeriodMs: number | null;
  entryTime: string;
  exitTime: string | null;
  strategy: string | null;
  stopLoss: number | null;
}

export default function PerformanceOverview({
  metrics: serverMetrics,
  allTrades,
}: {
  metrics: PerformanceMetrics;
  allTrades: RawTrade[];
}) {
  const openTrades = useMemo(
    () => allTrades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL"),
    [allTrades]
  );

  const { livePnl } = useEnrichedPnl(openTrades);

  const metrics = useMemo(() => {
    if (livePnl.size === 0) return serverMetrics;

    const enriched = allTrades.map((t) => {
      const live = livePnl.get(t.id);
      let rMultiple = t.rMultiple;
      if (live && t.stopLoss) {
        const openQty = t.totalBuyQty - t.totalSellQty;
        const riskPerUnit = Math.abs(t.avgEntryPrice - t.stopLoss);
        const riskAmount = riskPerUnit * (openQty || 1);
        if (riskAmount > 0) rMultiple = live.netPnl / riskAmount;
      }
      return {
        netPnl: live ? live.netPnl : t.netPnl,
        grossPnl: live ? live.grossPnl : t.grossPnl,
        rMultiple,
        holdingPeriodMs: t.holdingPeriodMs,
        status: t.status,
        entryTime: new Date(t.entryTime),
        exitTime: t.exitTime ? new Date(t.exitTime) : null,
        strategy: t.strategy,
        avgEntryPrice: t.avgEntryPrice,
        totalBuyQty: t.totalBuyQty,
        totalSellQty: t.totalSellQty,
        todayPnl: live ? live.todayPnl : 0,
      };
    });

    return calculatePerformanceMetrics(enriched);
  }, [allTrades, livePnl, serverMetrics]);

  const stats = [
    { label: "Total Trades", value: metrics.totalTrades.toString() },
    { label: "Win Rate", value: formatPercent(metrics.winRate, false), positive: metrics.winRate >= 50 },
    { label: "Profit Factor", value: metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2), positive: metrics.profitFactor >= 1 },
    { label: "Average R", value: metrics.averageR > 0 ? `+${metrics.averageR.toFixed(2)}R` : `${metrics.averageR.toFixed(2)}R`, positive: metrics.averageR > 0 },
    { label: "Best Trade", value: formatINR(metrics.largestWin, { compact: true, showSign: true }), positive: true },
    { label: "Worst Trade", value: formatINR(metrics.largestLoss, { compact: true, showSign: true }), positive: false },
    { label: "Expectancy", value: formatINR(metrics.expectancy, { compact: true, showSign: true }), positive: metrics.expectancy > 0 },
    { label: "Max Drawdown", value: formatINR(-metrics.maxDrawdown, { compact: true, showSign: true }), positive: false },
  ];

  return (
    <div className="card" id="performance-overview">
      <div className="card-header">
        <span className="card-title">Performance Overview</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="stat-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <span className="stat-label">{stat.label}</span>
              <span
                className={cn(
                  "stat-value",
                  stat.positive !== undefined &&
                    (stat.positive ? "text-positive" : "text-negative")
                )}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
