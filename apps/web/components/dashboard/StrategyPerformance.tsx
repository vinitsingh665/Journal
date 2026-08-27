"use client";

import Link from "next/link";
import { formatINR, formatPercent, cn } from "@/lib/utils";
import type { StrategyPerformance as StrategyPerfType } from "@repo/trading-engine";

export default function StrategyPerformance({
  strategies,
}: {
  strategies: StrategyPerfType[];
}) {
  return (
    <div className="card" id="strategy-performance">
      <div className="card-header">
        <span className="card-title">Strategy Performance</span>
        <Link href="/strategies" className="btn btn-ghost btn-sm">
          View All
        </Link>
      </div>
      <div className="table-container">
        {strategies.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Trades</th>
                <th>Win Rate</th>
                <th>Avg R</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {strategies.slice(0, 5).map((s) => (
                <tr key={s.strategy}>
                  <td style={{ fontWeight: 600 }}>{s.strategy}</td>
                  <td className="col-numeric">{s.trades}</td>
                  <td className="col-numeric">
                    <span className={cn(s.winRate >= 50 ? "text-positive" : "text-negative")}>
                      {s.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="col-numeric">
                    <span className={cn(s.avgR >= 0 ? "text-positive" : "text-negative")}>
                      {s.avgR >= 0 ? "+" : ""}{s.avgR.toFixed(2)}R
                    </span>
                  </td>
                  <td className="col-numeric">
                    <span
                      className={cn(s.totalPnl >= 0 ? "text-positive" : "text-negative")}
                      style={{ fontWeight: 600 }}
                    >
                      {formatINR(s.totalPnl, { showSign: true, compact: true })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="card-body">
            <p className="text-muted" style={{ textAlign: "center", padding: "var(--space-4)" }}>
              Tag your trades with strategies to see performance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
