"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR, formatDate, formatDateTime, formatHoldingPeriod, cn } from "@/lib/utils";
import MiniCandleChart from "@/components/dashboard/MiniCandleChart";
import AddExecutionModal from "./AddExecutionModal";

interface Trade {
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
  stopLoss: number | null;
  target: number | null;
  marketCondition: string | null;
  notes: string | null;
  entryTime: string;
  exitTime: string | null;
  holdingPeriodMs: number | null;
  mistakes: { name: string; color: string | null }[];
  executions: { id: string; side: string; quantity: number; price: number; executionTime: string }[];
}

interface ChartData {
  candles: { time: number; open: number; high: number; low: number; close: number; volume: number }[];
  currentPrice: number | null;
}

function useLiveHoldingPeriod(entryTime: string | undefined, initialMs: number | null | undefined) {
  const [ms, setMs] = useState(initialMs ?? null);

  useEffect(() => {
    setMs(initialMs ?? null);
    if (initialMs !== null && initialMs !== undefined) return;
    if (!entryTime) return;

    const entryDate = new Date(entryTime).getTime();
    if (isNaN(entryDate)) return;

    const update = () => {
      setMs(Date.now() - entryDate);
    };
    
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [entryTime, initialMs]);

  const text = ms !== null ? formatHoldingPeriod(ms) : "—";
  const isLive = (initialMs === null || initialMs === undefined) && !!entryTime;

  return {
    text,
    node: isLive ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-primary)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        {text}
      </span>
    ) : text
  };
}

const TRADES_PER_PAGE = 12;

