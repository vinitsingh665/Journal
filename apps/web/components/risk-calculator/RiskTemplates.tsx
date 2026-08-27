import React from "react";
import { formatINR } from "@/lib/utils";
import { RiskTemplate } from "./useRiskEngine";

interface RiskTemplatesProps {
  templates: RiskTemplate[];
  actions: any;
}

export function RiskTemplates({ templates, actions }: RiskTemplatesProps) {
  if (!templates || templates.length === 0) return null;

  return (
    <div className="card card-body mb-4">
      <div className="flex items-center gap-2 mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"></path><path d="M12 22v-9"></path><path d="M8 12h8"></path></svg>
        <h3 className="font-bold text-sm tracking-wide">SAVED TEMPLATES</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-input/50 border border-border-secondary rounded-lg p-4 flex justify-between items-center group transition-colors hover:border-primary/30">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-text-primary text-sm truncate">{t.name}</span>
              </div>
              <div className="text-xs text-muted flex items-center gap-2 flex-wrap">
                <span>Cap: <strong className="text-text-primary">{formatINR(t.capital)}</strong></span>
                <span>•</span>
                <span>Risk: <strong className="text-text-primary">{t.defaultTradeRiskPct}%</strong></span>
                <span>•</span>
                <span>Win Rate: <strong className="text-text-primary">{t.winRatePct}%</strong></span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => actions.loadTemplate(t.id)}
                className="btn btn-primary px-3 py-1.5 text-xs h-auto"
              >
                Calculate Risk
              </button>
              <button 
                onClick={() => actions.deleteTemplate(t.id)}
                className="p-1.5 text-muted hover:text-negative hover:bg-negative/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Template"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
