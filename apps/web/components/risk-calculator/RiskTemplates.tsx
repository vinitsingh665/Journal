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
      <div className="flex flex-col gap-5 w-full">
        {templates.map(t => (
          <div 
            key={t.id} 
            onClick={() => actions.loadTemplate(t.id)}
            className="card group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 relative overflow-hidden"
          >
            <div style={{ padding: '24px' }} className="flex flex-col gap-5 h-full w-full box-border">
              {/* Header: Icon + Title + Delete */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h4 className="font-semibold text-text-primary text-base line-clamp-1">{t.name}</h4>
              </div>
              <span 
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); actions.deleteTemplate(t.id); }}
                className="text-muted/40 hover:text-negative transition-colors p-1"
                title="Delete Template"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </span>
            </div>

            {/* Main Stat: Capital */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Trading Capital</p>
              <p className="text-2xl font-bold text-text-primary tracking-tight truncate">{formatINR(t.capital)}</p>
            </div>

            {/* Minor Stats: Pills */}
            <div className="flex gap-4 mt-2">
              <div className="flex-1 bg-background/50 border border-border-secondary/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase text-muted font-semibold mb-1">Risk</span>
                <span className="text-sm font-bold text-primary">{t.defaultTradeRiskPct}%</span>
              </div>
              <div className="flex-1 bg-background/50 border border-border-secondary/40 rounded-xl py-3 px-2 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase text-muted font-semibold mb-1">Win Rate</span>
                <span className="text-sm font-bold text-text-primary">{t.winRatePct}%</span>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
