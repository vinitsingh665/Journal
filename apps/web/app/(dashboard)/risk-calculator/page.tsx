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

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Risk Calculator</h1>
          <p className="text-secondary mt-1 text-sm">
            Size positions, manage portfolio risk, plan trades with confidence.
          </p>
        </div>
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
      </div>

      <PortfolioOverview state={engine.state} portfolio={engine.portfolio} />

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-12 gap-4">
        {/* Left Column: Trade Inputs (Span 3) */}
        <div className="xl:col-span-3 lg:col-span-2">
          <TradeInputsForm state={engine.state} setters={engine.setters} current={engine.current} />
        </div>

        {/* Middle Left: Position Size & Derived (Span 3) */}
        <div className="xl:col-span-3 lg:col-span-2">
          <PositionSizeCard current={engine.current} actions={engine.actions} />
        </div>

        {/* Middle Right: Scenario Comparison (Span 3) */}
        <div className="xl:col-span-3 lg:col-span-2">
          <ScenarioComparison state={engine.state} current={engine.current} />
        </div>

        {/* Right Column: Risk Budget Donut (Span 3) */}
        <div className="xl:col-span-3 lg:col-span-2">
          <RiskBudgetGuide portfolio={engine.portfolio} state={engine.state} />
        </div>
      </div>

      <RiskTemplates templates={engine.state.savedTemplates} actions={engine.actions} />

      <MultipleTradesPlanner portfolio={engine.portfolio} state={engine.state} actions={engine.actions} />
      
    </div>
  );
}
