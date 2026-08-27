"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const MOCK_MISTAKES = [
  {
    id: 1,
    title: "Entered Late / Chased Move",
    desc: "Price had already moved 2% above my breakout level.",
    category: "Entry",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    icon: "!",
    symbol: "RELIANCE",
    direction: "LONG",
    priceIn: 1421.30,
    priceOut: 1515.00,
    date: "29 Aug 2026",
    impact: -4210,
    recurred: 3,
  },
  {
    id: 2,
    title: "Moved Stop Loss",
    desc: "Moved SL from plan of ₹1,380 to ₹1,365 after some profit.",
    category: "Risk Mgmt",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.1)",
    icon: "!",
    symbol: "TATASTEEL",
    direction: "SHORT",
    priceIn: 142.80,
    priceOut: 139.30,
    date: "29 Aug 2026",
    impact: -3450,
    recurred: 4,
  },
  {
    id: 3,
    title: "Overtrading",
    desc: "Took 4 trades in one day without high quality setups.",
    category: "Psychology",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.1)",
    icon: "!",
    symbol: "INFY",
    direction: "LONG",
    priceIn: 1635.20,
    priceOut: 1610.00,
    date: "29 Aug 2026",
    impact: -1650,
    recurred: 5,
  },
  {
    id: 4,
    title: "Ignored Market Context",
    desc: "Took long in weak market trend against NIFTY.",
    category: "Analysis",
    color: "#eab308",
    bg: "rgba(234, 179, 8, 0.1)",
    icon: "!",
    symbol: "BANKNIFTY",
    direction: "LONG",
    priceIn: 51280.15,
    priceOut: 52940.00,
    date: "28 Aug 2026",
    impact: -2120,
    recurred: 2,
  },
  {
    id: 5,
    title: "Poor Exit - Gave Back Profits",
    desc: "Did not book partial profits. Gave back 70% of open profits.",
    category: "Exit",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    icon: "!",
    symbol: "HDFCBANK",
    direction: "SHORT",
    priceIn: 1645.00,
    priceOut: 1660.60,
    date: "28 Aug 2026",
    impact: -1560,
    recurred: 4,
  },
  {
    id: 6,
    title: "No Stop Loss",
    desc: "Entered without predefined stop loss.",
    category: "Risk Mgmt",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.1)",
    icon: "!",
    symbol: "NIFTY",
    direction: "LONG",
    priceIn: 24850.00,
    priceOut: 24610.00,
    date: "27 Aug 2026",
    impact: -5780,
    recurred: 3,
  },
  {
    id: 7,
    title: "Revenge Trading",
    desc: "Took a trade immediately after a loss to recover.",
    category: "Psychology",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.1)",
    icon: "!",
    symbol: "TCS",
    direction: "SHORT",
    priceIn: 4102.10,
    priceOut: 4180.00,
    date: "26 Aug 2026",
    impact: -2340,
    recurred: 2,
  },
];

const generateSparkline = (points: number, color: string) => ({
  labels: Array.from({ length: points }, (_, i) => i.toString()),
  datasets: [{
    data: Array.from({ length: points }, () => Math.random() * 10 + 10),
    borderColor: color,
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 0,
  }]
});

const sparklineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
};

const barOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => `₹${Math.abs(c.raw).toLocaleString()}` } } },
  scales: {
    x: {
      grid: { color: "rgba(128,128,128,0.2)" },
      border: { dash: [5, 5] },
      ticks: { font: { size: 10 }, color: "#71717a", callback: (v: any) => v < 0 ? `-₹${Math.abs(v/1000)}K` : `₹${v/1000}K`, maxTicksLimit: 5 }
    },
    y: { grid: { display: false }, ticks: { font: { size: 10, weight: 500 }, color: "#71717a" } }
  }
};

