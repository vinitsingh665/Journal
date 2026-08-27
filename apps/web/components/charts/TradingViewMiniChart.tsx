"use client";

import { useEffect, useRef } from "react";

interface TradingViewMiniChartProps {
  symbol: string;
  exchange?: string;
  height?: number;
  width?: string;
}

/**
 * Compact mini chart widget from TradingView — used in position cards and trade lists.
 */
export default function TradingViewMiniChart({
  symbol,
  exchange = "NSE",
  height = 160,
  width = "100%",
}: TradingViewMiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const tvSymbol = `${exchange.toUpperCase()}:${symbol.toUpperCase()}`;

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = `${height}px`;
    widgetContainer.style.width = width;

    const widgetInner = document.createElement("div");
    widgetInner.className = "tradingview-widget-container__widget";
    widgetContainer.appendChild(widgetInner);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: tvSymbol,
      width: "100%",
      height: height,
      locale: "en",
      dateRange: "1M",
      colorTheme: "light",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      noTimeScale: false,
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, exchange, height, width]);

  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        width,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    />
  );
}
