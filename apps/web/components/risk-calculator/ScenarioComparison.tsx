import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface ScenarioComparisonProps {
  state: any;
  current: any;
}

export function ScenarioComparison({ state, current }: ScenarioComparisonProps) {
  const { capital, entry, target, direction, winRatePct } = state;
  const { riskPerShare, positionSize, expectancyR, expectancyAmt } = current;

  // Calculate scenarios
  const rValue = riskPerShare;
  
  const scenarios = [
    { label: "Stop Loss Hit", r: -1, pnl: positionSize * (-rValue), color: "text-negative", dot: "bg-negative" },
    { label: "Partial (50%)", r: -0.5, pnl: positionSize * (-rValue * 0.5), color: "text-negative", dot: "bg-negative" },
    { label: "Break Even", r: 0, pnl: 0, color: "text-muted", dot: "bg-secondary" },
    { label: "1R Achieved", r: 1, pnl: positionSize * rValue, color: "text-positive", dot: "bg-positive" },
  ];

  // Add target dynamically
  const targetR = rValue > 0 && target > 0 ? (direction === "LONG" ? target - entry : entry - target) / rValue : 0;
  if (targetR > 0) {
    scenarios.push({ label: `Target Hit (${targetR.toFixed(1)}R)`, r: targetR, pnl: positionSize * (targetR * rValue), color: "text-positive", dot: "bg-positive" });
  }

  // Add a 5R extended target just for perspective
  scenarios.push({ label: "Extended (5R)", r: 5, pnl: positionSize * (5 * rValue), color: "text-positive", dot: "bg-positive" });

  return (
    <div className="card card-body flex flex-col h-full relative">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-inverse">3</div>
        <h3 className="font-bold text-sm tracking-wide">SCENARIO COMPARISON</h3>
      </div>

      <div className="flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-secondary text-xs border-b border-border-secondary">
              <th className="font-semibold pb-3 text-left">Scenario</th>
              <th className="font-semibold pb-3 text-center">R Multiple</th>
              <th className="font-semibold pb-3 text-right">P&L (₹)</th>
              <th className="font-semibold pb-3 text-right">P&L (%)</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, i) => {
              const pnlPct = capital > 0 ? (s.pnl / capital) * 100 : 0;
              return (
                <tr key={i} className="border-b border-border-secondary/50 hover:bg-sidebar-hover transition-colors">
                  <td className="py-3 flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", s.dot)}></div>
                    <span className="font-medium text-text-primary">{s.label}</span>
                  </td>
                  <td className="py-3 text-center font-mono text-muted">
                    {s.r > 0 ? "+" : ""}{Number(s.r.toFixed(2))}R
                  </td>
                  <td className={cn("py-3 text-right font-mono", s.color)}>
                    {s.pnl > 0 ? "+" : ""}{formatINR(s.pnl)}
                  </td>
                  <td className={cn("py-3 text-right font-mono", s.color)}>
                    {pnlPct > 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 rounded-md bg-sidebar-active border border-border-secondary">
        <div className="flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" className="mt-0.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          <div className="text-sm text-secondary">
            Based on Expected Win Rate: <span className="font-bold text-primary">{winRatePct}%</span><br/>
            Expectancy: <strong className={expectancyR >= 0 ? "text-positive" : "text-negative"}>
              {expectancyR >= 0 ? "+" : ""}{expectancyR.toFixed(2)}R
            </strong> per trade
          </div>
        </div>
      </div>
    </div>
  );
}
