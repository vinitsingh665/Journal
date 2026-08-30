"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatINR, formatDate, formatHoldingPeriod, cn } from "@/lib/utils";

interface JournalTrade {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  status: string;
  avgEntryPrice: number;
  avgExitPrice: number | null;
  totalBuyQty: number;
  totalSellQty: number;
  netPnl: number;
  pnlPercentage: number;
  rMultiple: number | null;
  strategy: string | null;
  setup: string | null;
  thesis: string | null;
  stopLoss: number | null;
  target: number | null;
  marketCondition: string | null;
  confidence: number | null;
  notes: string | null;
  postTradeReview: string | null;
  entryTime: string;
  exitTime: string | null;
  holdingPeriodMs: number | null;
  totalCharges: number;
  riskAmount: number | null;
  mistakes: { name: string; color: string | null }[];
  executionCount: number;
}

export default function JournalList({ trades }: { trades: JournalTrade[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (statusFilter === "OPEN" && t.status !== "OPEN" && t.status !== "PARTIAL") return false;
      if (statusFilter === "CLOSED" && t.status !== "CLOSED") return false;
      if (statusFilter === "DELETED" && t.status !== "DELETED") return false;
      if (searchQuery && !t.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [trades, statusFilter, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, JournalTrade[]> = {};
    filtered.forEach((t) => {
      const dateKey = formatDate(t.entryTime);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filtered]);

  const openCount = trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL").length;
  const closedCount = trades.filter((t) => t.status === "CLOSED").length;
  const deletedCount = trades.filter((t) => t.status === "DELETED").length;

  return (
    <div>
      {/* Filters */}
      <div className="trades-toolbar" style={{ marginBottom: "var(--space-4)" }}>
        <div className="trades-tabs">
          <button
            className={cn("trades-tab", statusFilter === "ALL" && "trades-tab-active")}
            onClick={() => setStatusFilter("ALL")}
          >
            All Entries
          </button>
          <button
            className={cn("trades-tab", statusFilter === "OPEN" && "trades-tab-active")}
            onClick={() => setStatusFilter("OPEN")}
          >
            Open <span className="trades-tab-count">{openCount}</span>
          </button>
          <button
            className={cn("trades-tab", statusFilter === "CLOSED" && "trades-tab-active")}
            onClick={() => setStatusFilter("CLOSED")}
          >
            Closed <span className="trades-tab-count">{closedCount}</span>
          </button>
          {deletedCount > 0 && (
            <button
              className={cn("trades-tab", statusFilter === "DELETED" && "trades-tab-active")}
              onClick={() => setStatusFilter("DELETED")}
            >
              Deleted <span className="trades-tab-count">{deletedCount}</span>
            </button>
          )}
        </div>
        <div className="search-input" style={{ width: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Journal Entries */}
      {Object.keys(grouped).length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {Object.entries(grouped).map(([dateKey, dateTrades]) => (
            <div key={dateKey}>
              <div style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "var(--space-3)",
                paddingLeft: 4,
              }}>
                {dateKey}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {dateTrades.map((trade) => (
                  <Link
                    key={trade.id}
                    href={`/journal/${trade.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="card" style={{
                      padding: "var(--space-4) var(--space-5)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderLeft: `3px solid ${trade.netPnl >= 0 ? "var(--color-positive)" : "var(--color-negative)"}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                    }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {/* Left: Symbol + Direction + Meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                              <span style={{ fontSize: "var(--text-lg)", fontWeight: 700 }}>{trade.symbol}</span>
                              <span className={`badge ${trade.direction === "LONG" ? "badge-long" : "badge-short"}`}>
                                {trade.direction}
                              </span>
                              <span className={cn(
                                "badge",
                                trade.status === "OPEN" ? "badge-open" :
                                trade.status === "CLOSED" ? "badge-closed" :
                                trade.status === "DELETED" ? "badge-closed" : "badge-partial"
                              )} style={trade.status === "DELETED" ? { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" } : undefined}>
                                {trade.status === "CLOSED" ? "Closed" : trade.status === "OPEN" ? "Open" : trade.status === "DELETED" ? "Deleted" : "Partial"}
                              </span>
                              {trade.setup && (
                                <span className="tag" style={{ fontSize: 10 }}>{trade.setup}</span>
                              )}
                            </div>
                            <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 2 }}>
                              {trade.exchange} · {trade.totalBuyQty} qty · {formatHoldingPeriod(trade.holdingPeriodMs)} hold
                              {trade.executionCount > 0 && ` · ${trade.executionCount} executions`}
                            </div>
                          </div>
                        </div>

                        {/* Right: P&L + R */}
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", textAlign: "right" }}>
                          {trade.rMultiple !== null && (
                            <div>
                              <div className="text-muted" style={{ fontSize: 10 }}>R-Multiple</div>
                              <div className={cn(trade.rMultiple >= 0 ? "text-positive" : "text-negative")}
                                style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                                {trade.rMultiple >= 0 ? "+" : ""}{trade.rMultiple.toFixed(2)}R
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-muted" style={{ fontSize: 10 }}>P&L</div>
                            <div className={cn(trade.netPnl >= 0 ? "text-positive" : "text-negative")}
                              style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                              {formatINR(trade.netPnl, { showSign: true })}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted" style={{ fontSize: 10 }}>Return</div>
                            <div className={cn(trade.pnlPercentage >= 0 ? "text-positive" : "text-negative")}
                              style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                              {trade.pnlPercentage >= 0 ? "+" : ""}{trade.pnlPercentage.toFixed(2)}%
                            </div>
                          </div>
                          <div style={{ color: "var(--text-muted)", fontSize: 18 }}>›</div>
                        </div>
                      </div>

                      {/* Thesis preview */}
                      {trade.thesis && (
                        <div className="text-muted" style={{
                          fontSize: "var(--text-xs)",
                          marginTop: "var(--space-2)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 500,
                        }}>
                          {trade.thesis}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <h3 className="empty-state-title">No journal entries</h3>
            <p className="empty-state-description">
              {trades.length === 0
                ? "Start by adding a trade. Each trade automatically becomes a journal entry."
                : "No entries match your current filters."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
