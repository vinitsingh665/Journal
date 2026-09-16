"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR, formatPercent, formatHoldingPeriod, cn } from "@/lib/utils";
import type { StockQuote } from "@/lib/finance";
import MiniCandleChart from "./MiniCandleChart";

interface Position {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  avgEntryPrice: number;
  quantity: number;
  stopLoss: number | null;
  target: number | null;
  entryTime: string;
  pnlPercent: number;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  symbol: string;
  candles: Candle[];
  currentPrice: number | null;
  interval: string;
}

/** Pick the chart interval and range so the entry candle is always in view. */
function getChartParams(entryTime: string): { range: string; interval: string } {
  const holdingDays = (Date.now() - new Date(entryTime).getTime()) / (1000 * 60 * 60 * 24);
  if (holdingDays < 30) {
    return { range: "1mo", interval: "1d" };   // < 30 days  → daily candles
  } else if (holdingDays < 210) {
    return { range: "6mo", interval: "1wk" };  // 30 d – 7 mo → weekly candles
  } else {
    return { range: "2y",  interval: "1mo" };  // > 7 months → monthly candles
  }
}

export default function OpenPositions({ positions }: { positions: Position[] }) {
  const [liveQuotes, setLiveQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [chartDataMap, setChartDataMap] = useState<Map<string, ChartData>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (positions.length === 0) return;

      const fetchQuotes = async () => {
      setLoading(true);
      try {
        const uniquePositions = Array.from(new Map(positions.map(p => [p.symbol, p])).values());
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
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [positions]);

  // Fetch chart data for each position
  useEffect(() => {
    if (positions.length === 0) return;

    const fetchCharts = async () => {
      const newMap = new Map<string, ChartData>();
      const uniquePositions = Array.from(new Map(positions.map(p => [p.symbol, p])).values());

      const promises = uniquePositions.map(async (pos) => {
        try {
          const { range, interval } = getChartParams(pos.entryTime);
          const res = await fetch(`/api/chart?symbol=${pos.symbol}&exchange=${pos.exchange}&range=${range}&interval=${interval}`);
          if (res.ok) {
            const data = await res.json();
            newMap.set(pos.symbol, { ...data, interval });
          }
        } catch {
          // silently fail
        }
      });

      await Promise.all(promises);
      setChartDataMap(newMap);
    };

    fetchCharts();
  }, [positions]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>Open Positions</h3>
          {loading && (
            <span className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
              Refreshing prices...
            </span>
          )}
        </div>
        <Link href="/positions" className="btn btn-ghost btn-sm">
          View All
        </Link>
      </div>
      <div className="position-grid" id="open-positions-grid">
        {positions.map((pos) => {
          const holdingMs = new Date().getTime() - new Date(pos.entryTime).getTime();
          const quote = liveQuotes.get(pos.symbol);
          const currentPrice = quote?.regularMarketPrice;
          const chartData = chartDataMap.get(pos.symbol);

          // Calculate live P&L if we have a quote
          let pnl = 0;
          let pnlPct = pos.pnlPercent;
          if (currentPrice) {
            if (pos.direction === "LONG") {
              pnl = (currentPrice - pos.avgEntryPrice) * pos.quantity;
            } else {
              pnl = (pos.avgEntryPrice - currentPrice) * pos.quantity;
            }
            const investment = pos.avgEntryPrice * pos.quantity;
            pnlPct = investment > 0 ? (pnl / investment) * 100 : 0;
          }

          const pnlPositive = pnlPct >= 0;

          // Position value
          const positionValue = pos.avgEntryPrice * pos.quantity;

          return (
            <div
              key={pos.id}
              className="position-card"
              id={`position-${pos.symbol}`}
            >
              {/* Card Header: Symbol, Badge, P&L */}
              <div className="position-card-header">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="position-symbol">{pos.symbol}</span>
                    <span className={`badge ${pos.direction === "LONG" ? "badge-long" : "badge-short"}`}>
                      {pos.direction}
                    </span>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>
                    {pos.quantity} shares · {formatHoldingPeriod(holdingMs)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={cn("position-pnl", pnlPositive ? "text-positive" : "text-negative")}>
                    {formatPercent(pnlPct)}
                  </div>
                  {currentPrice && pnl !== 0 && (
                    <div
                      className={cn(pnlPositive ? "text-positive" : "text-negative")}
                      style={{ fontSize: "var(--text-sm)", fontFamily: "var(--font-mono)", fontWeight: 600 }}
                    >
                      {formatINR(pnl, { showSign: true, compact: true })}
                    </div>
                  )}
                </div>
              </div>

              {/* Mini Candlestick Chart */}
              {chartData && chartData.candles.length > 0 ? (
                <div style={{ margin: "8px -8px 0 -8px" }}>
                                <MiniCandleChart
                    candles={chartData.candles}
                    entryPrice={pos.avgEntryPrice}
                    entryTime={new Date(pos.entryTime).getTime()}
                    currentPrice={currentPrice || chartData.currentPrice || undefined}
                    height={120}
                    interval={chartData.interval}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    fontSize: "var(--text-xs)",
                  }}
                >
                  Loading chart...
                </div>
              )}

              {/* Entry & CMP Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: "1px solid var(--border-secondary)",
                }}
              >
                <div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Entry </span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                    }}
                  >
                    {formatINR(pos.avgEntryPrice)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>CMP </span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: currentPrice
                        ? currentPrice >= pos.avgEntryPrice
                          ? "var(--color-positive)"
                          : "var(--color-negative)"
                        : "var(--text-primary)",
                    }}
                  >
                    {currentPrice
                      ? formatINR(currentPrice)
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Day change indicator */}
              {quote && (
                <div
                  style={{
                    marginTop: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    background:
                      quote.regularMarketChange >= 0
                        ? "var(--color-positive-bg)"
                        : "var(--color-negative-bg)",
                    fontSize: "var(--text-xs)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="text-muted">Today</span>
                  <span
                    className={cn(
                      quote.regularMarketChange >= 0 ? "text-positive" : "text-negative"
                    )}
                    style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}
                  >
                    {quote.regularMarketChange >= 0 ? "+" : ""}
                    {formatINR(Math.abs(quote.regularMarketChange))} (
                    {formatPercent(quote.regularMarketChangePercent)})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
