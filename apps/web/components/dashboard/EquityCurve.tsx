"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface EquityCurveProps {
  data: Array<{ date: string; equity: number }>;
}

export default function EquityCurve({ data }: EquityCurveProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.15)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.01)");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((d) => {
          const date = new Date(d.date);
          return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        }),
        datasets: [
          {
            label: "Equity",
            data: data.map((d) => d.equity),
            borderColor: "#6366F1",
            backgroundColor: gradient,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#6366F1",
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0F1629",
            titleColor: "#94A3B8",
            bodyColor: "#fff",
            titleFont: { size: 11, family: "Inter" },
            bodyFont: { size: 13, family: "JetBrains Mono", weight: "bold" },
            padding: { top: 8, bottom: 8, left: 12, right: 12 },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y;
                return `₹${(val ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10, family: "Inter" },
              color: "#94A3B8",
              maxRotation: 0,
            },
            border: { display: false },
          },
          y: {
            grid: {
              color: "rgba(226, 232, 240, 0.5)",
            },
            ticks: {
              font: { size: 10, family: "JetBrains Mono" },
              color: "#94A3B8",
              callback: (val) => `₹${Number(val).toLocaleString("en-IN")}`,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [data]);

  return (
    <div className="card" id="equity-curve">
      <div className="card-header">
        <span className="card-title">Equity Curve</span>
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm" style={{ fontSize: "var(--text-xs)" }}>
            Daily
          </button>
        </div>
      </div>
      <div className="card-body">
        {data.length > 0 ? (
          <div className="chart-container">
            <canvas ref={chartRef} />
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "var(--space-8)" }}>
            <p className="text-muted">No trade data yet. Import or add trades to see your equity curve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
