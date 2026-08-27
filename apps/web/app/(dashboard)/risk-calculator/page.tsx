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
  const [showSaveModal, setShowSaveModal] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");

  const handleSaveTemplate = () => {
    engine.actions.saveTemplate(templateName);
    setShowSaveModal(false);
    setTemplateName("");
  };

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
        
        {!isCalculatorOpen ? (
          <div className="flex gap-3">
            <button 
              onClick={engine.actions.openCalculator}
              className="btn btn-primary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Calculate Risk
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={engine.actions.closeCalculator}
              className="btn btn-secondary bg-transparent border-border-secondary text-secondary mr-2"
              title="Go back to the Risk Calculator home"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               Back
            </button>
            <button 
              onClick={() => setShowSaveModal(true)}
              className="btn btn-secondary bg-transparent border-border-secondary"
              title="Save current risk settings as a new template"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
               Save Template
            </button>
            <button className="btn btn-primary" onClick={() => {
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

      <div className="w-full">
        {/* Horizontal Grid for Templates */}
        {hasTemplates && !isCalculatorOpen && (
          <div className="mb-8">
            <RiskTemplates templates={engine.state.savedTemplates} actions={engine.actions} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="w-full">
          {!isCalculatorOpen && !hasTemplates && (
            <div className="flex flex-col items-center justify-center py-24 bg-surface border border-dashed border-border-secondary rounded-2xl w-full h-[400px]">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">No Risk Templates Yet</h2>
              <p className="text-secondary max-w-sm text-center mb-8">
                Calculate your first risk profile. You can save your capital and risk settings as a template later.
              </p>
              <button 
                onClick={engine.actions.openCalculator}
                className="btn btn-primary px-6 py-2.5"
              >
                Calculate your first risk
              </button>
            </div>
          )}

          {isCalculatorOpen && (
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

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border-secondary rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-1">Save Template</h2>
              <p className="text-secondary text-sm mb-6">Give your risk profile a recognizable name.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">Template Name</label>
                  <input 
                    type="text" 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Aggressive Options, 1% Swing..."
                    className="w-full bg-input/50 border border-border-secondary rounded-xl px-4 py-3 text-text-primary placeholder:text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="btn btn-secondary bg-transparent border-border-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="btn btn-primary"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
