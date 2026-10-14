"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { StockQuote } from "@/lib/finance";
import { fetchQuotesCached } from "@/lib/client-quotes";

interface UseLivePricesResult {
  prices: Map<string, StockQuote>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

/**
 * Hook to fetch and auto-refresh live stock prices using shared cached batch quotes.
 * Defaults to 120s interval and pauses when tab is hidden.
 */
export function useLivePrices(
  symbols: Array<{ symbol: string; exchange: string }>,
  refreshInterval: number = 120000 // 2 minutes default
): UseLivePricesResult {
  const [prices, setPrices] = useState<Map<string, StockQuote>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const symbolsRef = useRef(symbols);
  symbolsRef.current = symbols;

  const fetchPrices = useCallback(async (force = false) => {
    const currentSymbols = symbolsRef.current;
    if (currentSymbols.length === 0) return;

    if (typeof document !== "undefined" && document.visibilityState === "hidden" && !force) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allPrices = await fetchQuotesCached(currentSymbols);
      setPrices(allPrices);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();

    let interval: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      interval = setInterval(() => {
        fetchPrices();
      }, refreshInterval);
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchPrices(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchPrices, refreshInterval]);

  return { prices, loading, error, refresh: () => fetchPrices(true), lastUpdated };
}
