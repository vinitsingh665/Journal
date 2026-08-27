"use client";

import React from "react";
import "./risk.css";
import { useRiskEngine } from "@/components/risk-calculator/useRiskEngine";
import { PortfolioOverview } from "@/components/risk-calculator/PortfolioOverview";
import { TradeInputsForm } from "@/components/risk-calculator/TradeInputsForm";
import { PositionSizeCard } from "@/components/risk-calculator/PositionSizeCard";
import { ScenarioComparison } from "@/components/risk-calculator/ScenarioComparison";
import { RiskBudgetGuide } from "@/components/risk-calculator/RiskBudgetGuide";
import { MultipleTradesPlanner } from "@/components/risk-calculator/MultipleTradesPlanner";
import { RiskTemplates } from "@/components/risk-calculator/RiskTemplates";

export default function RiskCalculatorPage() {
  const engine = useRiskEngine();

  const hasTemplates = engine.state.savedTemplates && engine.state.savedTemplates.length > 0;
  const isCalculatorOpen = engine.state.isCalculatorOpen;

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Risk Calculator</h1>
          <p className="text-secondary mt-1 text-sm">
            Size positions, manage portfolio risk, plan trades with confidence.
          </p>
        </div>
        
        {isCalculatorOpen && (
          <div className="flex gap-3">
            <button 
              onClick={engine.actions.saveTemplate}
              className="btn btn-secondary bg-transparent border-border-secondary"
              title="Save current risk settings as a new template"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
               Save Template
            </button>
            <button className="btn btn-primary" onClick={() => {
               // Reset everything to defaults
               engine.setters.setCapital(500000);
               engine.setters.setMaxPortfolioRiskPct(1.5);
               engine.setters.setDefaultTradeRiskPct(0.5);
               engine.setters.setEntry(1000);
               engine.setters.setStop(950);
               engine.setters.setTarget(1150);
               engine.actions.clearAllTrades();
            }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
               Reset
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar for Templates */}
        {hasTemplates && (
          <div className="w-full lg:w-80 shrink-0">
            <RiskTemplates templates={engine.state.savedTemplates} actions={engine.actions} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full">
          {!isCalculatorOpen ? (
            <div className="card flex flex-col items-center justify-center p-16 text-center border-dashed border-2 border-border-secondary">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {hasTemplates ? "Calculate your risk" : "Calculate your first risk"}
              </h2>
              <p className="text-muted mb-8 max-w-md">
                Plan your position sizing and portfolio risk management before entering a trade to protect your capital.
              </p>
              <button 
                onClick={engine.actions.openCalculator}
                className="btn btn-primary btn-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {hasTemplates ? "Calculate New Risk" : "Calculate First Risk"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <PortfolioOverview state={engine.state} portfolio={engine.portfolio} />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <TradeInputsForm state={engine.state} setters={engine.setters} current={engine.current} />
                <PositionSizeCard current={engine.current} actions={engine.actions} />
                <ScenarioComparison state={engine.state} current={engine.current} />
                <RiskBudgetGuide portfolio={engine.portfolio} state={engine.state} />
              </div>

              <MultipleTradesPlanner portfolio={engine.portfolio} state={engine.state} actions={engine.actions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
