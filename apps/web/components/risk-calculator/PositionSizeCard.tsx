import React from "react";
import { formatINR, cn } from "@/lib/utils";

interface PositionSizeCardProps {
  current: any;
  actions: any;
}

export function PositionSizeCard({ current, actions }: PositionSizeCardProps) {
  const { 
    tradeRiskAmount, riskPerShare, positionSize, capitalDeployed, capitalUtilizationPct,
    executionRiskPerShare, maxExecutionLoss, rewardPerShare, rr, potentialProfit,
    expectancyR, expectancyAmt
  } = current;

  return (
    <div className="card card-body flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-inverse">2</div>
        <h3 className="font-bold text-sm tracking-wide">POSITION SIZE & RISK</h3>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-4 flex-1">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-1">Position Size</div>
          <div className="text-2xl font-bold text-primary tracking-tight truncate" title={String(positionSize)}>{positionSize}</div>
          <div className="text-xs text-muted mt-1">Shares</div>
        </div>
        
        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-1">Risk Per Share</div>
          <div className="text-lg font-bold text-text-primary tracking-tight truncate" title={formatINR(riskPerShare)}>{formatINR(riskPerShare)}</div>
          <div className="text-xs text-muted mt-1">After Slippage</div>
          <div className="text-sm font-bold text-text-primary tracking-tight truncate" title={formatINR(executionRiskPerShare)}>{formatINR(executionRiskPerShare)}</div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-1">Planned Risk</div>
          <div className="text-lg font-bold text-primary tracking-tight truncate" title={formatINR(tradeRiskAmount)}>{formatINR(tradeRiskAmount)}</div>
          <div className="text-[10px] text-muted mt-1">Nominal Risk</div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-1">Max Execution Risk</div>
          <div className="text-lg font-bold text-negative tracking-tight truncate" title={formatINR(maxExecutionLoss)}>{formatINR(maxExecutionLoss)}</div>
          <div className="text-[10px] text-muted mt-1">Incl. slippage</div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-1">Capital Required</div>
          <div className={cn("text-lg font-bold tracking-tight truncate", capitalUtilizationPct > 100 ? "text-negative" : "text-text-primary")} title={formatINR(capitalDeployed)}>{formatINR(capitalDeployed)}</div>
          <div className={cn("text-[10px] mt-1", capitalUtilizationPct > 100 ? "text-negative font-medium" : "text-muted")}>
            {capitalUtilizationPct.toFixed(1)}% of capital {capitalUtilizationPct > 100 && "(Leverage Required)"}
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-semibold text-secondary mb-1">Reward (At Target)</div>
          <div className="text-lg font-bold text-positive tracking-tight truncate" title={formatINR(potentialProfit)}>{formatINR(potentialProfit)}</div>
          <div className="text-[10px] text-muted mt-1">{formatINR(rewardPerShare)} / share</div>
        </div>

        <div>
          <div className="text-xs text-secondary font-semibold mb-1">R:R</div>
          <div className="text-lg font-bold font-mono truncate">1 : {rr.toFixed(2)}</div>
        </div>

        <div>
          <div className="text-xs text-secondary font-semibold mb-1">Expectancy (R)</div>
          <div className={cn("text-xl font-bold font-mono", expectancyR >= 0 ? "text-positive" : "text-negative")}>
            {expectancyR >= 0 ? "+" : ""}{expectancyR.toFixed(2)}R
          </div>
          <div className={cn("text-xs mt-1", expectancyR >= 0 ? "text-positive" : "text-negative")}>
            {expectancyAmt >= 0 ? "+" : ""}{formatINR(expectancyAmt, { compact: true })} / trade
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border-secondary">
        <button 
          className="btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          onClick={actions.addTradeToPlanner}
          disabled={positionSize <= 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add to Planner
        </button>
      </div>
    </div>
  );
}
