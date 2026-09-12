"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { formatINR, cn } from "@/lib/utils";
import { useEnrichedPnl } from "@/hooks/useEnrichedPnl";
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
  exchange: string;
  status: string;
  direction: string;
  avgEntryPrice: number;
  totalBuyQty: number;
  totalSellQty: number;
  stopLoss: number | null;
  setup: string | null;
  netPnl: number;
  grossPnl: number;
  rMultiple: number | null;
  entryTime: string;
  exitTime: string;
  holdingPeriodMs: number | null;
}


// ─── SCROLLABLE PERFORMANCE CHART ────────────────────────────────────────────
// Daily view: responsive:false + explicit pixel width inside horizontal-scroll div.
// All other views: responsive:true so the chart fills the card naturally.
function PerfChart({
  labels,
  data,
  perfMetric,
  isDailyView,
}: {
  labels: string[];
  data: number[];
  perfMetric: string;
  isDailyView?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const CHART_HEIGHT = 260;
  // 44px per bar → ~15 bars visible before scrolling
  const dailyCanvasWidth = Math.max(labels.length * 44, 400);

  // Auto-scroll to most-recent bars when data changes
  useEffect(() => {
    if (isDailyView && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [labels.length, isDailyView]);

  const yTickCallback = (value: any) => {
    if (value === 0) return perfMetric === "P&L" ? "₹0" : "0R";
    if (perfMetric === "R-Multiple") return (value > 0 ? "+" : "") + Number(value).toFixed(1) + "R";
    if (Math.abs(value) >= 100000) return (value < 0 ? "-" : "") + "₹" + (Math.abs(value) / 100000).toFixed(1) + "L";
    if (Math.abs(value) >= 1000) return (value < 0 ? "-" : "") + "₹" + (Math.abs(value) / 1000).toFixed(1) + "K";
    return (value < 0 ? "-" : "") + "₹" + Math.abs(value);
  };

  const tooltipLabel = (ctx: any) => {
    const v = ctx.parsed.y;
    if (perfMetric === "R-Multiple") return `${v >= 0 ? "+" : ""}${v.toFixed(2)}R`;
    if (Math.abs(v) >= 100000) return `${v < 0 ? "-" : ""}₹${(Math.abs(v) / 100000).toFixed(2)}L`;
    if (Math.abs(v) >= 1000) return `${v < 0 ? "-" : ""}₹${(Math.abs(v) / 1000).toFixed(1)}K`;
    return `${v < 0 ? "-" : ""}₹${Math.abs(v).toFixed(0)}`;
  };

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: data.map((v) =>
          v > 0
            ? "rgba(16, 185, 129, 0.9)"
            : v < 0
            ? "rgba(239, 68, 68, 0.9)"
            : "rgba(113,113,122,0.25)"
        ),
        borderRadius: 3,
        barPercentage: 0.65,
        categoryPercentage: 0.75,
      },
    ],
  };

  const yAxis = {
    position: "right" as const,
    grid: { color: "rgba(128,128,128,0.1)" },
    border: { dash: [5, 5] },
    ticks: { font: { size: 10 }, color: "#71717a", callback: yTickCallback },
  };

  if (isDailyView) {
    // ── Daily: two-div scroll pattern ────────────────────────────────────────
    // Outer div: clips to card width and scrolls horizontally.
    // Inner div: has exact pixel width so the chart expands to fill it fully.
    // Using responsive:true avoids the DPI/CSS scaling bugs of responsive:false.
    return (
      <div
        ref={scrollRef}
        className="perf-scroll"
        style={{
          width: 0,
          minWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(120,120,130,0.4) transparent",
        }}
      >
        <style>{`
          .perf-scroll::-webkit-scrollbar { height: 4px; }
          .perf-scroll::-webkit-scrollbar-track { background: transparent; border-radius: 99px; }
          .perf-scroll::-webkit-scrollbar-thumb { background: rgba(120,120,130,0.4); border-radius: 99px; }
          .perf-scroll::-webkit-scrollbar-thumb:hover { background: rgba(120,120,130,0.7); }
        `}</style>
        <div style={{ width: `${dailyCanvasWidth}px`, height: `${CHART_HEIGHT}px` }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: tooltipLabel } },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { size: 10 },
                    color: "#71717a",
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                  },
                },
                y: yAxis,
              },
            }}
          />
        </div>
      </div>
    );
  }

  // Weekly / Monthly / Yearly — fill the card naturally
  return (
    <div style={{ height: CHART_HEIGHT, width: "100%" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: tooltipLabel } },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, color: "#71717a", maxRotation: 45, minRotation: 0 },
            },
            y: yAxis,
          },
        }}
      />
    </div>
  );
}





