"use client";
import React from 'react';
import { Check, X } from 'lucide-react';
import './SpreadsheetComparison.css';

const COMPARISON_ROWS = [
  {
    feature: "R-Multiple & Risk Sizing",
    excel: "Manual formulas, prone to calculation errors",
    excelGood: false,
    traderlabs: "Automated R-Multiple calculation on every single trade",
    traderlabsGood: true,
  },
  {
    feature: "P&L Visual Heatmap Calendar",
    excel: "Cumbersome pivot charts; difficult to maintain",
    excelGood: false,
    traderlabs: "Interactive color-coded daily and monthly calendar view",
    traderlabsGood: true,
  },
  {
    feature: "Psychology & Mistake Vault",
    excel: "Scattered text comments with zero pattern analytics",
    excelGood: false,
    traderlabs: "Quantifies exact monetary leak from FOMO, revenge & sizing errors",
    traderlabsGood: true,
  },
  {
    feature: "Execution Logging Speed",
    excel: "Slow (3-5 minutes per entry), leading to abandoned journals",
    excelGood: false,
    traderlabs: "Lightning fast (<15s) with one-click CSV broker imports",
    traderlabsGood: true,
  },
  {
    feature: "Dynamic Position Sizing Planner",
    excel: "Requires mental math or separate unlinked calculators",
    excelGood: false,
    traderlabs: "Auto-calculates exact quantity based on conviction and stop-loss",
    traderlabsGood: true,
  },
  {
    feature: "Verified Public Performance Snapshots",
    excel: "Screenshots can be edited or fabricated; zero credibility",
    excelGood: false,
    traderlabs: "Cryptographically verified SHA-256 public links to prove edge",
    traderlabsGood: true,
  },
];

export default function SpreadsheetComparison() {
  return (
    <section className="comparison section" aria-label="Excel vs TraderLabs Comparison" id="comparison">
      <div className="container comparison__container">
        <div className="comparison__header">
          <span className="section-label">Spreadsheet vs Modern Journal</span>
          <h2 className="comparison__title">
            Why Indian Traders are Leaving Excel for TraderLabs
          </h2>
          <p className="comparison__sub">
            Spreadsheets break formulas, hide emotional leaks, and take too much time to maintain. 
            TraderLabs transforms manual trade logging into automated performance analytics.
          </p>
        </div>

        <div className="comparison__table-wrapper">
          <table className="comparison__table">
            <caption className="sr-only">Comparison of Traditional Spreadsheets vs TraderLabs Trading Journal</caption>
            <thead>
              <tr>
                <th scope="col" className="col-feature font-mono">CAPABILITY</th>
                <th scope="col" className="col-excel font-mono">TRADITIONAL EXCEL / SHEETS</th>
                <th scope="col" className="col-traderlabs font-mono">TRADERLABS JOURNAL</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="comparison__row">
                  <td className="cell-feature font-mono">{row.feature}</td>
                  <td className="cell-excel">
                    <div className="comparison__cell-content">
                      <span className="comparison__icon icon-cross" aria-hidden="true">
                        <X size={15} />
                      </span>
                      <span>{row.excel}</span>
                    </div>
                  </td>
                  <td className="cell-traderlabs">
                    <div className="comparison__cell-content">
                      <span className="comparison__icon icon-check" aria-hidden="true">
                        <Check size={15} />
                      </span>
                      <span>{row.traderlabs}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
