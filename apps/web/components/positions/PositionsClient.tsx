"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, formatPercent, formatHoldingPeriod, cn } from "@/lib/utils";
import type { StockQuote } from "@/lib/finance";
import Sparkline from "@/components/charts/Sparkline";
import { useRouter } from "next/navigation";

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
  netPnl: number;
  pnlPercentage: number;
  rMultiple: number | null;
  entryTime: string;
  strategy: string | null;
  setup: string | null;
  stopLoss: number | null;
  target: number | null;
}

interface ChartData {
  symbol: string;
  candles: any[]; // using for sparkline closes
}

export default function PositionsClient({ initialPositions, capital = 1000000, isShared }: { initialPositions: TradeData[], capital?: number, isShared?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [liveQuotes, setLiveQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [chartDataMap, setChartDataMap] = useState<Map<string, number[]>>(new Map());
  
  const openPositionsCount = initialPositions.length;

  useEffect(() => {
    if (initialPositions.length === 0) return;

      const fetchQuotes = async () => {
      try {
        const uniquePositions = Array.from(new Map(initialPositions.map(p => [p.symbol, p])).values());
        const symbolsPayload = uniquePositions.map(p => ({ symbol: p.symbol, exchange: p.exchange }));
        
        const res = await fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: symbolsPayload })
        });
        
        if (res.ok) {
          const data = await res.json();
          const map = new Map<string, StockQuote>();
          for (const [key, quote] of Object.entries(data)) {
            const sym = key.split(":")[0];
            map.set(sym, quote as StockQuote);
          }
          setLiveQuotes(map);
        }

        // Ping the background job to auto-close any trades that hit stop loss
        // This simulates a cron job running while the dashboard is open
        await fetch("/api/cron/stop-loss").catch(() => {});
      } catch { }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [initialPositions]);

  useEffect(() => {
    if (initialPositions.length === 0) return;

    const fetchCharts = async () => {
      const newMap = new Map<string, number[]>();
      const uniquePositions = Array.from(new Map(initialPositions.map(p => [p.symbol, p])).values());

      const promises = uniquePositions.map(async (pos) => {
        try {
          const res = await fetch(`/api/chart?symbol=${pos.symbol}&exchange=${pos.exchange}&range=1mo&interval=1d`);
          if (res.ok) {
            const data = await res.json();
            // Map closes for the sparkline
            const closes = data.candles.map((c: any) => c.close);
            newMap.set(pos.symbol, closes);
          }
        } catch { }
      });

      await Promise.all(promises);
      setChartDataMap(newMap);
    };

    fetchCharts();
  }, [initialPositions]);

  // Derived KPIs
  let totalInvestment = 0;
  let totalLivePnl = 0;
  let bestPerformer = { symbol: "-", pnl: -Infinity, pct: 0 };
  let worstPerformer = { symbol: "-", pnl: Infinity, pct: 0 };

  const enrichedPositions = initialPositions.map(pos => {
    const quote = liveQuotes.get(pos.symbol);
    const currentPrice = quote?.regularMarketPrice;
    const openQty = pos.totalBuyQty - pos.totalSellQty;
    const investment = pos.avgEntryPrice * openQty;
    
    let pnl = 0;
    let pnlPct = 0;

    if (currentPrice) {
      if (pos.direction === "LONG") {
        pnl = (currentPrice - pos.avgEntryPrice) * openQty;
      } else {
        pnl = (pos.avgEntryPrice - currentPrice) * openQty;
      }
      pnlPct = investment > 0 ? (pnl / investment) * 100 : 0;
    }

    totalInvestment += investment;
    totalLivePnl += pnl;

    if (pnl > bestPerformer.pnl) {
      bestPerformer = { symbol: pos.symbol, pnl, pct: pnlPct };
    }
    if (pnl < worstPerformer.pnl) {
      worstPerformer = { symbol: pos.symbol, pnl, pct: pnlPct };
    }

    return { ...pos, openQty, currentPrice, pnl, pnlPct, investment };
  });

  if (enrichedPositions.length === 1) {
    if (enrichedPositions[0].pnl >= 0) {
      worstPerformer = { symbol: "-", pnl: 0, pct: 0 };
    } else {
      bestPerformer = { symbol: "-", pnl: 0, pct: 0 };
    }
  }

  const avgUnrealizedPnl = openPositionsCount > 0 ? totalLivePnl / openPositionsCount : 0;
  const capitalUtilizedPct = capital > 0 ? (totalInvestment / capital) * 100 : 0;
  
  // Calculate total risk (for positions with a stop loss)
  const totalRisk = enrichedPositions.reduce((acc, pos) => {
    if (pos.stopLoss && pos.stopLoss > 0) {
       const price = pos.currentPrice ?? pos.avgEntryPrice;
       const riskPerShare = pos.direction === "LONG" ? (price - pos.stopLoss) : (pos.stopLoss - price);
       if (riskPerShare > 0) return acc + (riskPerShare * pos.openQty);
       return acc; // If current price is past stop loss, risk is technically realized or higher
    }
    return acc;
  }, 0);
  
  const riskRMultiple = capital > 0 ? (totalRisk / (capital * 0.01)) : 0; // Assuming 1R = 1% of capital for simplicity

  const filteredPositions = enrichedPositions.filter(p => {
    if (activeTab === "Long") return p.direction === "LONG";
    if (activeTab === "Short") return p.direction === "SHORT";
    return true;
  });

  const numLongs = initialPositions.filter(p => p.direction === "LONG").length;
  const numShorts = initialPositions.filter(p => p.direction === "SHORT").length;

  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="page-title">Open Positions</h1>
            <p className="text-secondary" style={{ marginTop: 4, fontSize: "var(--text-sm)" }}>
              Track and manage your active trades in real time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              This Month
            </button>
            <div className="search-bar" style={{ width: 220, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid var(--border-secondary)", borderRadius: "var(--radius-md)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search positions..." style={{ background: "transparent", border: "none", outline: "none", width: "100%", fontSize: "var(--text-sm)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-6" style={{ gridTemplateColumns: "1fr 1fr 1fr 1.5fr" }}>
        <div className="card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="flex justify-between items-start">
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em" }}>OPEN POSITIONS</div>
            <div style={{ padding: 4, background: "rgba(37, 99, 235, 0.1)", borderRadius: 6, color: "var(--accent-primary)" }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>{openPositionsCount}</div>
            <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Total active trades</div>
          </div>
        </div>

        <div className="card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="flex justify-between items-start">
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em" }}>TOTAL UNREALIZED P&L</div>
            <div style={{ padding: 4, background: "rgba(16, 185, 129, 0.1)", borderRadius: 6, color: "var(--color-positive)" }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div>
            <div className={cn(totalLivePnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {formatINR(totalLivePnl, { showSign: true })}
            </div>
            <div className={cn(totalLivePnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>
              {formatPercent(totalInvestment > 0 ? (totalLivePnl / totalInvestment) * 100 : 0)} <span className="text-muted font-normal">of capital</span>
            </div>
          </div>
        </div>

        <div className="card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="flex justify-between items-start">
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em" }}>AVG UNREALIZED P&L</div>
            <div style={{ padding: 4, background: "rgba(16, 185, 129, 0.1)", borderRadius: 6, color: "var(--color-positive)" }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            </div>
          </div>
          <div>
            <div className={cn(avgUnrealizedPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {formatINR(avgUnrealizedPnl, { showSign: true })}
            </div>
            <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Per position</div>
          </div>
        </div>

        <div className="card card-body" style={{ display: "flex", gap: "var(--space-4)" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid var(--border-secondary)", paddingRight: "var(--space-4)" }}>
            <div className="flex justify-between items-start">
              <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em" }}>BEST PERFORMER</div>
              <div style={{ padding: 4, background: "rgba(37, 99, 235, 0.1)", borderRadius: 6, color: "var(--accent-primary)" }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
            </div>
            <div>
              <div className="text-positive" style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                {bestPerformer.symbol !== "-" ? formatINR(bestPerformer.pnl, { showSign: true }) : "—"}
              </div>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>{bestPerformer.symbol}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="flex justify-between items-start">
              <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em" }}>WORST PERFORMER</div>
              <div style={{ padding: 4, background: "rgba(239, 68, 68, 0.1)", borderRadius: 6, color: "var(--color-negative)" }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
            </div>
            <div>
              <div className="text-negative" style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                {worstPerformer.symbol !== "-" ? formatINR(worstPerformer.pnl, { showSign: true }) : "—"}
              </div>
              <div className="text-muted" style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>{worstPerformer.symbol}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Tabs & Filters Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-secondary)", padding: "0 var(--space-4)" }}>
          <div style={{ display: "flex" }}>
            {["All", "Long", "Short"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "var(--space-4) var(--space-3)",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  color: activeTab === tab ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontWeight: activeTab === tab ? 600 : 500,
                  fontSize: "var(--text-sm)",
                  cursor: "pointer",
                }}
              >
                {tab === "All" ? "All Positions" : `${tab} (${tab === "Long" ? numLongs : numShorts})`}
              </button>
            ))}
          </div>

        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-secondary)", color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "var(--space-3) var(--space-4)", textAlign: "left", width: 40 }}></th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "left", width: "15%" }}>SYMBOL</th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "left", width: "10%" }}>TYPE / QTY</th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "left", width: "15%" }}>ENTRY / CMP</th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "center", width: 120 }}></th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "right", width: "15%" }}>UNREALIZED P&L / %</th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "right", paddingRight: 20, width: "15%" }}>TARGET / STOP LOSS</th>
                <th style={{ padding: "var(--space-3) 0", textAlign: "left", width: "15%" }}>TIME IN TRADE</th>
                <th style={{ padding: "var(--space-3) var(--space-4)", textAlign: "right", width: "10%" }}>SETUP</th>

              </tr>
            </thead>
            <tbody>
              {filteredPositions.map(pos => {
                const holdingMs = new Date().getTime() - new Date(pos.entryTime).getTime();
                const sparkData = chartDataMap.get(pos.symbol);
                const isPositive = pos.pnlPct >= 0;

                return (
                  <tr key={pos.id} style={{ borderBottom: "1px solid var(--border-secondary)", transition: "background 0.15s" }}>
                    <td style={{ padding: "var(--space-3) var(--space-4)", verticalAlign: "middle" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        {pos.symbol} <span style={{ fontSize: "0.6rem", background: "var(--bg-secondary)", padding: "2px 4px", borderRadius: 4, color: "var(--text-muted)" }}>{pos.exchange}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 2 }}>{pos.symbol} Corp.</div>
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle" }}>
                      <span className={`badge ${pos.direction === "LONG" ? "badge-long" : "badge-short"}`}>{pos.direction}</span>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>{pos.openQty} shares</div>
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{formatINR(pos.avgEntryPrice)}</div>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: pos.currentPrice ? (pos.currentPrice > pos.avgEntryPrice ? "var(--color-positive)" : "var(--color-negative)") : "inherit", marginTop: 4 }}>
                        {pos.currentPrice ? formatINR(pos.currentPrice) : "—"}
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle", textAlign: "center" }}>
                      {sparkData ? (
                        <Sparkline data={sparkData} color={isPositive ? "var(--color-positive)" : "var(--color-negative)"} width={90} height={30} />
                      ) : (
                        <span className="text-muted" style={{ fontSize: "var(--text-xs)" }}>Loading...</span>
                      )}
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle", textAlign: "right" }}>
                      <div className={cn(isPositive ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-sm)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {formatINR(pos.pnl, { showSign: true })}
                      </div>
                      <div className={cn(isPositive ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-xs)", fontWeight: 600, marginTop: 4 }}>
                        {formatPercent(pos.pnlPct)}
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle", textAlign: "right", paddingRight: 20 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                          <span>Target</span>
                          <span>Entry</span>
                          <span style={{ color: "var(--text-primary)" }}>Stop Loss</span>
                        </div>
                        <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", fontFamily: "var(--font-mono)" }}>
                          <span className="text-positive">{pos.target ? formatINR(pos.target) : "—"}</span>
                          <span className="text-muted">{formatINR(pos.avgEntryPrice)}</span>
                          <span className="text-negative">{pos.stopLoss ? formatINR(pos.stopLoss) : "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-3) 0", verticalAlign: "middle" }}>
                      <div style={{ fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)" }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {formatHoldingPeriod(holdingMs)}
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.65rem", marginTop: 4 }}>
                        Since {new Date(pos.entryTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: "var(--space-3) var(--space-4)", verticalAlign: "middle", textAlign: "right" }}>
                      {pos.setup ? (
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--accent-primary)" }}>{pos.setup}</span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "var(--text-xs)" }}>—</span>
                      )}
                    </td>

                  </tr>
                );
              })}
              
              {filteredPositions.length === 0 && (
                 <tr>
                   <td colSpan={9} style={{ padding: "var(--space-10) 0", textAlign: "center", color: "var(--text-muted)" }}>
                     No positions match the selected filter.
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky Footer Summary */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "var(--space-4)", 
          borderTop: "1px solid var(--border-secondary)",
          background: "linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)",
        }}>
          <div>
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>TOTAL UNREALIZED P&L</div>
            <div className={cn(totalLivePnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {formatINR(totalLivePnl, { showSign: true })}
            </div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>TOTAL INVESTMENT</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {formatINR(totalInvestment)}
            </div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>DAILY P&L</div>
            <div className="text-positive" style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {formatINR(totalLivePnl, { showSign: true })} <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>({formatPercent(capital > 0 ? (totalLivePnl / capital) * 100 : 0)})</span>
            </div>
          </div>
          <div style={{ width: 200 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
               <span className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em" }}>CAPITAL UTILIZED</span>
               <span style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>{capitalUtilizedPct.toFixed(1)}%</span>
            </div>
            <div className="settings-progress-bar-bg" style={{ height: 6, marginBottom: 4 }}>
               <div className="settings-progress-bar-fill" style={{ width: `${Math.min(capitalUtilizedPct, 100)}%`, background: "var(--text-primary)" }}></div>
            </div>
            <div className="text-muted" style={{ fontSize: "var(--text-xs)", textAlign: "right" }}>{formatINR(totalInvestment, { compact: true })} / {formatINR(capital, { compact: true })}</div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 2 }}>RISK ON OPEN TRADES</div>
            <div className="text-negative" style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
              {formatINR(totalRisk, { compact: true })} <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>({riskRMultiple.toFixed(2)}R)</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
