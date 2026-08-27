import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface MultipleTradesPlannerProps {
  portfolio: any;
  state: any;
  actions: any;
}

export function MultipleTradesPlanner({ portfolio, state, actions }: MultipleTradesPlannerProps) {
  const { capital } = state;
  const { 
    enrichedTrades, 
    openRiskAmount, plannedRiskAmount, totalPortfolioRiskAmount, remainingRiskCapacityAmount,
    totalCapitalDeployed
  } = portfolio;

  const openCount = enrichedTrades.filter((t: any) => t.status === "OPEN").length;
  const plannedCount = enrichedTrades.filter((t: any) => t.status === "PLANNED").length;

  // Calculate sector concentration
  const sectorExposure: Record<string, number> = {};
  enrichedTrades.forEach((t: any) => {
    if (t.capitalDeployed > 0) {
      sectorExposure[t.sector] = (sectorExposure[t.sector] || 0) + t.capitalDeployed;
    }
  });

  let topSector = "";
  let topSectorCapital = 0;
  Object.entries(sectorExposure).forEach(([sector, amount]) => {
    if (amount > topSectorCapital) {
      topSectorCapital = amount;
      topSector = sector;
    }
  });

  const topSectorPct = totalCapitalDeployed > 0 ? (topSectorCapital / totalCapitalDeployed) * 100 : 0;
  const hasSectorWarning = topSectorPct > 35; // warning if > 35% in one sector

  return (
    <div className="card card-body mt-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-inverse">4</div>
          <h3 className="font-bold text-sm tracking-wide">MULTIPLE TRADES PLANNER</h3>
          
          <div className="flex gap-3 ml-6 pl-6 border-l border-border-secondary">
            <div className="px-3 py-1.5 rounded-md bg-positive/10">
               <div className="text-[10px] text-secondary font-semibold uppercase">Open Risk ({openCount})</div>
               <div className="text-sm font-bold font-mono text-positive">{formatINR(openRiskAmount, { compact: true })} ({(capital > 0 ? (openRiskAmount/capital)*100 : 0).toFixed(2)}%)</div>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-warning/10">
               <div className="text-[10px] text-secondary font-semibold uppercase">Planned Risk ({plannedCount})</div>
               <div className="text-sm font-bold font-mono text-warning">{formatINR(plannedRiskAmount, { compact: true })} ({(capital > 0 ? (plannedRiskAmount/capital)*100 : 0).toFixed(2)}%)</div>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-sidebar-active/30">
               <div className="text-[10px] text-secondary font-semibold uppercase">Total Risk</div>
               <div className="text-sm font-bold font-mono text-primary">{formatINR(totalPortfolioRiskAmount, { compact: true })} ({(capital > 0 ? (totalPortfolioRiskAmount/capital)*100 : 0).toFixed(2)}%)</div>
            </div>
            <div className={cn("px-3 py-1.5 rounded-md", remainingRiskCapacityAmount < 0 ? "bg-negative/10" : "bg-positive/10")}>
               <div className="text-[10px] text-secondary font-semibold uppercase">Available Risk</div>
               <div className={cn("text-sm font-bold font-mono", remainingRiskCapacityAmount < 0 ? "text-negative" : "text-positive")}>
                 {formatINR(remainingRiskCapacityAmount, { compact: true })} ({(capital > 0 ? (remainingRiskCapacityAmount/capital)*100 : 0).toFixed(2)}%)
               </div>
            </div>
            <div className="px-3 py-1.5 rounded-md bg-sidebar-active/30">
               <div className="text-[10px] text-secondary font-semibold uppercase">Capital Deployed</div>
               <div className="text-sm font-bold font-mono text-primary">
                 {formatINR(totalCapitalDeployed, { compact: true })} ({(capital > 0 ? (totalCapitalDeployed/capital)*100 : 0).toFixed(1)}%)
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="btn btn-primary btn-sm border-primary" onClick={actions.addTradeToPlanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Trade
          </button>
          <button className="btn btn-secondary btn-sm border-negative text-negative hover:bg-negative/10" onClick={actions.clearAllTrades}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Clear All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-secondary text-[10px] uppercase border-y border-border-secondary/50 bg-sidebar-active/30">
              <th className="font-semibold py-3 text-center">#</th>
              <th className="font-semibold py-3 text-center">Symbol<br/>Exchange</th>
              <th className="font-semibold py-3 text-center">Direction</th>
              <th className="font-semibold py-3 text-center">Entry Price<br/>(₹)</th>
              <th className="font-semibold py-3 text-center">Stop Loss<br/>(₹)</th>
              <th className="font-semibold py-3 text-center">Risk / Share<br/>(₹)</th>
              <th className="font-semibold py-3 text-center">Qty<br/>(Shares)</th>
              <th className="font-semibold py-3 text-center">Risk Amount<br/>(₹)</th>
              <th className="font-semibold py-3 text-center">Risk %<br/>(Portfolio)</th>
              <th className="font-semibold py-3 text-center">R:R</th>
              <th className="font-semibold py-3 text-center">Target Price<br/>(₹)</th>
              <th className="font-semibold py-3 text-center">Capital<br/>(₹)</th>
              <th className="font-semibold py-3 text-center">Sector</th>
              <th className="font-semibold py-3 text-center">Status</th>
              <th className="font-semibold py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {enrichedTrades.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-muted font-sans text-sm">
                  No trades in the planner. Add a trade using the panel above.
                </td>
              </tr>
            ) : enrichedTrades.map((t: any, idx: number) => (
              <tr key={t.id} className="border-b border-border-secondary/30 hover:bg-sidebar-active/50">
                <td className="py-3 text-center text-muted">{idx + 1}</td>
                <td className="py-3 text-center">
                  <div className="font-bold text-text-primary">{t.symbol}</div>
                  <div className="text-[10px] text-muted">{t.exchange}</div>
                </td>
                <td className={cn("py-3 text-center font-bold", t.direction === "LONG" ? "text-positive" : "text-negative")}>
                  {t.direction === "LONG" ? "Long" : "Short"}
                </td>
                <td className="py-3 text-center">{formatINR(t.entry)}</td>
                <td className="py-3 text-center">{formatINR(t.stop)}</td>
                <td className="py-3 text-center">{formatINR(t.riskPerShare)}</td>
                <td className="py-3 text-center font-bold">{t.quantity}</td>
                <td className="py-3 text-center font-bold">{formatINR(t.riskAmount)}</td>
                <td className="py-3 text-center font-bold">{t.riskPct.toFixed(2)}%</td>
                <td className="py-3 text-center">{t.rr > 0 ? `1:${t.rr.toFixed(1)}` : "—"}</td>
                <td className="py-3 text-center">{t.target > 0 ? formatINR(t.target) : "—"}</td>
                <td className="py-3 text-center text-muted">{formatINR(t.capitalDeployed)}</td>
                <td className="py-3 text-center text-secondary font-sans">{t.sector}</td>
                <td className="py-3 text-center">
                  <span 
                    onClick={() => actions.toggleTradeStatus(t.id)}
                    title="Click to toggle status"
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider cursor-pointer hover:opacity-80 transition-opacity inline-block", 
                      t.status === "OPEN" ? "bg-positive/10 text-positive" : "bg-warning/10 text-warning"
                    )} 
                    style={t.status === "PLANNED" ? { color: "#F59E0B", background: "rgba(245, 158, 11, 0.1)" } : undefined}
                    role="button"
                    tabIndex={0}
                  >
                    {t.status === "OPEN" ? "Open" : "Planned"}
                  </span>
                </td>
                <td className="py-3 text-center flex items-center justify-center gap-1 h-full">
                  <button 
                    onClick={() => {
                      actions.loadTradeToInputs(t.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="btn-icon p-1.5 rounded-md hover:bg-sidebar-active/50 text-muted hover:text-primary transition-colors"
                    title="Edit Trade"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button 
                    onClick={() => actions.removeTrade(t.id)}
                    className="btn-icon p-1.5 rounded-md hover:bg-negative/20 text-muted hover:text-negative transition-colors"
                    title="Remove Trade"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2 pt-4 mt-2">
        <div className="text-xs text-muted font-sans">
          Note: Correlation & sector concentration warnings are active.
        </div>
        {hasSectorWarning && (
          <div className="flex items-center gap-2 text-xs font-semibold text-negative px-3 py-1.5 rounded-md bg-negative/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Sector Concentration: {topSector} ({topSectorPct.toFixed(0)}%)
          </div>
        )}
      </div>
    </div>
  );
}