const CATEGORY_STYLES: Record<string, { color: string, bg: string }> = {
  "Entry": { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
  "Risk Mgmt": { color: "#f97316", bg: "rgba(249, 115, 22, 0.1)" },
  "Psychology": { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
  "Exit": { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
  "Analysis": { color: "#eab308", bg: "rgba(234, 179, 8, 0.1)" }
};

export default function MistakesPage() {
  const [activeTab, setActiveTab] = useState("All Mistakes");
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Search State
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Form State
  const [newMistake, setNewMistake] = useState({
    title: "", desc: "", category: "Entry", symbol: "", direction: "LONG", priceIn: 0, priceOut: 0, date: new Date().toISOString().split('T')[0], impact: 0, recurred: 1
  });

  // Action Plan State
  const [actionPlans, setActionPlans] = useState([
    "Focus on patience and wait for proper setups.",
    "Never move stop loss once trade is active.",
    "Limit max 2 trades per day.",
    "Always define SL before entering trade."
  ]);
  const [newActionPlan, setNewActionPlan] = useState("");

  // Load from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mistakes_data");
    if (stored) {
      try {
        setMistakes(JSON.parse(stored));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever mistakes change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mistakes_data", JSON.stringify(mistakes));
    }
  }, [mistakes, isLoaded]);

  // Load AI prefill if exists
  useEffect(() => {
    const aiPrefill = sessionStorage.getItem("aiMistakePrefill");
    if (aiPrefill) {
      try {
        const data = JSON.parse(aiPrefill);
        setNewMistake(prev => ({
          ...prev,
          title: data.title || prev.title,
          desc: data.desc || prev.desc,
          category: ["Entry", "Risk Mgmt", "Psychology", "Exit", "Analysis"].includes(data.category) ? data.category : prev.category,
          symbol: data.symbol || prev.symbol,
          direction: data.direction === "SHORT" ? "SHORT" : "LONG",
          priceIn: data.priceIn || prev.priceIn,
          priceOut: data.priceOut || prev.priceOut,
          impact: data.impact || prev.impact,
          recurred: data.recurred || prev.recurred
        }));
        setShowModal(true);
      } catch (e) {
        console.error(e);
      }
      sessionStorage.removeItem("aiMistakePrefill");
    }
  }, []);

  // Debounced search logic for Symbol input
  useEffect(() => {
    if (newMistake.symbol.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${newMistake.symbol}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [newMistake.symbol]);

  // Calculate dynamic metrics
  const totalImpact = mistakes.reduce((sum, m) => sum + m.impact, 0);
  
  const mockTotalTrades = 150;
  const mistakesPerTrade = (mistakes.length / mockTotalTrades).toFixed(2);
  
  const recurredMistakesCount = mistakes.filter(m => m.recurred > 1).length;
  const recurrenceRate = mistakes.length > 0 ? ((recurredMistakesCount / mistakes.length) * 100).toFixed(1) : "0.0";
  
  const categoryCounts: Record<string, number> = {};
  const categoryImpact: Record<string, number> = {};
  const mistakeFrequencies: Record<string, number> = {};

  mistakes.forEach(m => {
    categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
    categoryImpact[m.category] = (categoryImpact[m.category] || 0) + m.impact;
    mistakeFrequencies[m.title] = (mistakeFrequencies[m.title] || 0) + 1;
  });

  const donutData = {
    labels: Object.keys(categoryCounts),
    datasets: [{
      data: Object.values(categoryCounts),
      backgroundColor: Object.keys(categoryCounts).map(k => CATEGORY_STYLES[k]?.color || "#000"),
      borderWidth: 0,
    }]
  };

  // Sort categories by most negative impact
  const sortedCategories = Object.entries(categoryImpact).sort((a, b) => a[1] - b[1]);
  const barData = {
    labels: sortedCategories.map(c => c[0]),
    datasets: [{
      data: sortedCategories.map(c => c[1]),
      backgroundColor: "#ef4444",
      borderRadius: 4,
      barThickness: 8,
    }]
  };

  const mostRepeated = Object.entries(mistakeFrequencies).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    const newM = {
      id: Date.now(),
      title: newMistake.title,
      desc: newMistake.desc,
      category: newMistake.category,
      color: CATEGORY_STYLES[newMistake.category].color,
      bg: CATEGORY_STYLES[newMistake.category].bg,
      icon: "!",
      symbol: newMistake.symbol.toUpperCase(),
      direction: newMistake.direction,
      priceIn: Number(newMistake.priceIn),
      priceOut: Number(newMistake.priceOut),
      date: new Date(newMistake.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      impact: -Math.abs(Number(newMistake.impact)), // ensure negative
      recurred: Number(newMistake.recurred),
    };
    
    setMistakes([newM, ...mistakes]);
    setShowModal(false);
    setNewMistake({ title: "", desc: "", category: "Entry", symbol: "", direction: "LONG", priceIn: 0, priceOut: 0, date: new Date().toISOString().split('T')[0], impact: 0, recurred: 1 });
  };

  // Sort & Filter
  const sortedMistakes = [...mistakes].sort((a, b) => {
    return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-6)" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 4 }}>Mistakes</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: "var(--text-sm)" }}>Analyze your mistakes to identify patterns and become a better trader.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="input" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "8px 12px", height: "auto", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            23 Aug - 29 Aug 2026
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button className="input" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "8px 12px", height: "auto", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            All Accounts
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Mistake
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-6)", marginBottom: "var(--space-6)" }}>
        {/* Total Mistakes */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>TOTAL MISTAKES</div>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", width: 24, height: 24, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{mistakes.length}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span className="text-muted">This Period</span>
            {mistakes.length > 0 && <span className="text-negative" style={{ fontWeight: 600 }}>6.2% ↑</span>}
          </div>
          <div style={{ height: 40, marginTop: 12 }}><Line data={generateSparkline(20, "#ef4444")} options={sparklineOptions} /></div>
        </div>

        {/* Mistakes / Trade */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>MISTAKES / TRADE</div>
            <div style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", width: 24, height: 24, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{mistakesPerTrade}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span className="text-muted">Avg per trade</span>
            {mistakes.length > 0 && <span className="text-negative" style={{ fontWeight: 600 }}>4.3% ↑</span>}
          </div>
          <div style={{ height: 40, marginTop: 12 }}><Line data={generateSparkline(20, "#8b5cf6")} options={sparklineOptions} /></div>
        </div>

        {/* P&L Impact */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>P&L IMPACT</div>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", width: 24, height: 24, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>-₹{Math.abs(totalImpact).toLocaleString()}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span className="text-muted">Total</span>
          </div>
          <div style={{ height: 40, marginTop: 12 }}><Line data={generateSparkline(20, "#ef4444")} options={sparklineOptions} /></div>
        </div>

        {/* Recurrence Rate */}
        <div className="card" style={{ padding: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div className="text-muted" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>RECURRENCE RATE</div>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", width: 24, height: 24, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{recurrenceRate}%</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
            <span className="text-muted">Mistakes repeated</span>
          </div>
          <div style={{ height: 40, marginTop: 12 }}><Line data={generateSparkline(20, "#f59e0b")} options={sparklineOptions} /></div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "var(--space-6)" }}>
        
        {/* LEFT COLUMN: TABLE */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Table Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", gap: 24 }}>
              {["All Mistakes"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "none", border: "none", padding: 0, paddingBottom: 16, marginBottom: -17,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                    borderBottom: activeTab === tab ? "2px solid #8b5cf6" : "2px solid transparent"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                className="input" 
                style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "6px 12px", fontSize: 12, height: "auto", cursor: "pointer", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-muted" style={{ borderBottom: "1px solid var(--border-color)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "left" }}>Mistake</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "left" }}>Category</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "left" }}>Trade</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "left" }}>Date</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "right" }}>Impact</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "center" }}>Recurred</th>
                  <th style={{ padding: "16px 20px", fontWeight: 600, textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedMistakes.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border-color)", background: "transparent" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ marginTop: 2, color: m.color }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{m.title}</div>
                          <div className="text-muted" style={{ fontSize: 12, lineHeight: 1.4, maxWidth: 300 }}>{m.desc}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ padding: "4px 8px", background: m.bg, color: m.color, borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{m.category}</span>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{m.symbol}</span>
                        <span style={{ fontSize: 10, padding: "2px 4px", background: m.direction === 'LONG' ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: m.direction === 'LONG' ? "#10b981" : "#ef4444", borderRadius: 4, fontWeight: 600 }}>{m.direction}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: 11, whiteSpace: "nowrap" }}>₹{m.priceIn.toFixed(2)} → ₹{m.priceOut.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>{m.date}</td>
                    <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: 600, color: "#ef4444" }}>-₹{Math.abs(m.impact).toLocaleString()}</td>
                    <td style={{ padding: "16px 20px", textAlign: "center", fontWeight: 500, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{m.recurred} times</td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <button 
                        onClick={() => setMistakes(mistakes.filter(x => x.id !== m.id))} 
                        title="Delete Mistake"
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-negative)", padding: 4 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {mistakes.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                      No mistakes tracked yet. Click "Add Mistake" to log one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {mistakes.length > 0 && (
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
              <div className="text-muted" style={{ fontSize: 12 }}>Showing 1 to {Math.min(10, mistakes.length)} of {mistakes.length} mistakes</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>&lt;</button>
                <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 12, background: "#8b5cf6" }}>1</button>
                <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }}>&gt;</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INSIGHTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          
          {/* MISTAKES BREAKDOWN */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 20 }}>MISTAKES BREAKDOWN</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 100, height: 100, position: "relative" }}>
                {mistakes.length > 0 ? (
                  <Doughnut data={donutData} options={{ cutout: "75%", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "8px solid var(--border-color)" }}></div>
                )}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{mistakes.length}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Total</div>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(categoryCounts).map(([cat, count], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_STYLES[cat]?.color || "#000" }}></div>
                      <span>{cat}</span>
                    </div>
                    <div><span style={{ fontWeight: 600 }}>{count}</span> <span className="text-muted">({((count/mistakes.length)*100).toFixed(1)}%)</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CATEGORY P&L IMPACT */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 16 }}>CATEGORY P&L IMPACT</div>
            <div style={{ height: 160 }}>
              {mistakes.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>No data</div>
              )}
            </div>
          </div>

          {/* MOST REPEATED MISTAKES */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 16 }}>MOST REPEATED MISTAKES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {mostRepeated.map(([name, count], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "var(--text-muted)", fontSize: 10 }}>{i+1}</div>
                    <span style={{ fontWeight: 500 }}>{name}</span>
                  </div>
                  <span className="text-muted">{count as number} times</span>
                </div>
              ))}
              {mostRepeated.length === 0 && <div className="text-muted" style={{ fontSize: 12 }}>No mistakes logged.</div>}
            </div>
            {mostRepeated.length > 0 && <button className="btn btn-ghost" style={{ width: "100%", fontSize: 12, color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.3)" }}>View All Mistakes →</button>}
          </div>

          {/* ACTION PLAN */}
          <div className="card" style={{ padding: "var(--space-5)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", marginBottom: 16 }}>ACTION PLAN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {actionPlans.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                  <div style={{ color: "#8b5cf6", marginTop: 2 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                  <span className="text-muted" style={{ lineHeight: 1.4, flex: 1 }}>{item}</span>
                  <button onClick={() => setActionPlans(actionPlans.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-negative)", padding: 0 }}>✕</button>
                </div>
              ))}
              {actionPlans.length === 0 && <span className="text-muted" style={{ fontSize: 12 }}>No action plans yet.</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input 
                type="text" 
                value={newActionPlan} 
                onChange={(e) => setNewActionPlan(e.target.value)} 
                placeholder="New action plan..." 
                className="input"
                style={{ flex: 1, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "8px 12px", borderRadius: 6, fontSize: 12 }} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newActionPlan.trim()) {
                    setActionPlans([...actionPlans, newActionPlan.trim()]);
                    setNewActionPlan("");
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (newActionPlan.trim()) {
                    setActionPlans([...actionPlans, newActionPlan.trim()]);
                    setNewActionPlan("");
                  }
                }} 
                className="btn btn-ghost" 
                style={{ fontSize: 12, color: "#8b5cf6", border: "1px solid rgba(139, 92, 246, 0.3)", padding: "8px 12px" }}
              >
                Add
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ADD MISTAKE MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 500, padding: 0, overflow: "hidden", animation: "slideUp 0.2s ease-out" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Add Mistake</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>
            <form onSubmit={handleAddMistake} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              
              <div>
                <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Mistake Title *</label>
                <input type="text" className="input" required value={newMistake.title} onChange={e => setNewMistake({...newMistake, title: e.target.value})} placeholder="e.g. Moved Stop Loss" style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
              </div>

              <div>
                <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Description</label>
                <textarea className="input" value={newMistake.desc} onChange={e => setNewMistake({...newMistake, desc: e.target.value})} placeholder="What exactly happened?" style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6, minHeight: 60 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Category</label>
                  <select className="input" value={newMistake.category} onChange={e => setNewMistake({...newMistake, category: e.target.value})} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }}>
                    <option>Entry</option>
                    <option>Risk Mgmt</option>
                    <option>Psychology</option>
                    <option>Exit</option>
                    <option>Analysis</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Date</label>
                  <input type="date" className="input" value={newMistake.date} onChange={e => setNewMistake({...newMistake, date: e.target.value})} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Trade Symbol</label>
                  <div style={{ position: "relative" }}>
                    <input type="text" className="input" required value={newMistake.symbol} onChange={e => setNewMistake({...newMistake, symbol: e.target.value})} placeholder="e.g. NIFTY" style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
                    {isSearching && <div style={{ position: "absolute", right: 10, top: 12, fontSize: 12 }}>...</div>}
                    {showDropdown && searchResults.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 6, marginTop: 4, zIndex: 50, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        {searchResults.map((res: any, idx) => (
                          <div key={idx} onClick={() => { setNewMistake({...newMistake, symbol: res.symbol, priceIn: Number(res.price || 0)}); setShowDropdown(false); }} style={{ padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", fontSize: 12 }}>
                            <span style={{ fontWeight: 600 }}>{res.symbol}</span>
                            <span className="text-muted">{res.exchange}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Direction</label>
                  <select className="input" value={newMistake.direction} onChange={e => setNewMistake({...newMistake, direction: e.target.value})} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }}>
                    <option>LONG</option>
                    <option>SHORT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Entry Price (₹)</label>
                  <input type="number" step="0.01" className="input" value={newMistake.priceIn} onChange={e => setNewMistake({...newMistake, priceIn: Number(e.target.value)})} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
                </div>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Exit Price (₹)</label>
                  <input type="number" step="0.01" className="input" value={newMistake.priceOut} onChange={e => setNewMistake({...newMistake, priceOut: Number(e.target.value)})} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>P&L Impact (₹ Loss)</label>
                  <input type="number" className="input" required value={newMistake.impact} onChange={e => setNewMistake({...newMistake, impact: Number(e.target.value)})} placeholder="e.g. 5000" style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
                </div>
                <div>
                  <label className="text-muted" style={{ display: "block", fontSize: 12, marginBottom: 4, fontWeight: 600 }}>Times Recurred</label>
                  <input type="number" className="input" required value={newMistake.recurred} onChange={e => setNewMistake({...newMistake, recurred: Number(e.target.value)})} style={{ width: "100%", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "10px 12px", borderRadius: 6 }} />
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: 10, marginTop: -12 }}>Enter the absolute amount lost due to this mistake.</p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: "#8b5cf6" }}>Save Mistake</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
