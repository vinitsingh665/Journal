"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  formatINR,
  formatPercent,
  formatDate,
  formatDateTime,
  formatHoldingPeriod,
  cn,
} from "@/lib/utils";
import type { StockQuote } from "@/lib/finance";
import AddExecutionModal from "./AddExecutionModal";

// Dynamic import to avoid SSR issues with TradingView widget
const TradingViewChart = dynamic(
  () => import("@/components/charts/TradingViewChart"),
  { ssr: false, loading: () => <div className="skeleton" style={{ height: 400, borderRadius: "var(--radius-xl)" }} /> }
);

interface Execution {
  id: string;
  side: string;
  quantity: number;
  price: number;
  executionTime: string;
  orderType: string | null;
}

interface Mistake {
  id: string;
  name: string;
  color: string | null;
}

interface TradeData {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  status: string;
  totalBuyQty: number;
  totalSellQty: number;
  avgEntryPrice: number;
  avgExitPrice: number | null;
  grossPnl: number;
  totalCharges: number;
  netPnl: number;
  pnlPercentage: number;
  riskAmount: number | null;
  rMultiple: number | null;
  entryTime: string;
  exitTime: string | null;
  holdingPeriodMs: number | null;
  strategy: string | null;
  setup: string | null;
  thesis: string | null;
  plannedEntry: number | null;
  stopLoss: number | null;
  target: number | null;
  expectedRR: number | null;
  marketCondition: string | null;
  confidence: number | null;
  reasonForEntry: string | null;
  reasonForExit: string | null;
  emotionalState: string | null;
  notes: string | null;
  postTradeReview: string | null;
  executions: Execution[];
  mistakes: Mistake[];
}

