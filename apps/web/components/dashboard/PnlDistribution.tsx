"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface PnlDistributionProps {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export default function PnlDistribution({
  totalTrades,
  winningTrades,
  losingTrades,
}: PnlDistributionProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const breakeven = totalTrades - winningTrades - losingTrades;

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Winning Trades", "Losing Trades", ...(breakeven > 0 ? ["Breakeven"] : [])],
        datasets: [
          {
            data: [winningTrades, losingTrades, ...(breakeven > 0 ? [breakeven] : [])],
            backgroundColor: [
              "#10B981",
              "#EF4444",
              ...(breakeven > 0 ? ["#94A3B8"] : []),
            ],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              font: { size: 11, family: "Inter" },
              color: "#64748B",
            },
          },
          tooltip: {
            backgroundColor: "#0F1629",
            titleColor: "#94A3B8",
            bodyColor: "#fff",
            titleFont: { size: 11, family: "Inter" },
            bodyFont: { size: 13, family: "Inter", weight: "bold" },
            padding: { top: 8, bottom: 8, left: 12, right: 12 },
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const pct = totalTrades > 0 ? ((ctx.parsed / totalTrades) * 100).toFixed(1) : 0;
                return ` ${ctx.parsed} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [totalTrades, winningTrades, losingTrades]);

  return (
    <div className="card" id="pnl-distribution">
      <div className="card-header">
        <span className="card-title">P&L Distribution</span>
      </div>
      <div className="card-body">
        {totalTrades > 0 ? (
          <div style={{ position: "relative" }}>
            <div className="chart-container">
              <canvas ref={chartRef} />
            </div>
            {/* Center text */}
            <div
              style={{
                position: "absolute",
                top: "42%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {totalTrades}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Trades</div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "var(--space-8)" }}>
            <p className="text-muted">No trades yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
