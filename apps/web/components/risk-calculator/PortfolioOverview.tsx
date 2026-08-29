import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface PortfolioOverviewProps {
  state: any;
  portfolio: any;
  setters?: any;
}

export function PortfolioOverview({ state, portfolio, setters }: PortfolioOverviewProps) {
  const { capital, maxPortfolioRiskPct } = state;
  const { 
    maxRiskBudget, 
    openRiskAmount, plannedRiskAmount, totalPortfolioRiskAmount, remainingRiskCapacityAmount,
    openRiskPct, plannedRiskPct, totalPortfolioRiskPct, remainingRiskCapacityPct,
    totalCapitalDeployed, totalCapitalUtilizationPct,
    fullRiskTradesCapacity
  } = portfolio;

  // Calculate widths for the progress bar (relative to max risk)
  // If total risk exceeds max, we cap it for visual purposes, but maybe show it in red
  const openWidth = Math.min((openRiskPct / maxPortfolioRiskPct) * 100, 100);
  const plannedWidth = Math.min((plannedRiskPct / maxPortfolioRiskPct) * 100, 100 - openWidth);
  const isOverLimit = totalPortfolioRiskPct > maxPortfolioRiskPct;

  return (
    <div className="card card-body mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold tracking-wider text-secondary flex items-center gap-2">
          PORTFOLIO RISK OVERVIEW
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface border border-border-secondary">
            <span className="text-sm font-bold tracking-wider text-secondary uppercase">CASH ONLY</span>
            <style dangerouslySetInnerHTML={{ __html: `
              .toggle-track { 
                width: 36px; height: 20px; border-radius: 9999px; padding: 2px; 
                cursor: pointer; border: none; position: relative;
                display: inline-flex; align-items: center; flex-shrink: 0;
                transition: background-color 0.3s ease;
              }
              .toggle-track.off { background-color: #3f3f46; }
              .toggle-track.on { background-color: #8B5CF6; }
              .toggle-knob {
                width: 16px; height: 16px; border-radius: 9999px; 
                background: #fff; display: block;
                box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .toggle-track.off .toggle-knob { transform: translateX(0px); }
              .toggle-track.on .toggle-knob { transform: translateX(16px); }
            `}} />
            <button 
              onClick={() => {
                if (setters?.setCashOnly) {
                  setters.setCashOnly(!state.cashOnly);
                }
              }}
              className={`toggle-track ${state.cashOnly ? "on" : "off"}`}
              title="No Leverage - Caps position size to total available capital"
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-6">
        <div>
          <div className="text-xs text-secondary font-semibold mb-1" title="Remaining capital after deducting all planned trades">Unallocated Capital</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
            <input 
              type="number"
              value={Math.max(0, capital - portfolio.totalCapitalDeployed) === 0 ? "" : Math.max(0, capital - portfolio.totalCapitalDeployed)}
              onChange={(e) => {
                const newUnallocated = Number(e.target.value);
                if (setters?.setCapital) setters.setCapital(newUnallocated + portfolio.totalCapitalDeployed);
              }}
              className="form-input pl-8 w-full font-mono text-sm font-bold"
            />
          </div>
          <div className="text-[10px] text-muted mt-1">Total Account: {formatINR(capital)}</div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Max Portfolio Risk</div>
          <div className="relative">
            <input 
              type="number"
              step="0.1"
              value={maxPortfolioRiskPct}
              onChange={(e) => {
                if (setters?.setMaxPortfolioRiskPct) setters.setMaxPortfolioRiskPct(Number(e.target.value));
              }}
              className="form-input pr-8 w-full font-mono text-sm font-bold text-primary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
          </div>
          <div className="text-[10px] text-muted mt-1">{formatINR(maxRiskBudget)}</div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Current Portfolio Risk (Open)</div>
          <div className="text-lg font-bold font-mono text-positive">{openRiskPct.toFixed(2)}%</div>
          <div className="text-xs text-positive">{formatINR(openRiskAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Planned Risk</div>
          <div className="text-lg font-bold font-mono text-warning" style={{ color: "#F59E0B" }}>{plannedRiskPct.toFixed(2)}%</div>
          <div className="text-xs text-warning" style={{ color: "#F59E0B" }}>{formatINR(plannedRiskAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Total Portfolio Risk</div>
          <div className={cn("text-lg font-bold font-mono", isOverLimit ? "text-negative" : "text-primary")} style={!isOverLimit ? { color: "#EAB308" } : undefined}>
            {totalPortfolioRiskPct.toFixed(2)}%
          </div>
          <div className={isOverLimit ? "text-negative" : "text-warning"} style={!isOverLimit ? { color: "#EAB308" } : undefined}>
            {formatINR(totalPortfolioRiskAmount)}
          </div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Available Risk</div>
          <div className={cn("text-lg font-bold font-mono", remainingRiskCapacityPct < 0 ? "text-negative" : "text-positive")}>
            {remainingRiskCapacityPct.toFixed(2)}%
          </div>
          <div className={remainingRiskCapacityPct < 0 ? "text-negative" : "text-positive"}>
            {formatINR(remainingRiskCapacityAmount)}
          </div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Capital Utilization</div>
          <div className="text-lg font-bold font-mono" style={{ color: "#3B82F6" }}>{totalCapitalUtilizationPct.toFixed(1)}%</div>
          <div className="text-xs text-muted">{formatINR(totalCapitalDeployed, { compact: true })} / {formatINR(capital, { compact: true })}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted mb-2 font-mono relative">
          <span>0%</span>
          {openRiskPct > 0 && (
            <span style={{ position: "absolute", left: `${openWidth}%`, transform: "translateX(-50%)", color: "var(--color-positive)" }}>{openRiskPct.toFixed(2)}% (Open)</span>
          )}
          {plannedRiskPct > 0 && (
            <span style={{ position: "absolute", left: `${openWidth + plannedWidth}%`, transform: "translateX(-50%)", color: "#EAB308" }}>{totalPortfolioRiskPct.toFixed(2)}% (Total)</span>
          )}
          <span className="text-negative">{maxPortfolioRiskPct.toFixed(2)}% (Max)</span>
        </div>
        <div className="settings-progress-bar-bg relative" style={{ height: 8, background: "rgba(255, 255, 255, 0.05)" }}>
          {/* Open Risk Bar */}
          <div className="absolute top-0 left-0 h-full" style={{ width: `${openWidth}%`, background: "var(--color-positive)", borderRadius: openWidth === 100 ? "4px" : "4px 0 0 4px" }} />
          {/* Planned Risk Bar */}
          <div className="absolute top-0 h-full" style={{ left: `${openWidth}%`, width: `${plannedWidth}%`, background: "#EAB308", borderRadius: (openWidth + plannedWidth) === 100 ? "0 4px 4px 0" : "0" }} />
          {/* Over limit indicator */}
          {isOverLimit && (
             <div className="absolute top-0 right-0 h-full w-full" style={{ background: "rgba(239, 68, 68, 0.2)", borderRadius: 4 }} />
          )}
        </div>
      </div>

      <div className="bg-sidebar-active p-3 rounded-md flex items-start gap-3" style={{ background: "rgba(234, 179, 8, 0.1)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2" className="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div className="text-sm text-secondary dark:text-white/80">
          <span className="font-semibold" style={{ color: "#EAB308" }}>Insight:</span> You can take {Math.max(0, fullRiskTradesCapacity).toFixed(1)} more full-risk trade{fullRiskTradesCapacity !== 1 ? 's' : ''} ({state.defaultTradeRiskPct.toFixed(2)}%) or multiple smaller trades within your remaining risk budget of {remainingRiskCapacityPct.toFixed(2)}%.
        </div>
      </div>

    </div>
  );
}
