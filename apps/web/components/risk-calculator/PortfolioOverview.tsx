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
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-secondary btn-sm bg-transparent border-border-secondary hover:bg-white/5 transition-colors"
          >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             Risk Rules
          </button>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#1E2330] to-[#12151D] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Risk Rules</h2>
                  <p className="text-white/50 text-xs">Configure your global constraints</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              
              {/* Max Portfolio Risk */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Max Portfolio Risk</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
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
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 pr-8 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-lg transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 font-mono">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
                  The maximum open risk allowed across all positions. The professional standard is 1.5% to 2.0%.
                </p>
              </div>

              {/* Cash Only Toggle */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                <div className="pr-4">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Cash Only <span className="text-[10px] font-normal uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white/70">No Leverage</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1.5 leading-relaxed">
                    Automatically cap position size so it never exceeds your total available cash capital.
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (setters?.setCashOnly) {
                      setters.setCashOnly(!state.cashOnly);
                    }
                  }}
                  style={{ minWidth: "44px", width: "44px", height: "24px", flexShrink: 0 }}
                  className={cn(
                    "relative inline-flex items-center rounded-full transition-all duration-300",
                    state.cashOnly ? "bg-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" : "bg-white/10"
                  )}
                >
                  <span 
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                      state.cashOnly ? "translate-x-6" : "translate-x-1"
                    )} 
                  />
                </button>
              </div>

            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-primary px-8 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold"
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
