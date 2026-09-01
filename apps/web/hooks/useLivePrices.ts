"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockQuote } from "@/lib/finance";

interface UseLivePricesResult {
  prices: Map<string, StockQuote>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

/**
 * Hook to fetch and auto-refresh live stock prices from our API
 * which proxies Yahoo Finance data.
 */
export function useLivePrices(
  symbols: Array<{ symbol: string; exchange: string }>,
  refreshInterval: number = 60000 // 1 minute default
): UseLivePricesResult {
  const [prices, setPrices] = useState<Map<string, StockQuote>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Group by exchange to minimize API calls
      const byExchange = new Map<string, string[]>();
      for (const { symbol, exchange } of symbols) {
        const exch = exchange || "NSE";
        if (!byExchange.has(exch)) byExchange.set(exch, []);
        byExchange.get(exch)!.push(symbol);
      }

      const allPrices = new Map<string, StockQuote>();

      for (const [exchange, syms] of byExchange) {
        const res = await fetch(
          `/api/quotes?symbols=${syms.join(",")}&exchange=${exchange}`
        );

        if (!res.ok) {
          console.warn(`Failed to fetch quotes for ${exchange}: ${res.status}`);
          continue;
        }

        const data = await res.json();

        // Single symbol returns a direct quote object
        if (syms.length === 1 && data.symbol) {
          allPrices.set(`${data.symbol}:${exchange}`, data);
        } else {
          // Multiple symbols returns a map
          for (const [key, quote] of Object.entries(data)) {
            allPrices.set(key, quote as StockQuote);
          }
        }
      }

      setPrices(allPrices);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchPrices();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrices, refreshInterval]);

  return { prices, loading, error, refresh: fetchPrices, lastUpdated };
}
