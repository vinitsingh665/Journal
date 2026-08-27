"use client";

import React, { useMemo } from "react";
import { formatINR, cn } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TradeData {
  id: string;
  symbol: string;
  direction: string;
  setup: string | null;
  netPnl: number;
  grossPnl: number;
  rMultiple: number | null;
  entryTime: string;
  exitTime: string;
  holdingPeriodMs: number | null;
}

export default function AnalyticsDashboard({ initialTrades }: { initialTrades: TradeData[] }) {
  // ─── AGGREGATE MATH ──────────────────────────────────────────────────────────
  const {
    totalPnl,
    winRate,
    winningCount,
    losingCount,
    profitFactor,
    expectancy,
    avgRMultiple,
    maxDrawdown,
    avgHoldingMs,
    bestTrade,
    worstTrade,
    avgWin,
    avgLoss,
    maxWinStreak,
    maxLossStreak,
  } = useMemo(() => {
    let totalPnl = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let rSum = 0;
    let rCount = 0;
    let winningCount = 0;
    let losingCount = 0;
    let holdingSum = 0;
    let holdingCount = 0;
    let bestTrade = 0;
    let worstTrade = 0;

    let currentPeak = 0;
    let maxDrawdown = 0;
    let cumulativePnl = 0;

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    const sorted = [...initialTrades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());

    sorted.forEach((t) => {
      totalPnl += t.netPnl;
      cumulativePnl += t.netPnl;

      if (cumulativePnl > currentPeak) {
        currentPeak = cumulativePnl;
      }
      const drawdown = currentPeak - cumulativePnl;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      if (t.netPnl > 0) {
        grossProfit += t.netPnl;
        winningCount++;
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
        if (t.netPnl > bestTrade) bestTrade = t.netPnl;
      } else if (t.netPnl < 0) {
        grossLoss += Math.abs(t.netPnl);
        losingCount++;
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
        if (t.netPnl < worstTrade) worstTrade = t.netPnl;
      }

      if (t.rMultiple !== null) {
        rSum += t.rMultiple;
        rCount++;
      }

      if (t.holdingPeriodMs) {
        holdingSum += t.holdingPeriodMs;
        holdingCount++;
      }
    });

    const totalTrades = winningCount + losingCount;
    const winRate = totalTrades > 0 ? winningCount / totalTrades : 0;
    const lossRate = totalTrades > 0 ? losingCount / totalTrades : 0;
    const avgWin = winningCount > 0 ? grossProfit / winningCount : 0;
    const avgLoss = losingCount > 0 ? grossLoss / losingCount : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);
    const expectancy = (winRate * avgWin) - (lossRate * avgLoss);
    const avgRMultiple = rCount > 0 ? rSum / rCount : 0;
    const avgHoldingMs = holdingCount > 0 ? holdingSum / holdingCount : 0;

    return {
      totalPnl,
      winRate: winRate * 100,
      winningCount,
      losingCount,
      profitFactor,
      expectancy,
      avgRMultiple,
      maxDrawdown,
      avgHoldingMs,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
      maxWinStreak,
      maxLossStreak,
    };
  }, [initialTrades]);

  // ─── FORMATTERS ──────────────────────────────────────────────────────────────
  const formatTime = (ms: number) => {
    if (ms === 0) return "—";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`;
  };

  // ─── CHARTS DATA ─────────────────────────────────────────────────────────────
  
  // Equity Curve
  const equityData = useMemo(() => {
    let cum = 0;
    const labels: string[] = [];
    const data: number[] = [];
    [...initialTrades]
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
      .forEach((t) => {
        cum += t.netPnl;
        labels.push(new Date(t.entryTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
        data.push(cum);
      });
    return { labels, data };
  }, [initialTrades]);

  // Monthly Performance
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pnlByMonth = new Array(12).fill(0);
    initialTrades.forEach(t => {
      const month = new Date(t.entryTime).getMonth();
      pnlByMonth[month] += t.netPnl;
    });
    return pnlByMonth;
  }, [initialTrades]);

  // R-Multiple Bins
  const rBins = useMemo(() => {
    const bins = { '< -3R': 0, '-3R to -2R': 0, '-2R to -1R': 0, '-1R to 0': 0, '0 to 1R': 0, '1R to 2R': 0, '2R to 3R': 0, '> 3R': 0 };
    initialTrades.forEach(t => {
      if (t.rMultiple === null) return;
      const r = t.rMultiple;
      if (r < -3) bins['< -3R']++;
      else if (r >= -3 && r < -2) bins['-3R to -2R']++;
      else if (r >= -2 && r < -1) bins['-2R to -1R']++;
      else if (r >= -1 && r < 0) bins['-1R to 0']++;
      else if (r >= 0 && r < 1) bins['0 to 1R']++;
      else if (r >= 1 && r < 2) bins['1R to 2R']++;
      else if (r >= 2 && r < 3) bins['2R to 3R']++;
      else bins['> 3R']++;
    });
    return bins;
  }, [initialTrades]);

  // Tables Data Grouping
  const groupData = (keyFn: (t: TradeData) => string) => {
    const groups: Record<string, { count: number; wins: number; pnl: number; rSum: number; rCount: number }> = {};
    initialTrades.forEach(t => {
      const k = keyFn(t);
      if (!k) return;
      if (!groups[k]) groups[k] = { count: 0, wins: 0, pnl: 0, rSum: 0, rCount: 0 };
      groups[k].count++;
      groups[k].pnl += t.netPnl;
      if (t.netPnl > 0) groups[k].wins++;
      if (t.rMultiple !== null) {
        groups[k].rSum += t.rMultiple;
        groups[k].rCount++;
      }
    });
    return Object.entries(groups)
      .map(([name, data]) => ({
        name,
        trades: data.count,
        winRate: (data.wins / data.count) * 100,
        pnl: data.pnl,
        avgR: data.rCount > 0 ? data.rSum / data.rCount : null,
      }))
      .sort((a, b) => b.trades - a.trades);
  };

  const bySetup = useMemo(() => groupData(t => t.setup || "No Setup"), [initialTrades]);
  const bySymbol = useMemo(() => groupData(t => t.symbol), [initialTrades]);
  const byDayOfWeek = useMemo(() => groupData(t => new Date(t.entryTime).toLocaleDateString('en-US', { weekday: 'long' })), [initialTrades]);
  const byTimeOfDay = useMemo(() => groupData(t => {
    const hour = new Date(t.entryTime).getHours();
    if (hour < 11) return "9:15 AM - 11:00 AM";
    if (hour < 13) return "11:00 AM - 1:00 PM";
    if (hour < 15) return "1:00 PM - 3:00 PM";
    return "After 3:00 PM";
  }), [initialTrades]);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* 1. TOP KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-4)" }}>
        {[
          { label: "TOTAL P&L", value: formatINR(totalPnl, { showSign: true, compact: true }), color: totalPnl >= 0 ? "var(--color-positive)" : "var(--color-negative)", rawValue: formatINR(totalPnl, { showSign: true }) },
          { label: "WIN RATE", value: `${winRate.toFixed(1)}%`, sub: `${winningCount}W / ${losingCount}L` },
          { label: "PROFIT FACTOR", value: profitFactor.toFixed(2), sub: profitFactor > 2 ? "Excellent" : profitFactor > 1 ? "Good" : "Needs Work", color: profitFactor > 1 ? "var(--color-positive)" : "var(--color-negative)" },
          { label: "EXPECTANCY", value: formatINR(expectancy, { showSign: true, compact: true }), sub: "Per Trade", color: expectancy >= 0 ? "var(--color-positive)" : "var(--color-negative)", rawValue: formatINR(expectancy, { showSign: true }) },
          { label: "AVG R-MULTIPLE", value: `${avgRMultiple >= 0 ? "+" : ""}${avgRMultiple.toFixed(2)}R`, sub: "Per Trade", color: avgRMultiple >= 0 ? "var(--color-positive)" : "var(--color-negative)" },
          { label: "MAX DRAWDOWN", value: formatINR(-maxDrawdown, { compact: true }), sub: "Peak to Trough", color: "var(--color-negative)", rawValue: formatINR(-maxDrawdown) },
          { label: "AVG HOLDING TIME", value: formatTime(avgHoldingMs), sub: "Per Trade" },
        ].map((kpi, i) => (
          <div key={i} className="card" style={{ padding: "var(--space-5)", overflow: "hidden" }} title={kpi.rawValue || kpi.value}>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: "var(--space-2)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{kpi.label}</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: kpi.color || "var(--text-primary)", marginBottom: "var(--space-1)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{kpi.value}</div>
            {kpi.sub && <div className="text-muted" style={{ fontSize: "var(--text-xs)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* 2. CHARTS ROW */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)" }}>
        <div className="card" style={{ flex: "2 1 500px", padding: "var(--space-5)", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>EQUITY CURVE <span className="text-muted">ⓘ</span></div>
              <div style={{ display: "flex", gap: "var(--space-3)", fontSize: "var(--text-xs)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }}></div> Equity</div>
                <div className="text-muted" style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d1d5db" }}></div> Benchmark (NIFTY 50)</div>
              </div>
            </div>
            <select className="input" style={{ padding: "4px 8px", fontSize: "var(--text-xs)", height: "auto" }}>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div style={{ height: 280 }}>
            <Line
              data={{
                labels: equityData.labels,
                datasets: [{
                  fill: true,
                  label: "Cumulative P&L",
                  data: equityData.data,
                  borderColor: "rgba(16, 185, 129, 1)",
                  backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
                    gradient.addColorStop(0, "rgba(16, 185, 129, 0.3)");
                    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
                    return gradient;
                  },
                  tension: 0.1,
                  pointRadius: 2,
                  pointBackgroundColor: "rgba(16, 185, 129, 1)",
                  pointHitRadius: 10,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: "var(--text-muted)" }
                  },
                  y: { 
                    position: "right",
                    grid: { color: "rgba(0,0,0,0.05)", borderDash: [5, 5] },
                    ticks: { 
                      font: { size: 10 }, 
                      color: "var(--text-muted)",
                      callback: function(value: any) {
                        if (value === 0) return '₹0';
                        if (Math.abs(value) >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L';
                        if (Math.abs(value) >= 1000) return '₹' + (value / 1000).toFixed(1) + 'K';
                        return '₹' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 300px", padding: "var(--space-5)", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>MONTHLY PERFORMANCE <span className="text-muted">ⓘ</span></div>
            <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: 6, padding: 2 }}>
              <button style={{ background: "var(--bg-primary)", border: "none", padding: "4px 8px", fontSize: 10, fontWeight: 600, borderRadius: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>P&L</button>
              <button className="text-muted" style={{ background: "transparent", border: "none", padding: "4px 8px", fontSize: 10, fontWeight: 600 }}>R-Multiple</button>
            </div>
          </div>
          <div style={{ height: 280 }}>
            <Bar
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                  data: monthlyData,
                  backgroundColor: monthlyData.map(v => v >= 0 ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)"),
                  borderRadius: 2,
                  barPercentage: 0.6,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: "var(--text-muted)" }
                  },
                  y: { 
                    position: "right",
                    grid: { color: "rgba(0,0,0,0.05)", borderDash: [5, 5] },
                    ticks: { 
                      font: { size: 10 }, 
                      color: "var(--text-muted)",
                      callback: function(value: any) {
                        if (value === 0) return '₹0';
                        if (Math.abs(value) >= 100000) return (value < 0 ? '-' : '') + '₹' + (Math.abs(value) / 100000).toFixed(1) + 'L';
                        if (Math.abs(value) >= 1000) return (value < 0 ? '-' : '') + '₹' + (Math.abs(value) / 1000).toFixed(1) + 'K';
                        return (value < 0 ? '-' : '') + '₹' + Math.abs(value);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. DISTRIBUTION ROW */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)" }}>
        <div className="card" style={{ flex: "1 1 200px", padding: "var(--space-5)", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, width: "100%", marginBottom: "var(--space-4)" }}>TRADES BREAKDOWN</div>
          <div style={{ width: 160, height: 160, position: "relative" }}>
            <Doughnut
              data={{
                labels: ['Winning Trades', 'Losing Trades'],
                datasets: [{
                  data: [winningCount, losingCount],
                  backgroundColor: ['#10b981', '#ef4444'],
                  borderWidth: 0,
                  cutout: '75%',
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>{winningCount + losingCount}</div>
              <div className="text-muted" style={{ fontSize: 10 }}>Trades</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: "2 1 400px", padding: "var(--space-5)", minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-4)" }}>R-MULTIPLE DISTRIBUTION</div>
          <div style={{ height: 160 }}>
            <Bar
              data={{
                labels: Object.keys(rBins),
                datasets: [{
                  data: Object.values(rBins),
                  backgroundColor: Object.keys(rBins).map(k => k.includes('-') && !k.includes('0 to 1R') && !k.includes('> 3R') ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)"),
                  borderRadius: 2,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="card" style={{ flex: "1 1 200px", padding: "var(--space-5)", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, width: "100%", marginBottom: "var(--space-4)" }}>R-MULTIPLE OVERVIEW</div>
          <div style={{ width: 160, height: 160, position: "relative" }}>
            <Doughnut
              data={{
                labels: ['> 3R', '2R to 3R', '1R to 2R', '0 to 1R', '< 0R'],
                datasets: [{
                  data: [rBins['> 3R'], rBins['2R to 3R'], rBins['1R to 2R'], rBins['0 to 1R'], rBins['< -3R'] + rBins['-3R to -2R'] + rBins['-2R to -1R'] + rBins['-1R to 0']],
                  backgroundColor: ['#059669', '#10b981', '#34d399', '#f59e0b', '#ef4444'],
                  borderWidth: 0,
                  cutout: '75%',
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{avgRMultiple > 0 ? "+" : ""}{avgRMultiple.toFixed(2)}R</div>
              <div className="text-muted" style={{ fontSize: 10 }}>Average</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STREAKS ROW */}
      <div className="card" style={{ padding: "var(--space-5)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-5)", textAlign: "center" }}>
          <div>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>BEST TRADE</div>
            <div className="text-positive" style={{ fontWeight: 700 }}>{formatINR(bestTrade, { showSign: true, compact: true })}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>WORST TRADE</div>
            <div className="text-negative" style={{ fontWeight: 700 }}>{formatINR(worstTrade, { compact: true })}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>LARGEST WIN STREAK</div>
            <div className="text-positive" style={{ fontWeight: 700 }}>{maxWinStreak} Trades</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>LARGEST LOSS STREAK</div>
            <div className="text-negative" style={{ fontWeight: 700 }}>{maxLossStreak} Trades</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>AVG WIN</div>
            <div className="text-positive" style={{ fontWeight: 700 }}>{formatINR(avgWin, { showSign: true, compact: true })}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>AVG LOSS</div>
            <div className="text-negative" style={{ fontWeight: 700 }}>{formatINR(avgLoss, { compact: true })}</div>
          </div>
        </div>
      </div>

      {/* 5. TABLES ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)" }}>
        {[
          { title: "PERFORMANCE BY SETUP", data: bySetup },
          { title: "PERFORMANCE BY SYMBOL", data: bySymbol },
          { title: "PERFORMANCE BY DAY OF WEEK", data: byDayOfWeek },
          { title: "PERFORMANCE BY TIME OF DAY", data: byTimeOfDay },
        ].map((table, i) => (
          <div key={i} className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, marginBottom: "var(--space-4)" }}>{table.title}</div>
            <table style={{ width: "100%", fontSize: "var(--text-xs)" }}>
              <thead>
                <tr className="text-muted" style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                  <th style={{ paddingBottom: 8, fontWeight: 600 }}>Category</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: "right" }}>Trades</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: "right" }}>Win %</th>
                  <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: "right" }}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {table.data.slice(0, 6).map((row, j) => (
                  <tr key={j} style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                    <td style={{ padding: "8px 0", fontWeight: 500 }}>{row.name}</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{row.trades}</td>
                    <td style={{ padding: "8px 0", textAlign: "right" }}>{row.winRate.toFixed(1)}%</td>
                    <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }} className={cn(row.pnl >= 0 ? "text-positive" : "text-negative")}>
                      {formatINR(row.pnl, { showSign: true, compact: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
