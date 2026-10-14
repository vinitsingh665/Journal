"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchQuotesCached } from "@/lib/client-quotes";

interface OpenPosition {
  id: string;
  symbol: string;
  exchange: string;
  direction: string;
  avgEntryPrice: number;
  totalBuyQty: number;
  totalSellQty: number;
  entryTime?: Date | string;
}

interface LivePnl {
  netPnl: number;
  grossPnl: number;
  pnlPercentage: number;
  todayPnl: number;
  currentPrice: number;
}

/**
 * Client-side hook that fetches live prices for open positions
 * and calculates unrealized P&L using shared cached batch quotes.
 *
 * Defaults to a 2-minute (120s) refresh interval and pauses when tab is hidden.
 */
export function useEnrichedPnl(
  openPositions: OpenPosition[],
  refreshInterval: number = 120000
) {
  const [livePnl, setLivePnl] = useState<Map<string, LivePnl>>(new Map());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Stable reference to avoid re-fetching on every render
  const positionsRef = useRef(openPositions);
  positionsRef.current = openPositions;

  const lastFetchTimeRef = useRef<number>(0);

  const fetchPrices = useCallback(async (force = false) => {
    const positions = positionsRef.current;
    if (positions.length === 0) return;

    // Do not poll if the browser tab is hidden in the background
    if (typeof document !== "undefined" && document.visibilityState === "hidden" && !force) {
      return;
    }

    setLoading(true);
    try {
      // Deduplicate symbols
      const uniqueMap = new Map<string, OpenPosition>();
      for (const p of positions) {
        uniqueMap.set(`${p.symbol}:${p.exchange || "NSE"}`, p);
      }
      const uniqueSymbols = Array.from(uniqueMap.values());

      // Fetch all required symbols via shared client deduplicated cache
      const allQuotes = await fetchQuotesCached(
        uniqueSymbols.map((s) => ({ symbol: s.symbol, exchange: s.exchange || "NSE" }))
      );

      // Calculate P&L for each open position
      const pnlMap = new Map<string, LivePnl>();

      for (const pos of positions) {
        const fullKey = `${pos.symbol.toUpperCase()}:${(pos.exchange || "NSE").toUpperCase()}`;
        const quote = allQuotes.get(fullKey) || allQuotes.get(pos.symbol.toUpperCase());
        if (!quote) continue;

        const openQty = pos.totalBuyQty - pos.totalSellQty;
        if (openQty <= 0) continue;

        const currentPrice = quote.regularMarketPrice || 0;
        const investment = pos.avgEntryPrice * openQty;

        let pnl: number;
        if (pos.direction === "LONG") {
          pnl = (currentPrice - pos.avgEntryPrice) * openQty;
        } else {
          pnl = (pos.avgEntryPrice - currentPrice) * openQty;
        }
        const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;

        // Today's P&L from market change
        const todayPriceChange = quote.regularMarketChange || 0;
        let todayPnl = todayPriceChange * openQty;
        if (pos.direction === "SHORT") {
          todayPnl = -todayPnl;
        }

        // If the position was opened today, Today's P&L is exactly the Total P&L
        if (pos.entryTime) {
          const entryDate = new Date(pos.entryTime);
          const today = new Date();
          if (
            entryDate.getDate() === today.getDate() &&
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getFullYear() === today.getFullYear()
          ) {
            todayPnl = pnl;
          }
        }

        pnlMap.set(pos.id, {
          netPnl: pnl,
          grossPnl: pnl,
          pnlPercentage: pnlPercent,
          todayPnl,
          currentPrice,
        });
      }

      setLivePnl(pnlMap);
      setLastUpdated(new Date());
      lastFetchTimeRef.current = Date.now();
    } catch (e) {
      console.error("useEnrichedPnl: Failed to fetch prices:", e);
    } finally {
      setLoading(false);
    }
  }, []); // No deps — uses ref

  useEffect(() => {
    // Initial fetch on mount
    fetchPrices();

    // Periodic polling only if interval > 0
    let interval: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      interval = setInterval(() => {
        fetchPrices();
      }, refreshInterval);
    }

    // Refresh immediately when returning to the tab if stale (> 60s since last fetch)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const timeSince = Date.now() - lastFetchTimeRef.current;
        if (timeSince > 60000) {
          fetchPrices(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchPrices, refreshInterval]);

  // Clean up stale positions when openPositions changes without triggering extra network calls
  useEffect(() => {
    setLivePnl((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const key of Array.from(next.keys())) {
        if (!openPositions.find((p) => p.id === key)) {
          next.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [openPositions]);

  return { livePnl, loading, lastUpdated, refresh: () => fetchPrices(true) };
}
