"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { useEnrichedPnl } from "@/hooks/useEnrichedPnl";

interface Trade {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  entryPrice: number;
  avgEntryPrice: number;
  exitPrice: number | null;
  rMultiple: number | null;
  pnl: number;
  pnlPercentage?: number;
  entryTime: string;
  status: string;
  totalBuyQty: number;
  totalSellQty: number;
}

export default function RecentTrades({ trades }: { trades: Trade[] }) {
  const openTrades = useMemo(
    () => trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL"),
    [trades]
  );
  const { livePnl } = useEnrichedPnl(openTrades);

  return (
    <div className="card" id="recent-trades">
      <div className="card-header">
        <span className="card-title">Recent Trades</span>
        <Link href="/trades" className="btn btn-ghost btn-sm">
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
              {trades.map((trade) => {
                const live = livePnl.get(trade.id);
                const displayPnl = live ? (trade.pnl + live.netPnl) : trade.pnl;
                const investment = trade.entryPrice * (trade.totalBuyQty - trade.totalSellQty);
                const displayPnlPct = live
                  ? (investment > 0 ? (live.netPnl / investment) * 100 : 0)
                  : (trade.pnlPercentage ?? 0);

                return (
                <tr key={trade.id}>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {trade.symbol}
                    </span>
                    {(trade.status === "OPEN" || trade.status === "PARTIAL") ? (
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
                    ) : (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          background: "var(--bg-secondary)",
                          padding: "1px 5px",
                          borderRadius: "var(--radius-sm)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        CLOSED
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
                        displayPnl >= 0 ? "text-positive" : "text-negative"
                      )}
                      style={{ fontWeight: 600 }}
                    >
                      {formatINR(displayPnl, { showSign: true, compact: true })}
                    </span>
                  </td>
                  <td className="col-numeric">
                    <span
                      className={cn(
                        displayPnlPct >= 0 ? "text-positive" : "text-negative"
                      )}
                    >
                      {displayPnlPct >= 0 ? "+" : ""}
                      {displayPnlPct.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                    {formatDate(trade.entryTime)}
                  </td>
                </tr>
                );
              })}

            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p className="empty-state-description">
              No trades yet. Import a CSV or add a trade manually to get started.
            </p>
            <div className="flex gap-3">
              <Link href="/import" className="btn btn-secondary">Import CSV</Link>
              <Link href="/trades/new" className="btn btn-primary">Add Trade</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
