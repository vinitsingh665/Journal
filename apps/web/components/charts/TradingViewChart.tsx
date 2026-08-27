"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol: string;
  exchange?: string;
  height?: number;
  theme?: "light" | "dark";
  interval?: string;
}

/**
 * Embeds a TradingView Advanced Chart widget for the given NSE/BSE symbol.
 * Uses TradingView's free embeddable widget.
 */
export default function TradingViewChart({
  symbol,
  exchange = "NSE",
  height = 400,
  theme = "light",
  interval = "D",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // TradingView symbol format: NSE:RELIANCE or BSE:RELIANCE
    let tvExchange = exchange.toUpperCase();
    if (tvExchange === "CRYPTO") tvExchange = "BINANCE";
    const tvSymbol = `${tvExchange}:${symbol.toUpperCase()}`;

    // Create the widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = `${height}px`;
    widgetContainer.style.width = "100%";

    const widgetInner = document.createElement("div");
    widgetInner.className = "tradingview-widget-container__widget";
    widgetInner.style.height = `calc(${height}px - 32px)`;
    widgetInner.style.width = "100%";
    widgetContainer.appendChild(widgetInner);

    containerRef.current.appendChild(widgetContainer);

    // Load TradingView widget script
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: interval,
      timezone: "Asia/Kolkata",
      theme: theme,
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    widgetContainer.appendChild(script);
    scriptRef.current = script;

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, exchange, height, theme, interval]);

  return (
    <div
      ref={containerRef}
      style={{
        height: `${height}px`,
        width: "100%",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
      }}
    />
  );
}
