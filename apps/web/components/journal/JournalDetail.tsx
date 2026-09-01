"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { formatINR, formatDate, formatTime, formatHoldingPeriod, cn } from "@/lib/utils";

interface Execution {
  id: string;
  side: string;
  quantity: number;
  price: number;
  executionTime: string;
  totalCharges: number | null;
  orderType: string | null;
}

interface TradeEvent {
  id: string;
  type: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

interface TradeData {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  status: string;
  avgEntryPrice: number;
  avgExitPrice: number | null;
  totalBuyQty: number;
  totalSellQty: number;
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
  events?: TradeEvent[];
  mistakes: { name: string; color: string | null }[];
  prevId: string | null;
  nextId: string | null;
}

function useLiveHoldingPeriod(entryTime: string, initialMs: number | null) {
  const [ms, setMs] = useState(initialMs);

  useEffect(() => {
    if (initialMs !== null) return;
    const entryDate = new Date(entryTime).getTime();
    
    const update = () => {
      setMs(Date.now() - entryDate);
    };
    
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [entryTime, initialMs]);

  const text = formatHoldingPeriod(ms);
  const isLive = initialMs === null;

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

export default function JournalDetail({ trade, isShared, sharedUserId }: { trade: TradeData, isShared?: boolean, sharedUserId?: string }) {
  const router = useRouter();
  const liveDuration = useLiveHoldingPeriod(trade.entryTime, trade.holdingPeriodMs);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const entrySide = trade.direction === "LONG" ? "BUY" : "SELL";
  const exitSide = trade.direction === "LONG" ? "SELL" : "BUY";

  const entryExecutions = trade.executions.filter((e) => e.side === entrySide);
  const exitExecutions = trade.executions.filter((e) => e.side === exitSide);

  // Calculate entry summary
  const totalEntryQty = entryExecutions.reduce((s, e) => s + e.quantity, 0);
  const totalEntryValue = entryExecutions.reduce((s, e) => s + e.quantity * e.price, 0);
  const avgEntryCalc = totalEntryQty > 0 ? totalEntryValue / totalEntryQty : trade.avgEntryPrice;

  // Calculate exit summary
  const totalExitQty = exitExecutions.reduce((s, e) => s + e.quantity, 0);
  const totalExitValue = exitExecutions.reduce((s, e) => s + e.quantity * e.price, 0);
  const avgExitCalc = totalExitQty > 0 ? totalExitValue / totalExitQty : (trade.avgExitPrice ?? 0);

  // Calculate total fees
  const totalFees = trade.totalCharges || trade.executions.reduce((s, e) => s + (e.totalCharges || 0), 0);

  // Breakeven
  const breakeven = trade.stopLoss && trade.avgEntryPrice
    ? trade.avgEntryPrice + (totalFees / (totalEntryQty || 1)) * (trade.direction === "LONG" ? 1 : -1)
    : null;

  // Risk calculations
  const riskPerShare = trade.stopLoss ? Math.abs(trade.avgEntryPrice - trade.stopLoss) : 0;
  const actualRiskAmount = riskPerShare * (totalEntryQty || trade.totalBuyQty);
  const rewardPerShare = trade.target ? Math.abs(trade.target - trade.avgEntryPrice) : 0;
  const potentialReward = rewardPerShare * (totalEntryQty || trade.totalBuyQty);

  // Emojis for confidence
  const renderConfidenceEmoji = (value: number | null) => {
    if (!value) return "—";
    
    let emoji = "😐";
    if (value <= 2) emoji = "😟";
    else if (value <= 4) emoji = "😐";
    else if (value <= 6) emoji = "🙂";
    else if (value <= 8) emoji = "😎";
    else emoji = "🤩";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "20px" }}>{emoji}</span>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>{value}/10</span>
      </div>
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const isAlreadyDeleted = trade.status === "DELETED";
      const res = await fetch(`/api/trades/${trade.id}${isAlreadyDeleted ? '?hard=true' : ''}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/journal");
        router.refresh();
      }
    } catch { /* */ }
    finally { setDeleting(false); }
  };

  return (
    <>
      {/* Back link */}
      <Link
        href={isShared ? `/shared/${sharedUserId}/journal` : "/journal"}
        className="text-muted"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)", marginBottom: "var(--space-4)", textDecoration: "none" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        {isShared ? "Back to Shared Journal" : "Back to Journal"}
      </Link>

      <div className="dashboard-grid">
        {/* ─── LEFT COLUMN ─── */}
        <div className="col-span-8 space-y-6">

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0 }}>{trade.symbol}</h1>
              <span className={`badge ${trade.direction === "LONG" ? "badge-long" : "badge-short"}`}>
                ● {trade.direction}
              </span>
              <span className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                {trade.exchange} · {formatDate(trade.entryTime)}
              </span>
              {trade.setup && (
                <span className="tag" style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "var(--accent-primary)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                }}>
                  {trade.setup}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              {!isShared && (
                <>
                  <Link href={`/trades/${trade.id}/edit`} className="btn btn-secondary btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </Link>
                  <button className="btn btn-ghost btn-sm text-negative" onClick={() => setShowDeleteConfirm(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </>
              )}
              {/* Prev / Next */}
              <Link
                href={trade.prevId ? (isShared ? `/shared/${sharedUserId}/journal/${trade.prevId}` : `/journal/${trade.prevId}`) : "#"}
                className={cn("btn btn-ghost btn-sm btn-icon", !trade.prevId && "disabled")}
                style={{ pointerEvents: trade.prevId ? "auto" : "none", opacity: trade.prevId ? 1 : 0.3 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </Link>
              <Link
                href={trade.nextId ? (isShared ? `/shared/${sharedUserId}/journal/${trade.nextId}` : `/journal/${trade.nextId}`) : "#"}
                className={cn("btn btn-ghost btn-sm btn-icon", !trade.nextId && "disabled")}
                style={{ pointerEvents: trade.nextId ? "auto" : "none", opacity: trade.nextId ? 1 : 0.3 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
            </div>
          </div>

          {/* KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-4)" }}>
            <div className="card" style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center", overflow: "hidden" }} title={trade.rMultiple !== null ? `${trade.rMultiple >= 0 ? "+" : ""}${trade.rMultiple.toFixed(2)}R` : "—"}>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>R-MULTIPLE</div>
              <div className={cn(
                (trade.rMultiple ?? 0) >= 0 ? "text-positive" : "text-negative"
              )} style={{ fontSize: "var(--text-xl)", fontWeight: 700, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {trade.rMultiple !== null ? `${trade.rMultiple >= 0 ? "+" : ""}${trade.rMultiple.toFixed(2)}R` : "—"}
              </div>
            </div>
            <div className="card" style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center", overflow: "hidden" }} title={formatINR(trade.netPnl, { showSign: true })}>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>P&L</div>
              <div className={cn(trade.netPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-xl)", fontWeight: 700, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {formatINR(trade.netPnl, { showSign: true, compact: true })}
              </div>
            </div>
            <div className="card" style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center", overflow: "hidden" }} title={`${trade.pnlPercentage >= 0 ? "+" : ""}${trade.pnlPercentage.toFixed(2)}%`}>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>RETURN</div>
              <div className={cn(trade.pnlPercentage >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-xl)", fontWeight: 700, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {trade.pnlPercentage >= 0 ? "+" : ""}{trade.pnlPercentage.toFixed(2)}%
              </div>
            </div>
            <div className="card" style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center", overflow: "hidden" }} title={liveDuration.text}>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>DURATION</div>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {liveDuration.node}
              </div>
            </div>
            <div className="card" style={{ padding: "var(--space-3) var(--space-4)", textAlign: "center" }}>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 4 }}>CONFIDENCE</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {renderConfidenceEmoji(trade.confidence)}
              </div>
            </div>
          </div>

          {/* Trade Setup + Thesis */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div className="card">
              <div className="card-header"><span className="card-title">Trade Setup</span></div>
              <div className="card-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  {[
                    { label: "Setup", value: trade.setup },
                    { label: "Market Condition", value: trade.marketCondition },
                    { label: "Strategy", value: trade.strategy },
                    { label: "Emotional State", value: trade.emotionalState },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{item.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Thesis</span></div>
              <div className="card-body">
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                  {trade.thesis || "No thesis recorded for this trade."}
                </p>
              </div>
            </div>
          </div>

          {/* ─── EXECUTION SECTION ─── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                EXECUTION
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>

              {/* Entry Orders */}
              <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Entry Orders</span>
                </div>
                {entryExecutions.length > 0 ? (
                  <>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                          <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>#</th>
                          <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Time</th>
                          <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Type</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Price (₹)</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Qty</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Value (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entryExecutions.map((exec, i) => (
                          <tr key={exec.id} style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                            <td style={{ padding: "8px", color: "var(--text-muted)" }}>{i + 1}</td>
                            <td style={{ padding: "8px" }}>{formatDate(exec.executionTime)}, {formatTime(exec.executionTime)}</td>
                            <td style={{ padding: "8px" }}>
                              <span style={{
                                padding: "2px 8px",
                                borderRadius: "var(--radius-sm)",
                                fontSize: 11,
                                fontWeight: 600,
                                background: i === 0 ? "rgba(99, 102, 241, 0.15)" : "rgba(16, 185, 129, 0.1)",
                                color: i === 0 ? "var(--accent-primary)" : "var(--color-positive)",
                              }}>
                                {i === 0 ? "Initial Entry" : "Add on"}
                              </span>
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                              {formatINR(exec.price)}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                              {exec.quantity}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                              {formatINR(exec.quantity * exec.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Entry Summary */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 8px",
                      background: "rgba(16, 185, 129, 0.06)",
                      borderRadius: "var(--radius-sm)",
                      marginTop: "var(--space-2)",
                      fontSize: "var(--text-sm)",
                    }}>
                      <span>Avg Entry Price: <strong className="text-positive" style={{ fontFamily: "var(--font-mono)" }}>{formatINR(avgEntryCalc)}</strong></span>
                      <span>Total Qty: <strong style={{ fontFamily: "var(--font-mono)" }}>{totalEntryQty}</strong></span>
                      <span>Total Value: <strong className="text-positive" style={{ fontFamily: "var(--font-mono)" }}>{formatINR(totalEntryValue)}</strong></span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted" style={{ fontSize: "var(--text-sm)", padding: "var(--space-3)" }}>
                    No entry executions recorded. Entry was logged manually.
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--border-secondary)" }} />

              {/* Exit Orders */}
              <div style={{ padding: "var(--space-4) var(--space-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Exit Orders</span>
                </div>
                {exitExecutions.length > 0 ? (
                  <>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                          <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>#</th>
                          <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Time</th>
                          <th style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Type</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Price (₹)</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Qty</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>Value (₹)</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>R Multiple</th>
                          <th style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)", fontWeight: 600, fontSize: "var(--text-xs)" }}>P&L (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exitExecutions.map((exec, i) => {
                          const exitPnl = trade.direction === "LONG"
                            ? (exec.price - avgEntryCalc) * exec.quantity
                            : (avgEntryCalc - exec.price) * exec.quantity;
                          const exitR = riskPerShare > 0
                            ? (trade.direction === "LONG" ? exec.price - avgEntryCalc : avgEntryCalc - exec.price) / riskPerShare
                            : 0;
                          return (
                            <tr key={exec.id} style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                              <td style={{ padding: "8px", color: "var(--text-muted)" }}>{i + 1}</td>
                              <td style={{ padding: "8px" }}>{formatDate(exec.executionTime)}, {formatTime(exec.executionTime)}</td>
                              <td style={{ padding: "8px" }}>
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: i === exitExecutions.length - 1 ? "rgba(239, 68, 68, 0.1)" : "rgba(251, 191, 36, 0.1)",
                                  color: i === exitExecutions.length - 1 ? "var(--color-negative)" : "#f59e0b",
                                }}>
                                  {i === exitExecutions.length - 1 && (trade.status === "CLOSED" || trade.status === "STOP_LOSS_HIT") ? "Final Exit" : "Partial Exit"}
                                </span>
                              </td>
                              <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{formatINR(exec.price)}</td>
                              <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{exec.quantity}</td>
                              <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>{formatINR(exec.quantity * exec.price)}</td>
                              <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                                <span className={cn(exitR >= 0 ? "text-positive" : "text-negative")}>
                                  {exitR >= 0 ? "+" : ""}{exitR.toFixed(2)}R
                                </span>
                              </td>
                              <td style={{ padding: "8px", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                                <span className={cn(exitPnl >= 0 ? "text-positive" : "text-negative")}>
                                  {formatINR(exitPnl, { showSign: true })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {/* Exit Summary */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 8px",
                      background: "rgba(239, 68, 68, 0.04)",
                      borderRadius: "var(--radius-sm)",
                      marginTop: "var(--space-2)",
                      fontSize: "var(--text-sm)",
                    }}>
                      <span>Total Exit Value: <strong style={{ fontFamily: "var(--font-mono)" }}>{formatINR(totalExitValue)}</strong></span>
                      <span>Realized P&L: <strong className={cn(trade.grossPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontFamily: "var(--font-mono)" }}>{formatINR(trade.grossPnl, { showSign: true })}</strong></span>
                      <span>Total R-Multiple: <strong className={cn((trade.rMultiple ?? 0) >= 0 ? "text-positive" : "text-negative")} style={{ fontFamily: "var(--font-mono)" }}>{trade.rMultiple !== null ? `${trade.rMultiple >= 0 ? "+" : ""}${trade.rMultiple.toFixed(2)}R` : "—"}</strong></span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted" style={{ fontSize: "var(--text-sm)", padding: "var(--space-3)" }}>
                    No exit orders yet. This position is still open.
                  </div>
                )}
              </div>

              {/* Fees & Net P&L */}
              <div style={{
                padding: "var(--space-3) var(--space-5)",
                borderTop: "1px solid var(--border-secondary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-secondary)",
              }}>
                <span style={{ fontSize: "var(--text-sm)" }}>
                  Fees & Charges: <strong style={{ fontFamily: "var(--font-mono)" }}>{formatINR(totalFees)}</strong>
                </span>
                <span style={{ fontSize: "var(--text-sm)" }}>
                  Net P&L: <strong className={cn(trade.netPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-lg)" }}>
                    {formatINR(trade.netPnl, { showSign: true })}
                  </strong>
                  <span className="text-muted" style={{ fontSize: "var(--text-xs)", marginLeft: 4 }}>(After fees)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Lessons & Takeaways */}
          {(trade.postTradeReview || trade.reasonForEntry || trade.reasonForExit) && (
            <div className="card">
              <div className="card-header"><span className="card-title">Lessons & Takeaways</span></div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {trade.postTradeReview?.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
                      <span style={{ marginTop: 2 }}>
                        {i === 0 ? "🟢" : i === 1 ? "🟢" : "🔴"}
                      </span>
                      <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>{line}</span>
                    </div>
                  ))}
                  {trade.reasonForEntry && !trade.postTradeReview && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
                      <span>🟢</span>
                      <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>Entry: {trade.reasonForEntry}</span>
                    </div>
                  )}
                  {trade.reasonForExit && !trade.postTradeReview && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}>
                      <span>🔴</span>
                      <span style={{ fontSize: "var(--text-sm)", lineHeight: 1.6 }}>Exit: {trade.reasonForExit}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN (SIDEBAR) ─── */}
        <div className="col-span-4 space-y-4">

          {/* Trade Summary */}
          <div className="card">
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title">Trade Summary</span>
              <span className={cn(
                "badge",
                trade.status === "CLOSED" ? "badge-closed" :
                trade.status === "OPEN" ? "badge-open" :
                trade.status === "STOP_LOSS_HIT" ? "badge-stop-loss-hit" :
                trade.status === "DELETED" ? "badge-closed" : "badge-partial"
              )}>
                {trade.status === "CLOSED" ? "Closed" : 
                 trade.status === "STOP_LOSS_HIT" ? "SL Hit" :
                 trade.status === "OPEN" ? "Open" : trade.status === "DELETED" ? "Deleted" : "Partial"}
              </span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {/* Entry / Exit Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border-secondary)" }}>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Entry</div>
                  <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{formatINR(trade.avgEntryPrice)}</div>
                  <div className="text-muted" style={{ fontSize: 10 }}>{formatDate(trade.entryTime)}, {formatTime(trade.entryTime)}</div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Exit</div>
                  <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {trade.avgExitPrice ? formatINR(trade.avgExitPrice) : "—"}
                  </div>
                  {trade.exitTime && (
                    <div className="text-muted" style={{ fontSize: 10 }}>{formatDate(trade.exitTime)}, {formatTime(trade.exitTime)}</div>
                  )}
                </div>
              </div>

              {/* Qty / Hold Time / Net P&L */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid var(--border-secondary)" }}>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Quantity</div>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{trade.totalBuyQty}</div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Holding Time</div>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{liveDuration.node}</div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Net P&L</div>
                  <div className={cn(trade.netPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {formatINR(trade.netPnl, { showSign: true })}
                  </div>
                </div>
              </div>

              {/* R-Multiple / Return / Fees */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid var(--border-secondary)" }}>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>R-Multiple</div>
                  <div className={cn((trade.rMultiple ?? 0) >= 0 ? "text-positive" : "text-negative")} style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {trade.rMultiple !== null ? `${trade.rMultiple >= 0 ? "+" : ""}${trade.rMultiple.toFixed(2)}R` : "—"}
                  </div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Return</div>
                  <div className={cn(trade.pnlPercentage >= 0 ? "text-positive" : "text-negative")} style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {trade.pnlPercentage >= 0 ? "+" : ""}{trade.pnlPercentage.toFixed(2)}%
                  </div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Fees</div>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{formatINR(totalFees)}</div>
                </div>
              </div>

              {/* Risk / Reward */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border-secondary)" }}>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Risk (Planned)</div>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {trade.riskAmount ? formatINR(trade.riskAmount) : (actualRiskAmount > 0 ? `${formatINR(actualRiskAmount)} (${trade.expectedRR ? trade.expectedRR.toFixed(2) + "R" : ""})` : "—")}
                  </div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Reward</div>
                  <div style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {potentialReward > 0 ? formatINR(potentialReward) : "—"}
                  </div>
                </div>
              </div>

              {/* SL / Target / Breakeven */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: 0 }}>
                <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-secondary)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Stop Loss</div>
                  <div className="text-negative" style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {trade.stopLoss ? formatINR(trade.stopLoss) : "—"}
                  </div>
                </div>
                <div style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid var(--border-secondary)" }}>
                  <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginBottom: 2 }}>Target</div>
                  <div className="text-positive" style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {trade.target ? formatINR(trade.target) : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Journey */}
          {(trade.executions.length > 0 || (trade.events && trade.events.length > 0)) && (
            <div className="card">
              <div className="card-header"><span className="card-title">Trade Journey</span></div>
              <div className="card-body">
                <div style={{ position: "relative", paddingLeft: 24 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    {(() => {
                      let runningQty = 0;
                      // Merge executions and events
                      const journeyItems = [
                        ...trade.executions.map(e => ({ type: 'EXECUTION', time: new Date(e.executionTime).getTime(), data: e })),
                        ...(trade.events || []).map(e => ({ type: 'EVENT', time: new Date(e.createdAt).getTime(), data: e }))
                      ].sort((a, b) => a.time - b.time);

                      return journeyItems.map((item, index) => {
                        let color = "#9ca3af";
                        let title = "";
                        let timeStr = "";

                        if (item.type === 'EXECUTION') {
                          const exec = item.data as Execution;
                          const isEntry = exec.side === entrySide;
                          if (isEntry) {
                            runningQty += exec.quantity;
                          } else {
                            runningQty -= exec.quantity;
                          }
                          const isCompleteExit = !isEntry && runningQty <= 0;
                          color = isCompleteExit ? "#9ca3af" : (exec.side === "BUY" ? "var(--color-positive)" : "var(--color-negative)");
                          timeStr = `${formatDate(exec.executionTime)}, ${formatTime(exec.executionTime)}`;
                          title = `${exec.side === entrySide ? "Bought" : "Sold"} ${exec.quantity} @ ${formatINR(exec.price)}`;
                        } else {
                          const ev = item.data as TradeEvent;
                          color = "var(--accent-primary)";
                          timeStr = `${formatDate(ev.createdAt)}, ${formatTime(ev.createdAt)}`;
                          title = ev.description || "Updated Trade";
                        }
                      
                        // Calculate next item color for connecting line
                        let nextColor = "#9ca3af";
                        if (index < journeyItems.length - 1) {
                          const nextItem = journeyItems[index + 1];
                          if (nextItem.type === 'EXECUTION') {
                            const nextExec = nextItem.data as Execution;
                            const nextIsEntry = nextExec.side === entrySide;
                            const nextRunningQty = runningQty + (nextIsEntry ? nextExec.quantity : -nextExec.quantity);
                            const nextIsCompleteExit = !nextIsEntry && nextRunningQty <= 0;
                            nextColor = nextIsCompleteExit ? "#9ca3af" : (nextExec.side === "BUY" ? "var(--color-positive)" : "var(--color-negative)");
                          } else {
                            nextColor = "var(--accent-primary)";
                          }
                        }

                      return (
                        <div key={`${item.type}-${item.data.id}`} style={{ position: "relative" }}>
                          {/* Connecting Line */}
                          {(index < journeyItems.length - 1 || trade.status === "DELETED") && (
                            <div style={{
                              position: "absolute",
                              left: -20, // Center at -19 (width 2)
                              top: 10, // Center of the dot (top 5 + height 5)
                              bottom: "calc(-1 * var(--space-4) - 10px)",
                              width: 2,
                              background: index < journeyItems.length - 1 ? nextColor : "#ef4444",
                              opacity: 0.5,
                              zIndex: 0,
                            }} />
                          )}
                          
                          {/* Dot / Icon */}
                          {item.type === 'EXECUTION' ? (
                            <div style={{
                              position: "absolute",
                              left: -24,
                              top: 5,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: color,
                              zIndex: 1,
                            }} />
                          ) : (
                            <div style={{
                              position: "absolute",
                              left: -26,
                              top: 3,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "var(--bg-primary)",
                              border: `2px solid ${color}`,
                              zIndex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
                            </div>
                          )}
                          
                          <div>
                            <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: color }}>
                              {timeStr}
                            </div>
                            <div style={{ fontSize: "var(--text-sm)", marginTop: 2 }}>
                              {title}
                            </div>
                          </div>
                        </div>
                      );
                    })})()}
                    {/* Deleted marker */}
                    {trade.status === "DELETED" && (
                      <div style={{ position: "relative" }}>
                        {/* Red dot */}
                        <div style={{
                          position: "absolute",
                          left: -24,
                          top: 5,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#ef4444",
                          zIndex: 1,
                        }} />
                        <div>
                          <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "#ef4444" }}>
                            {trade.exitTime
                              ? `${formatDate(trade.exitTime)}, ${formatTime(trade.exitTime)}`
                              : "Date and time not recorded"}
                          </div>
                          <div style={{ fontSize: "var(--text-sm)", marginTop: 2 }}>
                            {trade.totalBuyQty === trade.totalSellQty
                              ? "Trade Archived"
                              : `Liquidated ${trade.totalBuyQty - trade.totalSellQty} open positions${trade.avgExitPrice ? ` @ ${formatINR(trade.avgExitPrice)}` : ""}`
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {trade.mistakes.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Tags</span></div>
              <div className="card-body">
                <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                  {trade.mistakes.map((m, i) => (
                    <span
                      key={i}
                      className="tag"
                      style={{
                        background: m.color ? `${m.color}20` : "rgba(99, 102, 241, 0.15)",
                        color: m.color || "var(--accent-primary)",
                        border: `1px solid ${m.color || "var(--accent-primary)"}40`,
                        padding: "4px 12px",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                      }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Notes</span>
              </div>
              <div className="card-body">
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                  {trade.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Trade</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteConfirm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : (trade.status === "DELETED" ? "Permanently Delete" : "Delete Trade")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
