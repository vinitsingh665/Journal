"use client";

import { useRef, useEffect, useState } from "react";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MiniCandleChartProps {
  candles: Candle[];
  entryPrice: number;
  entryTime?: number; // epoch ms — to place the entry arrow on the correct candle
  exitTime?: number;  // epoch ms — to place exit arrow (if closed)
  currentPrice?: number;
  height?: number;
}

export default function MiniCandleChart({
  candles,
  entryPrice,
  entryTime,
  exitTime,
  currentPrice,
  height = 120,
}: MiniCandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    setContainerWidth(container.clientWidth);

    return () => observer.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0 || containerWidth === 0) return;

    const width = containerWidth;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Layout
    const padding = { top: 12, bottom: 6, left: 2, right: 42 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Price range
    let priceMin = Infinity;
    let priceMax = -Infinity;

    for (const c of candles) {
      if (c.low < priceMin) priceMin = c.low;
      if (c.high > priceMax) priceMax = c.high;
    }

    // Include entry & current price in range
    if (entryPrice < priceMin) priceMin = entryPrice;
    if (entryPrice > priceMax) priceMax = entryPrice;
    if (currentPrice !== undefined) {
      if (currentPrice < priceMin) priceMin = currentPrice;
      if (currentPrice > priceMax) priceMax = currentPrice;
    }

    // Add vertical breathing room
    const priceRange = priceMax - priceMin;
    priceMin -= priceRange * 0.08;
    priceMax += priceRange * 0.08;
    const totalPriceRange = priceMax - priceMin;
    if (totalPriceRange === 0) return;

    const priceToY = (price: number) =>
      padding.top + chartH - ((price - priceMin) / totalPriceRange) * chartH;

    const candleCount = candles.length;
    const totalSlotWidth = chartW / candleCount;
    const candleWidth = Math.max(2, Math.min(7, totalSlotWidth * 0.65));
    const gap = totalSlotWidth - candleWidth;

    const candleX = (i: number) =>
      padding.left + i * totalSlotWidth + totalSlotWidth / 2;

    // Colors
    const bullColor = "#22C55E";
    const bearColor = "#EF4444";

    // --- Draw candles ---
    for (let i = 0; i < candleCount; i++) {
      const c = candles[i];
      const x = candleX(i);
      const isBull = c.close >= c.open;
      const color = isBull ? bullColor : bearColor;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(c.high));
      ctx.lineTo(x, priceToY(c.low));
      ctx.stroke();

      // Body
      const bodyTop = priceToY(Math.max(c.open, c.close));
      const bodyBottom = priceToY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    }

    // --- Entry price dashed line ---
    const entryY = priceToY(entryPrice);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padding.left, entryY);
    ctx.lineTo(width - padding.right, entryY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Entry label on right axis
    ctx.fillStyle = "#6366F1";
    ctx.font = "bold 8px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(entryPrice.toFixed(1), width - padding.right + 3, entryY);

    // --- CMP dashed line ---
    if (currentPrice !== undefined) {
      const cmpY = priceToY(currentPrice);
      const cmpColor = currentPrice >= entryPrice ? bullColor : bearColor;

      ctx.strokeStyle = cmpColor + "80"; // 50% opacity
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(padding.left, cmpY);
      ctx.lineTo(width - padding.right, cmpY);
      ctx.stroke();
      ctx.setLineDash([]);

      // CMP label
      ctx.fillStyle = cmpColor;
      ctx.font = "bold 8px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(currentPrice.toFixed(1), width - padding.right + 3, cmpY);
    }

    // --- Find the candle index closest to a given timestamp ---
    const findCandleIndex = (targetMs: number): number => {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < candleCount; i++) {
        const dist = Math.abs(candles[i].time - targetMs);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    };

    // --- ENTRY ARROW: Blue upward arrow BELOW the candle ---
    if (entryTime) {
      const idx = findCandleIndex(entryTime);
      const c = candles[idx];
      const x = candleX(idx);
      const lowY = priceToY(c.low);
      const arrowTipY = lowY + 4; // 4px below the candle low
      const arrowH = 8;
      const arrowW = 5;

      ctx.fillStyle = "#3B82F6";
      ctx.beginPath();
      // Upward-pointing arrow (tip points up toward the candle)
      ctx.moveTo(x, arrowTipY);                         // tip
      ctx.lineTo(x - arrowW, arrowTipY + arrowH);       // bottom-left of head
      ctx.lineTo(x - arrowW * 0.35, arrowTipY + arrowH); // inner-left
      ctx.lineTo(x - arrowW * 0.35, arrowTipY + arrowH + 4); // stem bottom-left
      ctx.lineTo(x + arrowW * 0.35, arrowTipY + arrowH + 4); // stem bottom-right
      ctx.lineTo(x + arrowW * 0.35, arrowTipY + arrowH); // inner-right
      ctx.lineTo(x + arrowW, arrowTipY + arrowH);       // bottom-right of head
      ctx.closePath();
      ctx.fill();
    }

    // --- EXIT ARROW: Red downward arrow ABOVE the candle ---
    if (exitTime) {
      const idx = findCandleIndex(exitTime);
      const c = candles[idx];
      const x = candleX(idx);
      const highY = priceToY(c.high);
      const arrowTipY = highY - 4; // 4px above the candle high
      const arrowH = 8;
      const arrowW = 5;

      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      // Downward-pointing arrow (tip points down toward the candle)
      ctx.moveTo(x, arrowTipY);                          // tip
      ctx.lineTo(x - arrowW, arrowTipY - arrowH);        // top-left of head
      ctx.lineTo(x - arrowW * 0.35, arrowTipY - arrowH); // inner-left
      ctx.lineTo(x - arrowW * 0.35, arrowTipY - arrowH - 4); // stem top-left
      ctx.lineTo(x + arrowW * 0.35, arrowTipY - arrowH - 4); // stem top-right
      ctx.lineTo(x + arrowW * 0.35, arrowTipY - arrowH); // inner-right
      ctx.lineTo(x + arrowW, arrowTipY - arrowH);        // top-right of head
      ctx.closePath();
      ctx.fill();
    }
  }, [candles, entryPrice, entryTime, exitTime, currentPrice, containerWidth, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: `${height}px` }}>
      {containerWidth > 0 && (
        <canvas
          ref={canvasRef}
          style={{ display: "block" }}
        />
      )}
    </div>
  );
}