export default function TradeDetail({ trade }: { trade: TradeData }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddExecution, setShowAddExecution] = useState(false);
  const [liveQuote, setLiveQuote] = useState<StockQuote | null>(null);
  const [quoteFetching, setQuoteFetching] = useState(false);

  // Fetch live price for open positions
  useEffect(() => {
    if (trade.status !== "OPEN" && trade.status !== "PARTIAL") return;

    const fetchQuote = async () => {
      setQuoteFetching(true);
      try {
        const res = await fetch(
          `/api/quotes?symbols=${trade.symbol}&exchange=${trade.exchange}`
        );
        if (res.ok) {
          const data = await res.json();
          setLiveQuote(data);
        }
      } catch {
        // silently fail
      } finally {
        setQuoteFetching(false);
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 60000);
    return () => clearInterval(interval);
  }, [trade.symbol, trade.exchange, trade.status]);

  // Calculate live P&L
  const isOpen = trade.status === "OPEN" || trade.status === "PARTIAL";
  const currentPrice = liveQuote?.regularMarketPrice;
  const openQty = trade.totalBuyQty - trade.totalSellQty;

  let livePnl = trade.netPnl;
  let livePnlPct = trade.pnlPercentage;
  if (isOpen && currentPrice && openQty > 0) {
    if (trade.direction === "LONG") {
      livePnl = (currentPrice - trade.avgEntryPrice) * openQty;
    } else {
      livePnl = (trade.avgEntryPrice - currentPrice) * openQty;
    }
    const investment = trade.avgEntryPrice * openQty;
    livePnlPct = investment > 0 ? (livePnl / investment) * 100 : 0;
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const isAlreadyDeleted = trade.status === "DELETED";
      const res = await fetch(`/api/trades/${trade.id}${isAlreadyDeleted ? '?hard=true' : ''}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/trades");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete trade");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/trades" className="btn btn-ghost btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{trade.symbol}</h1>
              <span className={`badge ${trade.direction === "LONG" ? "badge-long" : "badge-short"}`}>
                {trade.direction}
              </span>
              <span className={cn("badge", trade.status === "STOP_LOSS_HIT" ? "badge-stop-loss-hit" : `badge-${trade.status.toLowerCase()}`)}>
                {trade.status === "STOP_LOSS_HIT" ? "SL Hit" : trade.status}
              </span>
            </div>
            <div className="text-secondary" style={{ fontSize: "var(--text-sm)", marginTop: 2 }}>
              {trade.exchange} · Opened {formatDate(trade.entryTime)}
              {trade.strategy && ` · ${trade.strategy}`}
            </div>
          </div>
        </div>
        <div className="page-actions">
          {isOpen && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddExecution(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Execution
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowDeleteConfirm(true)}
            id="btn-delete-trade"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Live Price Banner for Open Trades */}
      {isOpen && (
        <div
          className="card mb-4"
          style={{
            background: livePnl >= 0
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.02))"
              : "linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(239, 68, 68, 0.02))",
            borderColor: livePnl >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          }}
        >
          <div className="card-body flex items-center justify-between">
            <div>
              <div className="text-secondary" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>
                {quoteFetching ? "Fetching live price..." : "Live Price (TradingView)"}
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="text-mono"
                  style={{ fontSize: "1.75rem", fontWeight: 800 }}
                >
                  {currentPrice ? formatINR(currentPrice) : "—"}
                </span>
                {liveQuote && (
                  <span className={cn("kpi-change", liveQuote.regularMarketChange >= 0 ? "positive" : "negative")}>
                    {liveQuote.regularMarketChange >= 0 ? "↑" : "↓"}{" "}
                    {formatINR(Math.abs(liveQuote.regularMarketChange))} ({formatPercent(liveQuote.regularMarketChangePercent)})
                  </span>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="text-secondary" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>
                Unrealized P&L ({openQty} shares)
              </div>
              <div
                className={cn("text-mono", livePnl >= 0 ? "text-positive" : "text-negative")}
                style={{ fontSize: "1.75rem", fontWeight: 800 }}
              >
                {formatINR(livePnl, { showSign: true })}
              </div>
              <div
                className={cn(livePnlPct >= 0 ? "text-positive" : "text-negative")}
                style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}
              >
                {formatPercent(livePnlPct)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P&L Summary for Closed Trades */}
      {(trade.status === "CLOSED" || trade.status === "STOP_LOSS_HIT") && (
        <div
          className="card mb-4"
          style={{
            background: trade.netPnl >= 0
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.02))"
              : "linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(239, 68, 68, 0.02))",
            borderColor: trade.netPnl >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
          }}
        >
          <div className="card-body flex items-center justify-between">
            <div>
              <div className="text-secondary" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>Net P&L</div>
              <span
                className={cn("text-mono", trade.netPnl >= 0 ? "text-positive" : "text-negative")}
                style={{ fontSize: "1.75rem", fontWeight: 800 }}
              >
                {formatINR(trade.netPnl, { showSign: true })}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="text-secondary" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>Return</div>
              <span
                className={cn("text-mono", trade.pnlPercentage >= 0 ? "text-positive" : "text-negative")}
                style={{ fontSize: "1.75rem", fontWeight: 800 }}
              >
                {formatPercent(trade.pnlPercentage)}
              </span>
            </div>
            {trade.rMultiple !== null && (
              <div style={{ textAlign: "right" }}>
                <div className="text-secondary" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>R-Multiple</div>
                <span
                  className={cn("text-mono", trade.rMultiple >= 0 ? "text-positive" : "text-negative")}
                  style={{ fontSize: "1.75rem", fontWeight: 800 }}
                >
                  {trade.rMultiple >= 0 ? "+" : ""}{trade.rMultiple.toFixed(2)}R
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TradingView Chart */}
      <div className="card mb-4">
        <div className="card-header">
          <span className="card-title">
            {trade.symbol} Chart
          </span>
          <div className="flex items-center gap-2">
            {liveQuote && (
              <span className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
                Last updated: {new Date(liveQuote.lastUpdated).toLocaleTimeString("en-IN")}
              </span>
            )}
          </div>
        </div>
        <TradingViewChart
          symbol={trade.symbol}
          exchange={trade.exchange}
          height={440}
        />
      </div>

      {/* Main Grid */}
      <div className="grid-2">
        {/* Trade Details */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Trade Details</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-label">Entry Price</span>
                <span className="stat-value">{formatINR(trade.avgEntryPrice)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Exit Price</span>
                <span className="stat-value">
                  {trade.avgExitPrice ? formatINR(trade.avgExitPrice) : "—"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Buy Qty</span>
                <span className="stat-value">{trade.totalBuyQty}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sell Qty</span>
                <span className="stat-value">{trade.totalSellQty}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Stop Loss</span>
                <span className="stat-value" style={{ color: "var(--color-negative)" }}>
                  {trade.stopLoss ? formatINR(trade.stopLoss) : "—"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Target</span>
                <span className="stat-value" style={{ color: "var(--color-positive)" }}>
                  {trade.target ? formatINR(trade.target) : "—"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gross P&L</span>
                <span className={cn("stat-value", trade.grossPnl >= 0 ? "text-positive" : "text-negative")}>
                  {formatINR(trade.grossPnl, { showSign: true })}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Charges</span>
                <span className="stat-value">{formatINR(trade.totalCharges)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Holding Period</span>
                <span className="stat-value">{formatHoldingPeriod(trade.holdingPeriodMs)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Expected R:R</span>
                <span className="stat-value">
                  {trade.expectedRR ? `1:${trade.expectedRR.toFixed(2)}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Journal */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Journal Notes</span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {trade.strategy && (
              <div>
                <div className="stat-label">Strategy</div>
                <span className="tag" style={{ marginTop: 4 }}>{trade.strategy}</span>
              </div>
            )}
            {trade.setup && (
              <div>
                <div className="stat-label">Setup</div>
                <p style={{ marginTop: 4 }}>{trade.setup}</p>
              </div>
            )}
            {trade.thesis && (
              <div>
                <div className="stat-label">Thesis</div>
                <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{trade.thesis}</p>
              </div>
            )}
            {trade.marketCondition && (
              <div>
                <div className="stat-label">Market Condition</div>
                <span className="tag" style={{ marginTop: 4 }}>{trade.marketCondition}</span>
              </div>
            )}
            {trade.confidence !== null && (
              <div>
                <div className="stat-label">Confidence</div>
                <div className="confidence-slider" style={{ marginTop: 4 }}>
                  <div style={{ flex: 1, height: 6, background: "var(--bg-secondary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${(trade.confidence / 10) * 100}%`,
                        height: "100%",
                        background: "var(--accent-primary)",
                        borderRadius: "var(--radius-full)",
                      }}
                    />
                  </div>
                  <span className="confidence-value">{trade.confidence}/10</span>
                </div>
              </div>
            )}
            {trade.reasonForEntry && (
              <div>
                <div className="stat-label">Reason for Entry</div>
                <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{trade.reasonForEntry}</p>
              </div>
            )}
            {trade.reasonForExit && (
              <div>
                <div className="stat-label">Reason for Exit</div>
                <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{trade.reasonForExit}</p>
              </div>
            )}
            {trade.notes && (
              <div>
                <div className="stat-label">Notes</div>
                <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{trade.notes}</p>
              </div>
            )}
            {trade.postTradeReview && (
              <div>
                <div className="stat-label">Post-Trade Review</div>
                <p style={{ marginTop: 4, color: "var(--text-secondary)" }}>{trade.postTradeReview}</p>
              </div>
            )}
            {trade.mistakes.length > 0 && (
              <div>
                <div className="stat-label">Mistakes</div>
                <div className="flex gap-2 mt-2" style={{ flexWrap: "wrap" }}>
                  {trade.mistakes.map((m) => (
                    <span
                      key={m.id}
                      className="tag"
                      style={{ background: `${m.color}20`, color: m.color || undefined }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!trade.strategy && !trade.thesis && !trade.notes && !trade.reasonForEntry && (
              <div className="empty-state" style={{ padding: "var(--space-6)" }}>
                <p className="text-muted">No journal notes for this trade yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution History */}
      {trade.executions.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <span className="card-title">Execution History</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Side</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Value</th>
                  <th>Order Type</th>
                </tr>
              </thead>
              <tbody>
                {trade.executions.map((exec) => (
                  <tr key={exec.id}>
                    <td style={{ fontSize: "var(--text-sm)" }}>{formatDateTime(exec.executionTime)}</td>
                    <td>
                      <span className={`badge ${exec.side === "BUY" ? "badge-long" : "badge-short"}`}>
                        {exec.side}
                      </span>
                    </td>
                    <td className="col-numeric">{exec.quantity}</td>
                    <td className="col-numeric">{formatINR(exec.price)}</td>
                    <td className="col-numeric">{formatINR(exec.price * exec.quantity)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{exec.orderType || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Trade</span>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>
                {trade.status === "DELETED"
                  ? <span>Are you sure you want to permanently delete the trade history for <strong>{trade.symbol}</strong>? This will completely remove it from your journal and cannot be undone.</span>
                  : <span>Are you sure you want to delete the trade for <strong>{trade.symbol}</strong>? It will be marked as deleted in your journal.</span>
                }
              </p>
              {trade.status !== "DELETED" && trade.netPnl !== 0 && (
                <p className="mt-4 text-secondary" style={{ fontSize: "var(--text-sm)" }}>
                  This trade has a P&L of{" "}
                  <span className={cn(trade.netPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontWeight: 600 }}>
                    {formatINR(trade.netPnl, { showSign: true })}
                  </span>
                  . Deleting it will affect your analytics.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
                id="confirm-delete-trade"
              >
                {deleting ? "Deleting..." : "Delete Trade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Execution Modal */}
      {showAddExecution && (
        <AddExecutionModal
          tradeId={trade.id}
          symbol={trade.symbol}
          exchange={trade.exchange}
          direction={trade.direction}
          currentPrice={currentPrice || trade.avgEntryPrice}
          openQty={openQty}
          onClose={() => setShowAddExecution(false)}
        />
      )}
    </>
  );
}