export default function TradesList({ trades }: { trades: Trade[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showAddExecution, setShowAddExecution] = useState(false);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  const selectedTrade = useMemo(() => trades.find((t) => t.id === selectedTradeId), [trades, selectedTradeId]);
  const liveDuration = useLiveHoldingPeriod(selectedTrade?.entryTime, selectedTrade?.holdingPeriodMs);

  // ─── KPI Calculations ────────────────────────────────
  const kpis = useMemo(() => {
    const total = trades.length;
    const closed = trades.filter((t) => t.status === "CLOSED");
    const winning = closed.filter((t) => t.netPnl > 0);
    const winRate = closed.length > 0 ? (winning.length / closed.length) * 100 : 0;
    const totalPnl = trades.reduce((s, t) => s + t.netPnl, 0);
    const rTrades = trades.filter((t) => t.rMultiple !== null);
    const avgR = rTrades.length > 0
      ? rTrades.reduce((s, t) => s + t.rMultiple!, 0) / rTrades.length
      : 0;
    let best: number | null = trades.length > 0 ? Math.max(...trades.map((t) => t.netPnl)) : null;
    let worst: number | null = trades.length > 0 ? Math.min(...trades.map((t) => t.netPnl)) : null;
    
    if (trades.length === 1) {
      if (trades[0].netPnl >= 0) {
        worst = null;
      } else {
        best = null;
      }
    }

    const openCount = trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL").length;
    const closedCount = closed.length;

    return { total, winRate, totalPnl, avgR, best, worst, openCount, closedCount };
  }, [trades]);

  // ─── Filtering ────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = trades.filter((t) => {
      if (statusFilter === "OPEN" && t.status !== "OPEN" && t.status !== "PARTIAL") return false;
      if (statusFilter === "CLOSED" && t.status !== "CLOSED") return false;
      if (searchQuery && !t.symbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "symbol": cmp = a.symbol.localeCompare(b.symbol); break;
        case "pnl": cmp = a.netPnl - b.netPnl; break;
        case "r": cmp = (a.rMultiple ?? 0) - (b.rMultiple ?? 0); break;
        default: cmp = new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [trades, statusFilter, searchQuery, sortField, sortDir]);

  // ─── Pagination ──────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / TRADES_PER_PAGE);
  const paginated = filtered.slice((page - 1) * TRADES_PER_PAGE, page * TRADES_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, searchQuery]);

  // ─── Selected Trade ──────────────────────────────────

  // Fetch chart data when a trade is selected
  useEffect(() => {
    if (!selectedTrade) { setChartData(null); return; }

    const fetchChart = async () => {
      setChartLoading(true);
      try {
        const res = await fetch(
          `/api/chart?symbol=${selectedTrade.symbol}&exchange=${selectedTrade.exchange}&range=1mo&interval=1d`
        );
        if (res.ok) {
          const data = await res.json();
          setChartData(data);
        }
      } catch { /* silent */ }
      finally { setChartLoading(false); }
    };
    fetchChart();
  }, [selectedTrade]);

  // ─── Bulk Actions ────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((t) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/trades/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeIds: [...selectedIds] }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        setShowBulkDeleteConfirm(false);
        setSelectedTradeId(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete trades");
      }
    } catch { alert("Failed to delete trades"); }
    finally { setDeleting(false); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return (
      <span style={{ marginLeft: 4, fontSize: 10 }}>
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="trades-kpi-row">
        <div className="trades-kpi-card">
          <span className="trades-kpi-label">TOTAL TRADES</span>
          <span className="trades-kpi-value">{kpis.total}</span>
        </div>
        <div className="trades-kpi-card">
          <span className="trades-kpi-label">WIN RATE</span>
          <span className="trades-kpi-value">{kpis.winRate.toFixed(1)}%</span>
        </div>
        <div className="trades-kpi-card">
          <span className="trades-kpi-label">TOTAL P&L</span>
          <span className={cn("trades-kpi-value", kpis.totalPnl >= 0 ? "text-positive" : "text-negative")}>
            {formatINR(kpis.totalPnl, { showSign: true })}
          </span>
        </div>
        <div className="trades-kpi-card">
          <span className="trades-kpi-label">AVG R-MULTIPLE</span>
          <span className={cn("trades-kpi-value", kpis.avgR >= 0 ? "text-positive" : "text-negative")}>
            {kpis.avgR >= 0 ? "+" : ""}{kpis.avgR.toFixed(2)}R
          </span>
        </div>
        <div className="trades-kpi-card">
          <span className="trades-kpi-label">BEST TRADE</span>
          <span className="trades-kpi-value text-positive">
            {kpis.best !== null ? formatINR(kpis.best, { showSign: true, compact: true }) : "—"}
          </span>
        </div>
        <div className="trades-kpi-card">
          <span className="trades-kpi-label">WORST TRADE</span>
          <span className="trades-kpi-value text-negative">
            {kpis.worst !== null ? formatINR(kpis.worst, { showSign: true, compact: true }) : "—"}
          </span>
        </div>
      </div>

      {/* Tabs + Actions Bar */}
      <div className="trades-toolbar">
        <div className="trades-tabs">
          <button
            className={cn("trades-tab", statusFilter === "ALL" && "trades-tab-active")}
            onClick={() => setStatusFilter("ALL")}
          >
            All Trades
          </button>
          <button
            className={cn("trades-tab", statusFilter === "OPEN" && "trades-tab-active")}
            onClick={() => setStatusFilter("OPEN")}
          >
            Open Trades <span className="trades-tab-count">{kpis.openCount}</span>
          </button>
          <button
            className={cn("trades-tab", statusFilter === "CLOSED" && "trades-tab-active")}
            onClick={() => setStatusFilter("CLOSED")}
          >
            Closed Trades <span className="trades-tab-count">{kpis.closedCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="search-input" style={{ width: 180 }}>
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

          {selectedIds.size > 0 && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              Delete ({selectedIds.size})
            </button>
          )}

          <Link href="/trades/new" className="btn btn-primary btn-sm">
            + New Trade
          </Link>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="trades-layout">
        {/* Left: Table */}
        <div className="trades-table-panel">
          <div className="card">
            <div className="table-container">
              {paginated.length > 0 ? (
                <table className="data-table" id="trades-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36, padding: "8px 4px" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.size === paginated.length && paginated.length > 0}
                          onChange={toggleSelectAll}
                          style={{ cursor: "pointer" }}
                        />
                      </th>
                      <th style={{ padding: "8px 6px", cursor: "pointer" }} onClick={() => handleSort("date")}>
                        DATE <SortIcon field="date" />
                      </th>
                      <th style={{ padding: "8px 6px", cursor: "pointer" }} onClick={() => handleSort("symbol")}>
                        SYMBOL <SortIcon field="symbol" />
                      </th>
                      <th style={{ padding: "8px 6px" }}>DIRECTION</th>
                      <th className="col-numeric" style={{ padding: "8px 6px" }}>ENTRY</th>
                      <th className="col-numeric" style={{ padding: "8px 6px" }}>AVG PRICE</th>
                      <th className="col-numeric" style={{ padding: "8px 6px" }}>EXIT</th>
                      <th className="col-numeric" style={{ padding: "8px 6px", cursor: "pointer" }} onClick={() => handleSort("r")}>
                        R <SortIcon field="r" />
                      </th>
                      <th className="col-numeric" style={{ padding: "8px 6px", cursor: "pointer" }} onClick={() => handleSort("pnl")}>
                        P&L <SortIcon field="pnl" />
                      </th>
                      <th style={{ padding: "8px 6px" }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((trade) => (
                      <React.Fragment key={trade.id}>
                        <tr
                          onClick={() => setSelectedTradeId(trade.id)}
                          className={cn(
                            "trades-row",
                            selectedTradeId === trade.id && "trades-row-active"
                          )}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ padding: "8px 4px" }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(trade.id)}
                              onChange={() => toggleSelect(trade.id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td style={{ padding: "8px 6px", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                            {formatDate(trade.entryTime)}
                          </td>
                          <td style={{ padding: "8px 6px", fontWeight: 600 }}>
                            <div className="flex items-center gap-2">
                              {trade.executions && trade.executions.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTradeId(expandedTradeId === trade.id ? null : trade.id);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    color: "var(--text-muted)",
                                    fontSize: 10,
                                    transition: "transform 0.2s ease",
                                    transform: expandedTradeId === trade.id ? "rotate(90deg)" : "rotate(0deg)",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                  title="Show executions"
                                >
                                  ▶
                                </button>
                              )}
                              {trade.symbol}
                            </div>
                          </td>
                          <td style={{ padding: "8px 6px" }}>
                            <span className={`badge ${trade.direction === "LONG" ? "badge-long" : "badge-short"}`}>
                              {trade.direction}
                            </span>
                          </td>
                          <td className="col-numeric" style={{ padding: "8px 6px" }}>
                            {formatINR(
                              trade.executions && trade.executions.length > 0
                                ? (trade.executions.find(e => e.side === (trade.direction === "LONG" ? "BUY" : "SELL"))?.price || trade.avgEntryPrice)
                                : trade.avgEntryPrice
                            )}
                          </td>
                          <td className="col-numeric" style={{ padding: "8px 6px" }}>
                            {formatINR(trade.avgEntryPrice)}
                          </td>
                          <td className="col-numeric" style={{ padding: "8px 6px" }}>
                            {trade.avgExitPrice ? formatINR(trade.avgExitPrice) : "—"}
                          </td>
                          <td className="col-numeric" style={{ padding: "8px 6px" }}>
                            {trade.rMultiple !== null ? (
                              <span className={cn(trade.rMultiple >= 0 ? "text-positive" : "text-negative")}>
                                {trade.rMultiple >= 0 ? "+" : ""}{trade.rMultiple.toFixed(2)}R
                              </span>
                            ) : "—"}
                          </td>
                          <td className="col-numeric" style={{ padding: "8px 6px" }}>
                            <span className={cn(trade.netPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontWeight: 600 }}>
                              {formatINR(trade.netPnl, { showSign: true, compact: true })}
                            </span>
                          </td>
                          <td style={{ padding: "8px 6px" }}>
                            <span className={cn(
                              "badge",
                              trade.status === "OPEN" ? "badge-open" :
                              trade.status === "CLOSED" ? "badge-closed" : "badge-partial"
                            )}>
                              {trade.status === "CLOSED" ? "Closed" : trade.status === "OPEN" ? "Open" : "Partial"}
                            </span>
                          </td>
                        </tr>
                        {/* Expandable execution history row */}
                        {expandedTradeId === trade.id && trade.executions && trade.executions.length > 0 && (
                          <tr>
                            <td colSpan={10} style={{ padding: 0, background: "var(--bg-secondary)" }}>
                              <div style={{
                                padding: "8px 16px 12px 48px",
                                animation: "fadeIn 0.2s ease",
                              }}>
                                <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                                  Executions ({trade.executions.length})
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
                                  <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                                      <th style={{ padding: "4px 8px", textAlign: "left", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>SIDE</th>
                                      <th style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>QTY</th>
                                      <th style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>PRICE</th>
                                      <th style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>VALUE</th>
                                      <th style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>AVG PRICE</th>
                                      <th style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>TIME</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      let runningBuyQty = 0;
                                      let runningBuyValue = 0;
                                      let runningSellQty = 0;
                                      let runningSellValue = 0;

                                      return trade.executions.map((exec) => {
                                        let runningAvg = 0;
                                        if (exec.side === "BUY") {
                                          runningBuyQty += exec.quantity;
                                          runningBuyValue += exec.quantity * exec.price;
                                          runningAvg = runningBuyValue / runningBuyQty;
                                        } else {
                                          runningSellQty += exec.quantity;
                                          runningSellValue += exec.quantity * exec.price;
                                          runningAvg = runningSellValue / runningSellQty;
                                        }

                                        return (
                                          <tr key={exec.id} style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                                            <td style={{ padding: "5px 8px" }}>
                                              <span style={{
                                                display: "inline-block",
                                                padding: "1px 6px",
                                                borderRadius: "var(--radius-sm)",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                background: exec.side === "BUY" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                                color: exec.side === "BUY" ? "var(--color-positive)" : "var(--color-negative)",
                                              }}>
                                                {exec.side}
                                              </span>
                                            </td>
                                            <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{exec.quantity}</td>
                                            <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{formatINR(exec.price)}</td>
                                            <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{formatINR(exec.price * exec.quantity)}</td>
                                            <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{formatINR(runningAvg)}</td>
                                            <td style={{ padding: "5px 8px", textAlign: "right", color: "var(--text-muted)", fontSize: 10 }}>{formatDate(exec.executionTime)}</td>
                                          </tr>
                                        );
                                      });
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                  <h3 className="empty-state-title">No trades found</h3>
                  <p className="empty-state-description">
                    {trades.length === 0
                      ? "Start by importing your trades from a CSV file or adding them manually."
                      : "No trades match your current filters."}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="trades-pagination">
                <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                  Showing {(page - 1) * TRADES_PER_PAGE + 1} to{" "}
                  {Math.min(page * TRADES_PER_PAGE, filtered.length)} of {filtered.length} trades
                </span>
                <div className="trades-page-buttons">
                  <button
                    className="trades-page-btn"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={cn("trades-page-btn", page === pageNum && "trades-page-btn-active")}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    className="trades-page-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selectedTrade && (
          <div className="trade-detail-panel">
            <div className="card" style={{ position: "sticky", top: 16 }}>
              {/* Header */}
              <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-secondary)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
                      {selectedTrade.symbol}
                    </span>
                    <span className={`badge ${selectedTrade.direction === "LONG" ? "badge-long" : "badge-short"}`}>
                      {selectedTrade.direction}
                    </span>
                    <span className={cn(
                      "badge",
                      selectedTrade.status === "CLOSED" ? "badge-closed" : "badge-open"
                    )}>
                      {selectedTrade.status === "CLOSED" ? "Closed" : "Open"}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setSelectedTradeId(null)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>
                  {formatDate(selectedTrade.entryTime)}
                </div>
              </div>

              {/* Key Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-secondary)" }}>
                <div>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>R-Multiple</div>
                  <div className={cn("text-positive", (selectedTrade.rMultiple ?? 0) < 0 && "text-negative")} style={{ fontSize: "var(--text-lg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {selectedTrade.rMultiple !== null ? `${selectedTrade.rMultiple >= 0 ? "+" : ""}${selectedTrade.rMultiple.toFixed(2)}R` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>P&L</div>
                  <div className={cn(selectedTrade.netPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-lg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {formatINR(selectedTrade.netPnl, { showSign: true })}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Return</div>
                  <div className={cn(selectedTrade.pnlPercentage >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-lg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {selectedTrade.pnlPercentage >= 0 ? "+" : ""}{selectedTrade.pnlPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Trade Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-secondary)" }}>
                {[
                  { label: "Entry", value: formatINR(selectedTrade.avgEntryPrice), sub: formatDate(selectedTrade.entryTime) },
                  { label: "Exit", value: selectedTrade.avgExitPrice ? formatINR(selectedTrade.avgExitPrice) : "—", sub: selectedTrade.exitTime ? formatDate(selectedTrade.exitTime) : "" },
                  { label: "Quantity", value: selectedTrade.totalBuyQty.toString() },
                  { label: "Hold Time", value: liveDuration.node },
                  { label: "Stop Loss", value: selectedTrade.stopLoss ? formatINR(selectedTrade.stopLoss) : "—", color: "var(--color-negative)" },
                  { label: "Target", value: selectedTrade.target ? formatINR(selectedTrade.target) : "—", color: "var(--color-positive)" },
                  { label: "Setup", value: selectedTrade.setup || "—" },
                  { label: "Market", value: selectedTrade.marketCondition || "—" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, fontFamily: "var(--font-mono)", color: item.color || "var(--text-primary)" }}>
                      {item.value}
                    </div>
                    {item.sub && (
                      <div className="text-muted" style={{ fontSize: 10 }}>{item.sub}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chart Snapshot */}
              <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-secondary)" }}>
                <div className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  CHART SNAPSHOT
                </div>
                {chartLoading ? (
                  <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                    Loading chart...
                  </div>
                ) : chartData && chartData.candles.length > 0 ? (
                  <MiniCandleChart
                    candles={chartData.candles}
                    entryPrice={selectedTrade.avgEntryPrice}
                    entryTime={new Date(selectedTrade.entryTime).getTime()}
                    exitTime={selectedTrade.exitTime ? new Date(selectedTrade.exitTime).getTime() : undefined}
                    currentPrice={chartData.currentPrice || undefined}
                    height={160}
                  />
                ) : (
                  <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                    No chart data available
                  </div>
                )}
              </div>

              {/* Trade Notes */}
              {selectedTrade.notes && (
                <div style={{ padding: "var(--space-4) var(--space-5)", borderBottom: "1px solid var(--border-secondary)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    TRADE NOTES
                  </div>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    {selectedTrade.notes}
                  </p>
                </div>
              )}

              {/* Tags / Mistakes */}
              {selectedTrade.mistakes.length > 0 && (
                <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    TAGS
                  </div>
                  <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                    {selectedTrade.mistakes.map((m, i) => (
                      <span
                        key={i}
                        className="tag"
                        style={{
                          background: m.color ? `${m.color}20` : "var(--bg-secondary)",
                          color: m.color || "var(--text-primary)",
                          border: `1px solid ${m.color || "var(--border-color)"}`,
                        }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Links */}
              <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--border-secondary)", display: "flex", gap: "var(--space-2)" }}>
                {(selectedTrade.status === "OPEN" || selectedTrade.status === "PARTIAL") && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddExecution(true)}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Add Execution
                  </button>
                )}
                <Link
                  href={`/trades/${selectedTrade.id}/edit`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Edit Trade
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowBulkDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete {selectedIds.size} Trade(s)</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowBulkDeleteConfirm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedIds.size} trade(s)</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBulkDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleBulkDelete} disabled={deleting}>
                {deleting ? "Deleting..." : `Delete ${selectedIds.size} Trade(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Execution Modal */}
      {showAddExecution && selectedTrade && (
        <AddExecutionModal
          tradeId={selectedTrade.id}
          symbol={selectedTrade.symbol}
          exchange={selectedTrade.exchange}
          direction={selectedTrade.direction}
          currentPrice={chartData?.currentPrice || selectedTrade.avgEntryPrice}
          openQty={selectedTrade.totalBuyQty - selectedTrade.totalSellQty}
          onClose={() => setShowAddExecution(false)}
        />
      )}
    </div>
  );
}
