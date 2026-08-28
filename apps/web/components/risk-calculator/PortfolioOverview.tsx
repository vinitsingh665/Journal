import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface PortfolioOverviewProps {
  state: any;
  portfolio: any;
  setters?: any;
}

export function PortfolioOverview({ state, portfolio, setters }: PortfolioOverviewProps) {
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
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
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-secondary btn-sm bg-transparent border-border-secondary"
          >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             Risk Rules
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-secondary btn-sm bg-transparent border-border-secondary"
          >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
             Advanced
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-6">
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Trading Capital</div>
          <div className="text-lg font-bold font-mono">{formatINR(capital)}</div>
        </div>
        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Max Portfolio Risk</div>
          <div className="text-lg font-bold font-mono text-primary">{maxPortfolioRiskPct.toFixed(2)}%</div>
          <div className="text-xs text-muted">{formatINR(maxRiskBudget)}</div>
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
        <div className="flex justify-between text-xs text-muted mb-2 font-mono">
          <span>0%</span>
          <span style={{ position: "absolute", left: `${openWidth}%`, transform: "translateX(-50%)", color: "var(--color-positive)" }}>{openRiskPct.toFixed(2)}% (Open)</span>
          <span style={{ position: "absolute", left: `${openWidth + plannedWidth}%`, transform: "translateX(-50%)", color: "#EAB308" }}>{totalPortfolioRiskPct.toFixed(2)}% (Total)</span>
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

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border-secondary rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-secondary">
              <h2 className="text-xl font-bold text-text-primary">Advanced Risk Rules</h2>
              <p className="text-secondary text-sm mt-1">Configure your global portfolio risk constraints.</p>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Max Portfolio Risk (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={maxPortfolioRiskPct}
                    onChange={(e) => {
                      if (setters?.setMaxPortfolioRiskPct) {
                        setters.setMaxPortfolioRiskPct(Number(e.target.value));
                      }
                    }}
                    className="w-full bg-input/50 border border-border-secondary rounded-xl px-4 py-3 pr-8 text-text-primary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">%</span>
                </div>
                <p className="text-xs text-secondary mt-2">Maximum allowed open risk across all positions. The standard recommendation is 1.5% to 2.0%.</p>
              </div>
            </div>
            
            <div className="p-6 pt-0 flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-primary px-6"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
