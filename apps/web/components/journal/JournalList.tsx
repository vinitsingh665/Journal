"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatINR, formatDate, formatHoldingPeriod, cn } from "@/lib/utils";
import { useEnrichedPnl } from "@/hooks/useEnrichedPnl";

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

export default function JournalList({ 
  trades, 
  counts, 
  initialStatus, 
  initialSearch 
}: { 
  trades: JournalTrade[]; 
  counts: { openCount: number; closedCount: number; deletedCount: number };
  initialStatus?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Server-driven values
  const statusFilter = initialStatus || "ALL";
  const searchQuery = initialSearch || "";
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmptyTrash = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all items in the trash? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/trades/deleted", { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to empty trash. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while emptying the trash.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateParams({ search: localSearch || undefined });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (params.get("status") === "ALL") params.delete("status");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const setStatusFilter = (status: string) => updateParams({ status });

  const filtered = trades;
  const openTrades = useMemo(() => trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL"), [trades]);
  const { livePnl } = useEnrichedPnl(openTrades);

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
  const closedCount = trades.filter((t) => t.status === "CLOSED" || t.status === "STOP_LOSS_HIT").length;
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
            Open <span className="trades-tab-count">{counts.openCount}</span>
          </button>
          <button
            className={cn("trades-tab", statusFilter === "CLOSED" && "trades-tab-active")}
            onClick={() => setStatusFilter("CLOSED")}
          >
            Closed <span className="trades-tab-count">{counts.closedCount}</span>
          </button>
          {counts.deletedCount > 0 && (
            <button
              className={cn("trades-tab", statusFilter === "DELETED" && "trades-tab-active")}
              onClick={() => setStatusFilter("DELETED")}
            >
              Deleted <span className="trades-tab-count">{counts.deletedCount}</span>
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          {statusFilter === "DELETED" && counts.deletedCount > 0 && (
            <button
              className="btn btn-sm"
              style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}
              onClick={handleEmptyTrash}
              disabled={isDeleting}
            >
              {isDeleting ? "Emptying..." : "Empty Trash"}
            </button>
          )}
          <div className="search-input" style={{ width: 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search symbol..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
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
                                trade.status === "STOP_LOSS_HIT" ? "badge-stop-loss-hit" :
                                trade.status === "DELETED" ? "badge-closed" : "badge-partial"
                              )} style={trade.status === "DELETED" ? { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" } : undefined}>
                                {trade.status === "CLOSED" ? "Closed" : 
                                 trade.status === "STOP_LOSS_HIT" ? "SL Hit" :
                                 trade.status === "OPEN" ? "Open" : trade.status === "DELETED" ? "Deleted" : "Partial"}
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
                        {(() => {
                          const liveQuote = livePnl.get(trade.id);
                          const displayPnl = liveQuote ? (trade.netPnl + liveQuote.netPnl) : trade.netPnl;
                          const displayPct = liveQuote ? liveQuote.pnlPercentage : trade.pnlPercentage;
                          const openQty = trade.totalBuyQty - trade.totalSellQty;
                          const riskPerUnit = trade.stopLoss ? Math.abs(trade.avgEntryPrice - trade.stopLoss) : 0;
                          const riskAmount = riskPerUnit * (openQty || 1);
                          const displayR = liveQuote && trade.stopLoss && riskAmount > 0
                            ? (displayPnl / riskAmount)
                            : trade.rMultiple;

                          return (
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", textAlign: "right" }}>
                              {displayR !== null && (
                                <div>
                                  <div className="text-muted" style={{ fontSize: 10 }}>R-Multiple</div>
                                  <div className={cn(displayR >= 0 ? "text-positive" : "text-negative")}
                                    style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                                    {displayR >= 0 ? "+" : ""}{displayR.toFixed(2)}R
                                  </div>
                                </div>
                              )}
                              <div>
                                <div className="text-muted" style={{ fontSize: 10 }}>P&L</div>
                                <div className={cn(displayPnl >= 0 ? "text-positive" : "text-negative")}
                                  style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                                  {formatINR(displayPnl, { showSign: true })}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted" style={{ fontSize: 10 }}>Return</div>
                                <div className={cn(displayPct >= 0 ? "text-positive" : "text-negative")}
                                  style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>
                                  {displayPct >= 0 ? "+" : ""}{displayPct.toFixed(2)}%
                                </div>
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: 18 }}>›</div>
                            </div>
                          );
                        })()}
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
