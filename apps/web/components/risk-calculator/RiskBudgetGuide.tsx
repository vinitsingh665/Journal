import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface RiskBudgetGuideProps {
  portfolio: any;
  state: any;
}

export function RiskBudgetGuide({ portfolio, state }: RiskBudgetGuideProps) {
  const { maxRiskBudget, openRiskAmount, plannedRiskAmount, remainingRiskCapacityAmount, fullRiskTradesCapacity } = portfolio;
  const { maxPortfolioRiskPct, capital } = state;

  const totalRisk = openRiskAmount + plannedRiskAmount;
  const totalRiskPct = capital > 0 ? (totalRisk / capital) * 100 : 0;
  
  // Calculate segments for the visual doughnut roughly
  const openPct = maxRiskBudget > 0 ? (openRiskAmount / maxRiskBudget) * 100 : 0;
  const plannedPct = maxRiskBudget > 0 ? (plannedRiskAmount / maxRiskBudget) * 100 : 0;
  const availablePct = maxRiskBudget > 0 ? (Math.max(0, remainingRiskCapacityAmount) / maxRiskBudget) * 100 : 0;
  const overLimitPct = maxRiskBudget > 0 ? (Math.max(0, totalRisk - maxRiskBudget) / maxRiskBudget) * 100 : 0;

  // Render a simple CSS conic-gradient doughnut chart
  const conicGradient = `conic-gradient(
    var(--color-positive) 0% ${openPct}%, 
    #EAB308 ${openPct}% ${openPct + plannedPct}%, 
    #334155 ${openPct + plannedPct}% ${openPct + plannedPct + availablePct}%, 
    var(--color-negative) ${openPct + plannedPct + availablePct}% 100%
  )`;

  return (
    <div className="card card-body flex flex-col h-full border-l border-border-secondary rounded-l-none">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-bold text-sm tracking-wide text-secondary flex items-center gap-2">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           RISK BUDGET GUIDE
        </h3>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          {/* Doughnut Chart via CSS */}
          <div className="absolute inset-0 rounded-full" style={{ background: conicGradient }}></div>
          <div className="absolute inset-2 rounded-full flex flex-col items-center justify-center" style={{ background: "var(--bg-card)" }}>
            <span className="text-lg font-bold font-mono">{totalRiskPct.toFixed(2)}%</span>
            <span className="text-[10px] text-muted">Total Risk</span>
          </div>
        </div>
        
        <div className="flex-1 pl-6 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-positive"></div>
              <span className="text-secondary">Open Risk</span>
            </div>
            <div className="text-right">
              <div className="font-bold font-mono">{(capital > 0 ? (openRiskAmount/capital)*100 : 0).toFixed(2)}%</div>
              <div className="text-xs text-muted">{formatINR(openRiskAmount, { compact: true })}</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "#EAB308" }}></div>
              <span className="text-secondary">Planned Risk</span>
            </div>
            <div className="text-right">
              <div className="font-bold font-mono">{(capital > 0 ? (plannedRiskAmount/capital)*100 : 0).toFixed(2)}%</div>
              <div className="text-xs text-muted">{formatINR(plannedRiskAmount, { compact: true })}</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-positive" style={{ background: "#10B981" }}></div>
              <span className="text-secondary">Available</span>
            </div>
            <div className="text-right">
              <div className="font-bold font-mono">{(capital > 0 ? (Math.max(0, remainingRiskCapacityAmount)/capital)*100 : 0).toFixed(2)}%</div>
              <div className="text-xs text-muted">{formatINR(Math.max(0, remainingRiskCapacityAmount), { compact: true })}</div>
            </div>
          </div>
          {overLimitPct > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-border-secondary/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-negative"></div>
                <span className="text-negative font-medium">Over Limit</span>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono text-negative">{((totalRisk - maxRiskBudget) / capital * 100).toFixed(2)}%</div>
                <div className="text-xs text-negative">{formatINR(totalRisk - maxRiskBudget, { compact: true })}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-border-secondary">
        <div>
          <div className="text-xs text-secondary mb-1">Your Capacity</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-primary">{Math.max(0, Math.floor(fullRiskTradesCapacity))}</span>
            <div className="text-[10px] text-muted leading-tight">
              Full-Risk Trades<br/>({state.defaultTradeRiskPct.toFixed(2)}% each)
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs text-secondary mb-1">Remaining Capacity</div>
          <div className={cn("text-xl font-bold font-mono", remainingRiskCapacityAmount < 0 ? "text-negative" : "text-positive")}>
            {(capital > 0 ? (remainingRiskCapacityAmount/capital)*100 : 0).toFixed(2)}%
          </div>
          <div className={cn("text-xs mt-1", remainingRiskCapacityAmount < 0 ? "text-negative" : "text-positive")}>
            {formatINR(remainingRiskCapacityAmount)}
          </div>
        </div>
      </div>

      <div className="bg-input/50 rounded p-3 text-xs text-secondary">
        <div className="font-semibold text-text-primary mb-2">Risk Hierarchy (In Order)</div>
        <ol className="space-y-1.5 list-decimal list-inside font-mono">
          <li>Per Trade Risk ({state.defaultTradeRiskPct.toFixed(2)}%)</li>
          <li>Portfolio Heat ({totalRiskPct.toFixed(2)}%)</li>
          <li>Max Portfolio Risk ({maxPortfolioRiskPct.toFixed(2)}%)</li>
          <li>Capital Utilization ({portfolio.totalCapitalUtilizationPct.toFixed(1)}%)</li>
        </ol>
      </div>
    </div>
  );
}
