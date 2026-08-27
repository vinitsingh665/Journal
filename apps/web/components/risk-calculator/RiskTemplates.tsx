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
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"></path><path d="M12 22v-9"></path><path d="M8 12h8"></path></svg>
        <h3 className="font-bold text-sm tracking-wide text-secondary">SAVED TEMPLATES</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-surface border border-border-secondary rounded-2xl p-4 flex flex-col justify-between group transition-all hover:border-primary/50 hover:shadow-lg aspect-square relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-text-primary text-sm line-clamp-2 leading-tight">{t.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); actions.deleteTemplate(t.id); }}
                className="text-muted hover:text-negative transition-colors opacity-0 group-hover:opacity-100 absolute top-3 right-3 bg-surface/80 rounded-full p-1"
                title="Delete Template"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Capital</span>
                <strong className="text-text-primary text-xs truncate">{formatINR(t.capital)}</strong>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Risk</span>
                  <strong className="text-text-primary text-xs">{t.defaultTradeRiskPct}%</strong>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Win</span>
                  <strong className="text-text-primary text-xs">{t.winRatePct}%</strong>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => actions.loadTemplate(t.id)}
              className="w-full py-1.5 text-xs font-semibold rounded bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Calculate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