export default function AnalyticsDashboard({ initialTrades: rawTrades, sharedUserId }: { initialTrades: TradeData[], sharedUserId?: string }) {
  const [perfView, setPerfView] = useState("Monthly");
  const [perfMetric, setPerfMetric] = useState("P&L");
  const [selectedTradeIds, setSelectedTradeIds] = useState<Set<string>>(new Set());
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle a single trade in/out of selection
  const toggleTrade = (id: string) => {
    setSelectedTradeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearFilter = () => setSelectedTradeIds(new Set());
  const selectAll = () => setSelectedTradeIds(new Set(rawTrades.map(t => t.id)));

  // Daily MTM P&L fetched from the API (historical prices for open positions).
  // Fetched once on mount so ALL views (Daily/Weekly/Monthly/Yearly) use accurate MTM data.
  const [dailyPnlData, setDailyPnlData] = useState<{ date: string; pnl: number }[] | null>(null);
  const [dailyPnlLoading, setDailyPnlLoading] = useState(false);

  useEffect(() => {
    // 1. Fire background sync first (fills any missing PriceHistory rows).
    //    For shared pages, pass the userId as a query param since there's no session.
    const syncUrl = sharedUserId
      ? `/api/jobs/sync-prices?userId=${sharedUserId}`
      : "/api/jobs/sync-prices";
    fetch(syncUrl, { method: "POST" }).catch(() => {});

    // 2. Fetch the daily P&L chart data from the DB.
    const dailyPnlUrl = sharedUserId
      ? `/api/analytics/daily-pnl?userId=${sharedUserId}`
      : "/api/analytics/daily-pnl";
    setDailyPnlLoading(true);
    fetch(dailyPnlUrl)
      .then((r) => r.json())
      .then((d) => setDailyPnlData(d.days ?? []))
      .catch(() => setDailyPnlData([]))
      .finally(() => setDailyPnlLoading(false));
  }, [sharedUserId]); // Re-fetch if sharedUserId changes

  // ── LIVE PNL FOR OPEN TRADES ──────────────────────────────────────────────
  const openTrades = useMemo(() => rawTrades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL"), [rawTrades]);
  const { livePnl } = useEnrichedPnl(openTrades);

  // Merge live P&L into trades
  const initialTrades = useMemo(() => {
    return rawTrades.map((t) => {
      if (t.status !== "OPEN" && t.status !== "PARTIAL") return t;
      const liveQuote = livePnl.get(t.id);
      if (!liveQuote) return t;
      const displayPnl = liveQuote.netPnl;
      let displayR = t.rMultiple;
      if (t.stopLoss) {
        displayR = displayPnl / (Math.abs(t.avgEntryPrice - t.stopLoss) * (t.totalBuyQty - t.totalSellQty));
      }
      return { ...t, netPnl: displayPnl, rMultiple: displayR };
    });
  }, [rawTrades, livePnl]);

  // Apply trade selection filter — empty set = show all
  const filteredTrades = useMemo(() => {
    if (selectedTradeIds.size === 0) return initialTrades;
    return initialTrades.filter(t => selectedTradeIds.has(t.id));
  }, [initialTrades, selectedTradeIds]);

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

    const sorted = [...filteredTrades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());

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
  }, [filteredTrades]);

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
    [...filteredTrades]
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
      .forEach((t) => {
        cum += t.netPnl;
        labels.push(new Date(t.entryTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
        data.push(cum);
      });
    return { labels, data };
  }, [filteredTrades]);

  // Performance Chart Data
  const perfChartData = useMemo(() => {
    let labels: string[] = [];
    let data: number[] = [];

    // Use exitTime for closed trades (when P&L was actually realized),
    // fall back to entryTime for open/partial trades
    const getDate = (t: TradeData) => {
      const isClosed = t.status !== "OPEN" && t.status !== "PARTIAL";
      return new Date(isClosed && t.exitTime ? t.exitTime : t.entryTime);
    };

    if (perfView === "Daily") {
      const dayMap: Record<string, number> = {};
      filteredTrades.forEach(t => {
        const d = getDate(t);
        // key = YYYY-MM-DD for reliable sorting
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const val = perfMetric === "P&L" ? t.netPnl : (t.rMultiple || 0);
        dayMap[key] = (dayMap[key] || 0) + val;
      });

      // Fill all calendar days from first to today
      if (Object.keys(dayMap).length > 0) {
        const sortedKeys = Object.keys(dayMap).sort();
        const start = new Date(sortedKeys[0]);
        const end = new Date(); // today
        const cursor = new Date(start);
        while (cursor <= end) {
          const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
          if (!(key in dayMap)) dayMap[key] = 0;
          cursor.setDate(cursor.getDate() + 1);
        }
        const allKeys = Object.keys(dayMap).sort();
        labels = allKeys.map(k => {
          const [y, m, d] = k.split('-').map(Number);
          return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        });
        data = allKeys.map(k => dayMap[k]);
      }
    } else if (perfView === "Weekly") {
      const weekMap: Record<string, number> = {};
      filteredTrades.forEach(t => {
        const d = getDate(t);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Get Monday
        const monday = new Date(d);
        monday.setDate(diff);
        const key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        const val = perfMetric === "P&L" ? t.netPnl : (t.rMultiple || 0);
        weekMap[key] = (weekMap[key] || 0) + val;
      });

      // Fill all weeks from first to current week
      if (Object.keys(weekMap).length > 0) {
        const sortedKeys = Object.keys(weekMap).sort();
        const start = new Date(sortedKeys[0]);
        const now = new Date();
        // get current week's monday
        const curDay = now.getDay();
        const curDiff = now.getDate() - curDay + (curDay === 0 ? -6 : 1);
        const curMonday = new Date(now);
        curMonday.setDate(curDiff);

        const cursor = new Date(start);
        while (cursor <= curMonday) {
          const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
          if (!(key in weekMap)) weekMap[key] = 0;
          cursor.setDate(cursor.getDate() + 7);
        }
        const allKeys = Object.keys(weekMap).sort();
        labels = allKeys.map(k => {
          const [y, m, d] = k.split('-').map(Number);
          return `Wk ${new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        });
        data = allKeys.map(k => weekMap[k]);
      }
    } else if (perfView === "Yearly") {
      const yearMap: Record<string, number> = {};
      filteredTrades.forEach(t => {
        const year = getDate(t).getFullYear().toString();
        const val = perfMetric === "P&L" ? t.netPnl : (t.rMultiple || 0);
        yearMap[year] = (yearMap[year] || 0) + val;
      });

      // Fill all years from first to current
      if (Object.keys(yearMap).length > 0) {
        const sortedKeys = Object.keys(yearMap).sort();
        const startYear = parseInt(sortedKeys[0]);
        const endYear = new Date().getFullYear();
        for (let y = startYear; y <= endYear; y++) {
          if (!(y.toString() in yearMap)) yearMap[y.toString()] = 0;
        }
        labels = Object.keys(yearMap).sort();
        data = labels.map(y => yearMap[y]);
      }
    } else {
      // Monthly
      const monthMap: Record<string, number> = {};
      filteredTrades.forEach(t => {
        const d = getDate(t);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        const val = perfMetric === "P&L" ? t.netPnl : (t.rMultiple || 0);
        monthMap[key] = (monthMap[key] || 0) + val;
      });

      // Fill all months from first to current
      if (Object.keys(monthMap).length > 0) {
        const sortedKeys = Object.keys(monthMap).sort();
        const [startY, startM] = sortedKeys[0].split('-').map(Number);
        const now = new Date();
        const endKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
        let cy = startY, cm = startM;
        while (true) {
          const key = `${cy}-${String(cm).padStart(2, '0')}`;
          if (!(key in monthMap)) monthMap[key] = 0;
          if (key === endKey) break;
          cm++;
          if (cm > 11) { cm = 0; cy++; }
          if (cy > now.getFullYear() + 1) break; // safety
        }
        const allKeys = Object.keys(monthMap).sort((a, b) => {
          const [yA, mA] = a.split('-').map(Number);
          const [yB, mB] = b.split('-').map(Number);
          if (yA !== yB) return yA - yB;
          return mA - mB;
        });
        labels = allKeys.map(k => {
          const [y, m] = k.split('-').map(Number);
          const d = new Date(y, m, 1);
          return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        });
        data = allKeys.map(k => monthMap[k]);
      }
    }

    if (labels.length === 0) {
      labels = ['No Data'];
      data = [0];
    }

    return { labels, data };
  }, [initialTrades, perfView, perfMetric]);

  // Aggregate daily MTM P&L data into the correct time buckets for all views.
  // All views use the accurate API data (realized + unrealized MTM), not just Daily.
  const activePerfChartData = useMemo(() => {
    // Only applies to P&L metric; R-Multiple still uses trade-based perfChartData
    if (perfMetric !== "P&L" || !dailyPnlData || dailyPnlData.length === 0) {
      return perfChartData;
    }

    // Live intraday override for today's date
    let liveTodayPnl: number | null = null;
    if (livePnl && livePnl.size > 0) {
      liveTodayPnl = 0;
      for (const pnl of livePnl.values()) {
        liveTodayPnl += pnl.todayPnl;
      }
    }
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Apply live override to today's entry in dailyPnlData
    const resolvedDaily = dailyPnlData.map((d) => ({
      ...d,
      pnl: d.date === todayStr && liveTodayPnl !== null ? liveTodayPnl : d.pnl,
    }));

    if (perfView === "Daily") {
      return {
        labels: resolvedDaily.map(d => {
          const [y, m, day] = d.date.split('-').map(Number);
          return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }),
        data: resolvedDaily.map(d => d.pnl),
      };
    }

    if (perfView === "Weekly") {
      const weekMap: Record<string, number> = {};
      resolvedDaily.forEach(({ date, pnl }) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);
        const key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
        weekMap[key] = (weekMap[key] || 0) + pnl;
      });
      const allKeys = Object.keys(weekMap).sort();
      return {
        labels: allKeys.map(k => {
          const [y, m, d] = k.split('-').map(Number);
          return `Wk ${new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        }),
        data: allKeys.map(k => weekMap[k]),
      };
    }

    if (perfView === "Monthly") {
      const monthMap: Record<string, number> = {};
      resolvedDaily.forEach(({ date, pnl }) => {
        const key = date.slice(0, 7); // "YYYY-MM"
        monthMap[key] = (monthMap[key] || 0) + pnl;
      });
      const allKeys = Object.keys(monthMap).sort();
      return {
        labels: allKeys.map(k => {
          const [y, m] = k.split('-').map(Number);
          return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        }),
        data: allKeys.map(k => monthMap[k]),
      };
    }

    if (perfView === "Yearly") {
      const yearMap: Record<string, number> = {};
      resolvedDaily.forEach(({ date, pnl }) => {
        const key = date.slice(0, 4); // "YYYY"
        yearMap[key] = (yearMap[key] || 0) + pnl;
      });
      const allKeys = Object.keys(yearMap).sort();
      return {
        labels: allKeys,
        data: allKeys.map(k => yearMap[k]),
      };
    }

    return perfChartData;
  }, [perfView, perfMetric, dailyPnlData, perfChartData, livePnl]);


  // R-Multiple Bins
  const rBins = useMemo(() => {
    const bins = { '< -3R': 0, '-3R to -2R': 0, '-2R to -1R': 0, '-1R to 0': 0, '0 to 1R': 0, '1R to 2R': 0, '2R to 3R': 0, '> 3R': 0 };
    filteredTrades.forEach(t => {
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
  }, [filteredTrades]);

  // Tables Data Grouping
  const groupData = (keyFn: (t: TradeData) => string) => {
    const groups: Record<string, { count: number; wins: number; pnl: number; rSum: number; rCount: number }> = {};
    filteredTrades.forEach(t => {
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

  const bySetup = useMemo(() => groupData(t => t.setup || "No Setup"), [filteredTrades]);
  const bySymbol = useMemo(() => groupData(t => t.symbol), [filteredTrades]);
  const byDayOfWeek = useMemo(() => groupData(t => new Date(t.entryTime).toLocaleDateString('en-US', { weekday: 'long' })), [filteredTrades]);
  const byTimeOfDay = useMemo(() => groupData(t => {
    const hour = new Date(t.entryTime).getHours();
    if (hour < 11) return "9:15 AM - 11:00 AM";
    if (hour < 13) return "11:00 AM - 1:00 PM";
    if (hour < 15) return "1:00 PM - 3:00 PM";
    return "After 3:00 PM";
  }), [filteredTrades]);

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  const isFiltered = selectedTradeIds.size > 0;
  const activeCount = isFiltered ? selectedTradeIds.size : rawTrades.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

      {/* 0. HEADER & ACTIONS ROW */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Analytics</h1>
          <p className="page-description text-muted" style={{ margin: 0, marginTop: "var(--space-1)" }}>Deep dive into your trading performance.</p>
        </div>
        <div style={{ position: "relative", zIndex: 100 }} ref={dropdownRef}>
          <button
            onClick={() => setFilterDropdownOpen(o => !o)}
            className="input"
            style={{ 
              display: "flex", alignItems: "center", gap: "var(--space-2)", 
              padding: "6px 12px", fontSize: "var(--text-sm)", fontWeight: 600,
              backgroundColor: isFiltered ? "var(--accent-primary)" : "var(--bg-secondary)",
              color: isFiltered ? "white" : "var(--text-primary)",
              border: "none", cursor: "pointer"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {isFiltered ? `${activeCount} Trades Selected` : "Filter by Trade"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: "transform 0.2s", transform: filterDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {/* Dropdown Menu */}
          {filterDropdownOpen && (
            <div className="card" style={{ 
              position: "absolute", top: "100%", right: 0, marginTop: "var(--space-2)", 
              width: 320, maxHeight: 400, overflowY: "auto", zIndex: 50,
              padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "var(--space-2)", borderBottom: "1px solid var(--border-secondary)", marginBottom: "var(--space-1)" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {isFiltered ? `${activeCount} of ${rawTrades.length} selected` : `All ${rawTrades.length} trades`}
                </span>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button onClick={selectAll} style={{ fontSize: 10, fontWeight: 600, color: "var(--accent-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>All</button>
                  <button onClick={clearFilter} style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Clear</button>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[...rawTrades].sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()).map(t => {
                  const checked = selectedTradeIds.has(t.id);
                  const isOpen = t.status === "OPEN" || t.status === "PARTIAL";
                  return (
                    <label
                      key={t.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "var(--space-3)",
                        padding: "8px 10px", borderRadius: 6,
                        background: checked ? "rgba(99,102,241,0.1)" : "transparent",
                        cursor: "pointer", transition: "background 0.15s ease"
                      }}
                      className="hover:bg-secondary"
                    >
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => toggleTrade(t.id)} 
                        style={{ accentColor: "var(--accent-primary)" }}
                      />
                      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: checked ? 700 : 500, color: checked ? "var(--text-primary)" : "var(--text-secondary)" }}>{t.symbol}</span>
                          {isOpen && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} title="Open" />}
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(t.entryTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

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
            <select className="input" style={{ padding: "4px 8px", fontSize: "var(--text-xs)", height: "auto", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }}>
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
                    ticks: { font: { size: 10 }, color: "#71717a" }
                  },
                  y: { 
                    position: "right",
                    grid: { color: "rgba(128,128,128,0.1)" },
                    border: { dash: [5, 5] },
                    ticks: { 
                      font: { size: 10 }, 
                      color: "#71717a",
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

        <div className="card" style={{ flex: "1 1 300px", padding: "var(--space-5)", minWidth: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700 }}>PERFORMANCE <span className="text-muted">ⓘ</span></div>
              <select className="input" style={{ padding: "4px 8px", fontSize: "var(--text-xs)", height: "auto", color: "var(--text-primary)", backgroundColor: "var(--bg-primary)" }} value={perfView} onChange={(e) => setPerfView(e.target.value)}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: 6, padding: 2 }}>
                <button onClick={() => setPerfMetric("P&L")} style={{ background: perfMetric === "P&L" ? "var(--bg-primary)" : "transparent", color: perfMetric === "P&L" ? "var(--text-primary)" : "var(--text-muted)", border: "none", padding: "4px 8px", fontSize: 10, fontWeight: 600, borderRadius: 4, cursor: "pointer" }}>P&L</button>
                <button onClick={() => setPerfMetric("R-Multiple")} style={{ background: perfMetric === "R-Multiple" ? "var(--bg-primary)" : "transparent", color: perfMetric === "R-Multiple" ? "var(--text-primary)" : "var(--text-muted)", border: "none", padding: "4px 8px", fontSize: 10, fontWeight: 600, borderRadius: 4, cursor: "pointer" }}>R-Multiple</button>
              </div>
            </div>
          </div>
          {dailyPnlLoading ? (
            <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <svg style={{ animation: "spin 1s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <span className="text-muted" style={{ fontSize: 12 }}>Fetching historical prices…</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : (
            <PerfChart labels={activePerfChartData.labels} data={activePerfChartData.data} perfMetric={perfMetric} isDailyView={perfView === "Daily"} />
          )}
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
                }]
              }}
              options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
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
                scales: { 
                  x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10 }, color: "#71717a" }
                  }, 
                  y: { display: false } 
                }
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
                }]
              }}
              options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
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
