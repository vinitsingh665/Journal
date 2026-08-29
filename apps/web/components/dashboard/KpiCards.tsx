"use client";

import { formatINR, formatPercent } from "@/lib/utils";

interface KpiCardsProps {
  totalPnl: number;
  todayPnl: number;
  totalCapital: number;
  availableCapital: number;
  totalInvestment: number;
  totalRisk: number;
  winRate: number;
  totalTrades: number;
  totalReturnPercent?: number;
  todayReturnPercent?: number;
}

export default function KpiCards({
  totalPnl,
  todayPnl,
  totalCapital,
  availableCapital,
  totalInvestment,
  totalRisk,
  winRate,
  totalTrades,
  totalReturnPercent,
  todayReturnPercent,
}: KpiCardsProps) {
  const kpis = [
    {
      label: "Total Capital",
      value: formatINR(totalCapital, { compact: true }),
      change: null,
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4H6a2 2 0 0 1-2-2z" />
          <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
        </svg>
      ),
      accentColor: "#3B82F6",
    },
    {
      label: "Available Capital",
      value: formatINR(availableCapital, { compact: true }),
      change: totalCapital > 0 ? formatPercent((availableCapital / totalCapital) * 100) : null,
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      accentColor: "#10B981",
    },
    {
      label: "Total P&L",
      value: formatINR(totalPnl, { compact: true, showSign: true }),
      change: totalReturnPercent != null 
        ? formatPercent(totalReturnPercent) 
        : (totalPnl !== 0 ? formatPercent((todayPnl / Math.abs(totalPnl || 1)) * 100) : "0%"),
      positive: totalPnl >= 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
      accentColor: totalPnl >= 0 ? "#10B981" : "#EF4444",
    },
    {
      label: "Today's P&L",
      value: formatINR(todayPnl, { compact: true, showSign: true }),
      change: todayReturnPercent != null 
        ? formatPercent(todayReturnPercent)
        : (totalPnl !== 0 ? formatPercent((todayPnl / Math.abs(totalPnl || 1)) * 100) : "0%"),
      positive: todayPnl >= 0,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      accentColor: todayPnl >= 0 ? "#10B981" : "#EF4444",
    },
    {
      label: "Deployed Capital",
      value: formatINR(totalInvestment, { compact: true }),
      change: null,
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      accentColor: "#6366F1",
    },
    {
      label: "Risk on PF",
      value: formatINR(totalRisk, { compact: true }),
      change: totalInvestment > 0 ? formatPercent((totalRisk / totalInvestment) * 100) : null,
      positive: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      accentColor: "#F59E0B",
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: `${totalTrades} trades`,
      positive: winRate >= 50,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      accentColor: winRate >= 50 ? "#10B981" : "#EF4444",
    },
  ];

  return (
    <div className="kpi-grid" id="kpi-grid">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="kpi-card"
          style={{ "--kpi-accent": kpi.accentColor } as React.CSSProperties}
          id={`kpi-${kpi.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
        >
          <style>{`
            .kpi-card:hover::before {
              background: var(--kpi-accent, var(--accent-primary));
            }
          `}</style>
          <div className="kpi-card-header">
            <span className="kpi-label">{kpi.label}</span>
            <div
              className="kpi-icon"
              style={{
                background: `${kpi.accentColor}14`,
              }}
            >
              <span style={{ color: kpi.accentColor }}>{kpi.icon}</span>
            </div>
          </div>
          <div
            className="kpi-value"
            style={{ color: kpi.label.includes("P&L") ? kpi.accentColor : undefined }}
          >
            {kpi.value}
          </div>
          {kpi.change && (
            <span className={`kpi-change ${kpi.positive ? "positive" : "negative"}`}>
              {kpi.positive ? "↑" : "↓"} {kpi.change}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
