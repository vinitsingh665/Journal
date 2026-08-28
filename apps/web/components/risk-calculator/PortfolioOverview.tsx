import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatINR, cn } from "@/lib/utils";

interface PortfolioOverviewProps {
  state: any;
  portfolio: any;
  setters?: any;
}

export function PortfolioOverview({ state, portfolio, setters }: PortfolioOverviewProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
            className="btn btn-secondary btn-sm bg-transparent border-border-secondary hover:bg-white/5 transition-colors"
          >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
             Risk Settings
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

      {showSettingsModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Subtle top glare */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">Risk Settings</h2>
              </div>
              <p className="text-white/60 text-sm mt-2">Configure your global portfolio risk constraints to match your trading style.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-3">Max Portfolio Risk (%)</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
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
                    className="relative w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 pr-10 text-white font-mono text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 font-bold">%</span>
                </div>
                <p className="text-[11px] text-white/40 mt-3 leading-relaxed">Maximum allowed open risk across all positions. The standard recommendation is 1.5% to 2.0%.</p>
              </div>

              <div className="pt-5 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <div className="text-sm font-bold text-white">Cash Only (No Leverage)</div>
                    <div className="text-[11px] text-white/50 mt-1.5 leading-relaxed">Automatically cap your position sizes so they mathematically never exceed your total available capital.</div>
                  </div>
                  <button 
                    onClick={() => {
                      if (setters?.setCashOnly) {
                        setters.setCashOnly(!state.cashOnly);
                      }
                    }}
                    style={{ minWidth: "46px", width: "46px", height: "26px", flexShrink: 0 }}
                    className={cn(
                      "relative inline-flex items-center rounded-full transition-all duration-300",
                      state.cashOnly ? "bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-white/10"
                    )}
                  >
                    <span 
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm",
                        state.cashOnly ? "translate-x-6" : "translate-x-0.5"
                      )} 
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 pt-2 pb-6 flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="btn btn-primary px-8 py-2.5 shadow-[0_4px_14px_0_rgb(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:bg-primary/90 transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
