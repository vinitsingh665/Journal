"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatINR, cn } from "@/lib/utils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TradeData {
  id: string;
  entryTime: string;
  netPnl: number;
  grossPnl: number;
  totalCharges: number;
}

export default function CalendarView({ 
  initialTrades,
  year,
  month
}: { 
  initialTrades: TradeData[];
  year: number;
  month: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // initialTrades are already filtered for the current month and year by the server
  const currentMonthTrades = initialTrades;

  // Group trades by day (1-31)
  const tradesByDay = useMemo(() => {
    const grouped = new Map<number, { trades: TradeData[]; pnl: number }>();
    currentMonthTrades.forEach((t) => {
      const d = new Date(t.entryTime);
      const day = d.getDate();
      if (!grouped.has(day)) {
        grouped.set(day, { trades: [], pnl: 0 });
      }
      const group = grouped.get(day)!;
      group.trades.push(t);
      group.pnl += t.netPnl;
    });
    return grouped;
  }, [currentMonthTrades]);

  // Calculate KPIs for the current month
  const totalTrades = currentMonthTrades.length;
  const winningTrades = currentMonthTrades.filter((t) => t.netPnl > 0).length;
  const losingTrades = currentMonthTrades.filter((t) => t.netPnl <= 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalPnl = currentMonthTrades.reduce((s, t) => s + t.netPnl, 0);
  const grossProfit = currentMonthTrades.filter(t => t.netPnl > 0).reduce((s, t) => s + t.netPnl, 0);
  const grossLoss = currentMonthTrades.filter(t => t.netPnl <= 0).reduce((s, t) => s + Math.abs(t.netPnl), 0);
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? grossProfit : 0);
  const expectancy = totalTrades > 0 ? totalPnl / totalTrades : 0;
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? -grossLoss / losingTrades : 0;
  const bestTrade = currentMonthTrades.length > 0 ? Math.max(...currentMonthTrades.map(t => t.netPnl)) : 0;
  const worstTrade = currentMonthTrades.length > 0 ? Math.min(...currentMonthTrades.map(t => t.netPnl)) : 0;

  // Best/Worst Days calculation
  const currentDate = new Date(year, month, 1);
  const daysArray = Array.from(tradesByDay.entries());
  let bestDay = { date: "", pnl: -Infinity, day: 0 };
  let worstDay = { date: "", pnl: Infinity, day: 0 };
  
  daysArray.forEach(([day, data]) => {
    if (data.pnl > bestDay.pnl) bestDay = { date: `${day} ${currentDate.toLocaleString('default', { month: 'short' })} ${year}`, pnl: data.pnl, day };
    if (data.pnl < worstDay.pnl) worstDay = { date: `${day} ${currentDate.toLocaleString('default', { month: 'short' })} ${year}`, pnl: data.pnl, day };
  });

  if (bestDay.pnl === -Infinity) bestDay = { date: "—", pnl: 0, day: 0 };
  if (worstDay.pnl === Infinity) worstDay = { date: "—", pnl: 0, day: 0 };

  const activeDaysCount = tradesByDay.size;
  const avgDailyPnl = activeDaysCount > 0 ? totalPnl / activeDaysCount : 0;

  // Sort most active days by trade count
  const mostActiveDays = [...daysArray].sort((a, b) => b[1].trades.length - a[1].trades.length).slice(0, 3);

  // Calendar Grid generation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
  // We want Monday to be the first day (0), Sunday to be 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const previousMonthDays = new Date(year, month, 0).getDate();
  const totalGridCells = 42; // 6 rows * 7 cols

  const gridCells = [];

  // Previous month padding
  for (let i = 0; i < startOffset; i++) {
    const day = previousMonthDays - startOffset + i + 1;
    gridCells.push({ type: "prev", day });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    gridCells.push({ type: "current", day });
  }

  // Next month padding
  const remainingCells = totalGridCells - gridCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    gridCells.push({ type: "next", day });
  }

  // Navigation handlers
  const navigateTo = (newYear: number, newMonth: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear.toString());
    params.set("month", newMonth.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePrevMonth = () => {
    const d = new Date(year, month - 1, 1);
    navigateTo(d.getFullYear(), d.getMonth());
  };
  
  const handleNextMonth = () => {
    const d = new Date(year, month + 1, 1);
    navigateTo(d.getFullYear(), d.getMonth());
  };
  
  const handleToday = () => {
    const d = new Date();
    navigateTo(d.getFullYear(), d.getMonth());
  };

  const todayDate = new Date();
  const isToday = (d: number) => 
    todayDate.getDate() === d && 
    todayDate.getMonth() === month && 
    todayDate.getFullYear() === year;

  // Chart Data
  const donutData = {
    labels: ['Winning Trades', 'Losing Trades'],
    datasets: [
      {
        data: [winningTrades, losingTrades],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  return (
    <>
      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)" }}>Calendar</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>View your daily trading performance at a glance.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", alignItems: "center", background: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <button onClick={handlePrevMonth} className="btn btn-ghost" style={{ padding: "8px 12px", borderRight: "1px solid var(--border-color)", borderRadius: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div style={{ padding: "0 16px", fontWeight: 600, fontSize: "var(--text-sm)", width: 140, textAlign: "center" }}>
              {currentDate.toLocaleString('default', { month: 'long' })} {year}
            </div>
            <button onClick={handleNextMonth} className="btn btn-ghost" style={{ padding: "8px 12px", borderLeft: "1px solid var(--border-color)", borderRadius: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
          <button onClick={handleToday} className="btn btn-secondary" style={{ padding: "8px 16px" }}>Today</button>
          <Link href="/trades/new" className="btn btn-primary" style={{ padding: "8px 16px" }}>+ New Trade</Link>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Total P&L</div>
          <div className={cn(totalPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {formatINR(totalPnl, { showSign: true })}
          </div>
        </div>
        
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Win Rate</div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {winRate.toFixed(1)}%
          </div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>
            {winningTrades}W / {losingTrades}L
          </div>
        </div>
        
        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Best Day</div>
          <div className="text-positive" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {bestDay.pnl > 0 ? formatINR(bestDay.pnl, { showSign: true }) : "—"}
          </div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>
            {bestDay.date}
          </div>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Worst Day</div>
          <div className="text-negative" style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {worstDay.pnl < 0 ? formatINR(worstDay.pnl, { showSign: true }) : "—"}
          </div>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: 4 }}>
            {worstDay.date}
          </div>
        </div>

        <div className="card" style={{ padding: "var(--space-4)" }}>
          <div className="text-muted" style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Avg Daily P&L</div>
          <div className={cn(avgDailyPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontSize: "var(--text-2xl)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {formatINR(avgDailyPnl, { showSign: true })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "var(--space-6)" }}>
        {/* ─── CALENDAR GRID ─── */}
        <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Days of week header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--border-color)", gap: "1px", borderBottom: "1px solid var(--border-color)" }}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <div key={day} style={{ padding: "12px", textAlign: "center", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-primary)" }}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "120px", flex: 1, background: "var(--border-color)", gap: "1px" }}>
            {gridCells.map((cell, index) => {
              const isCurrent = cell.type === "current";
              const dayData = isCurrent ? tradesByDay.get(cell.day) : null;
              const hasTrades = dayData && dayData.trades.length > 0;
              const cellIsToday = isCurrent && isToday(cell.day);
              let bg = "var(--bg-primary)";
              if (!isCurrent) bg = "var(--bg-secondary)";
              else if (hasTrades) {
                if (dayData!.pnl > 0) bg = "rgba(16, 185, 129, 0.1)"; // Light green
                else if (dayData!.pnl < 0) bg = "rgba(239, 68, 68, 0.1)"; // Light red
                // If P&L is exactly 0, keep it bg-primary
              }

              return (
                <div 
                  key={index} 
                  style={{
                    padding: "12px",
                    background: bg,
                    color: isCurrent ? "var(--text-primary)" : "var(--text-muted)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: cellIsToday ? "inset 0 0 0 2px var(--accent-primary)" : "none",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: "auto" }}>
                    {cell.day}
                  </div>
                  
                  {isCurrent && hasTrades && (
                    <div style={{ marginTop: "auto" }}>
                      <div className={cn(dayData!.pnl >= 0 ? "text-positive" : "text-negative")} style={{ fontWeight: 700, fontSize: "var(--text-base)", fontFamily: "var(--font-mono)", marginBottom: 2 }}>
                        {formatINR(dayData!.pnl, { showSign: true })}
                      </div>
                      <div className="text-muted" style={{ fontSize: "var(--text-xs)" }}>
                        {dayData!.trades.length} trade{dayData!.trades.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── SIDEBAR ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          
          {/* Monthly Overview Donut */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 16 }}>MONTHLY OVERVIEW</div>
            {totalTrades > 0 ? (
              <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
                <Doughnut 
                  data={donutData} 
                  options={{ 
                    cutout: '75%', 
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    maintainAspectRatio: true,
                  }} 
                />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{totalTrades}</div>
                  <div className="text-muted" style={{ fontSize: 10 }}>Trades</div>
                </div>
              </div>
            ) : (
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                No trades this month
              </div>
            )}
            
            {totalTrades > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                    Winning Trades
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{winningTrades} <span style={{ fontSize: 10 }}>({winRate.toFixed(1)}%)</span></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                    Losing Trades
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{losingTrades} <span style={{ fontSize: 10 }}>({(100 - winRate).toFixed(1)}%)</span></div>
                </div>
              </div>
            )}
          </div>

          {/* P&L Breakdown */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 16 }}>P&L BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Gross Profit</span>
                <span className="text-positive" style={{ fontFamily: "var(--font-mono)" }}>{formatINR(grossProfit, { showSign: true })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Gross Loss</span>
                <span className="text-negative" style={{ fontFamily: "var(--font-mono)" }}>{formatINR(-grossLoss, { showSign: true })}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", fontWeight: 600 }}>
                <span>Net P&L</span>
                <span className={cn(totalPnl >= 0 ? "text-positive" : "text-negative")} style={{ fontFamily: "var(--font-mono)" }}>{formatINR(totalPnl, { showSign: true })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Profit Factor</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{profitFactor.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Expectancy</span>
                <span className={cn(expectancy >= 0 ? "text-positive" : "text-negative")} style={{ fontFamily: "var(--font-mono)" }}>{formatINR(expectancy, { showSign: true })}</span>
              </div>
            </div>
          </div>

          {/* Trade Breakdown */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 16 }}>TRADE BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Total Trades</span>
                <span>{totalTrades}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Best Trade</span>
                <span className="text-positive" style={{ fontFamily: "var(--font-mono)" }}>{bestTrade > 0 ? formatINR(bestTrade, { showSign: true }) : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Worst Trade</span>
                <span className="text-negative" style={{ fontFamily: "var(--font-mono)" }}>{worstTrade < 0 ? formatINR(worstTrade, { showSign: true }) : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Average Win</span>
                <span className="text-positive" style={{ fontFamily: "var(--font-mono)" }}>{avgWin > 0 ? formatINR(avgWin, { showSign: true }) : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span className="text-muted">Average Loss</span>
                <span className="text-negative" style={{ fontFamily: "var(--font-mono)" }}>{avgLoss < 0 ? formatINR(avgLoss, { showSign: true }) : "—"}</span>
              </div>
            </div>
          </div>

          {/* Most Active Days */}
          {mostActiveDays.length > 0 && (
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-muted)", marginBottom: 16 }}>MOST ACTIVE DAYS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mostActiveDays.map(([day, data], i) => (
                  <div key={day} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span className="text-muted" style={{ fontSize: 10 }}>{i + 1}.</span>
                      <span style={{ fontWeight: 500 }}>{day} {currentDate.toLocaleString('default', { month: 'short' })} {year}</span>
                    </div>
                    <span className="text-secondary" style={{ fontSize: 12 }}>{data.trades.length} trades</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
