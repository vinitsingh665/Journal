"use client";

import Link from "next/link";
import { formatINR, formatDate, cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  direction: string;
  entryPrice: number;
  exitPrice: number | null;
  rMultiple: number | null;
  pnl: number;
  pnlPercentage?: number;
  entryTime: string;
  status: string;
}

export default function RecentTrades({ trades }: { trades: Trade[] }) {
  return (
    <div className="card" id="recent-trades">
      <div className="card-header">
        <span className="card-title">Recent Trades</span>
        <Link href="/dashboard/trades" className="btn btn-ghost btn-sm">
          View All
        </Link>
      </div>
      <div className="table-container">
        {trades.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Direction</th>
                <th className="col-numeric">Entry</th>
                <th className="col-numeric">Exit</th>
                <th className="col-numeric">P&L</th>
                <th className="col-numeric">P&L %</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td>
                    <Link
                      href={`/trades/${trade.id}`}
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        textDecoration: "none",
                      }}
                    >
                      {trade.symbol}
                    </Link>
                    {(trade.status === "OPEN" || trade.status === "PARTIAL") && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "#10B981",
                          background: "rgba(16, 185, 129, 0.12)",
                          padding: "1px 5px",
                          borderRadius: "var(--radius-sm)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        LIVE
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        trade.direction === "LONG" ? "badge-long" : "badge-short"
                      }`}
                    >
                      {trade.direction}
                    </span>
                  </td>
                  <td className="col-numeric">{formatINR(trade.entryPrice)}</td>
                  <td className="col-numeric">
                    {trade.exitPrice ? formatINR(trade.exitPrice) : "—"}
                  </td>
                  <td className="col-numeric">
                    <span
                      className={cn(
                        trade.pnl >= 0 ? "text-positive" : "text-negative"
                      )}
                      style={{ fontWeight: 600 }}
                    >
                      {formatINR(trade.pnl, { showSign: true, compact: true })}
                    </span>
                  </td>
                  <td className="col-numeric">
                    <span
                      className={cn(
                        (trade.pnlPercentage ?? 0) >= 0
                          ? "text-positive"
                          : "text-negative"
                      )}
                    >
                      {(trade.pnlPercentage ?? 0) >= 0 ? "+" : ""}
                      {(trade.pnlPercentage ?? 0).toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                    {formatDate(trade.entryTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p className="empty-state-description">
              No trades yet. Import a CSV or add a trade manually to get started.
            </p>
            <div className="flex gap-3">
              <Link href="/dashboard/import" className="btn btn-secondary">Import CSV</Link>
              <Link href="/dashboard/trades/new" className="btn btn-primary">Add Trade</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
