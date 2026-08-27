"use client";

import { formatINR, formatPercent, formatHoldingPeriod, cn } from "@/lib/utils";
import type { PerformanceMetrics } from "@repo/trading-engine";

export default function PerformanceOverview({
  metrics,
}: {
  metrics: PerformanceMetrics;
}) {
  const stats = [
    { label: "Total Trades", value: metrics.totalTrades.toString() },
    { label: "Win Rate", value: formatPercent(metrics.winRate, false), positive: metrics.winRate >= 50 },
    { label: "Profit Factor", value: metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2) },
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
