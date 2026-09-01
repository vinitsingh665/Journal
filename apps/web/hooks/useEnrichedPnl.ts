"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface OpenPosition {
  symbol: string;
  exchange: string;
  direction: string;
  avgEntryPrice: number;
  totalBuyQty: number;
  totalSellQty: number;
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
 * and calculates unrealized P&L — replacing the old server-side blocking approach.
 *
 * Returns a Map keyed by "symbol:exchange" with live P&L data.
 */
export function useEnrichedPnl(
  openPositions: OpenPosition[],
  refreshInterval: number = 60000
) {
  const [livePnl, setLivePnl] = useState<Map<string, LivePnl>>(new Map());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Stable reference to avoid re-fetching on every render
  const positionsRef = useRef(openPositions);
  positionsRef.current = openPositions;

  const fetchPrices = useCallback(async () => {
    const positions = positionsRef.current;
    if (positions.length === 0) return;

    setLoading(true);
    try {
      // Deduplicate symbols
      const uniqueMap = new Map<string, OpenPosition>();
      for (const p of positions) {
        uniqueMap.set(`${p.symbol}:${p.exchange}`, p);
      }
      const uniqueSymbols = Array.from(uniqueMap.values());

      // Group by exchange for the API
      const byExchange = new Map<string, string[]>();
      for (const { symbol, exchange } of uniqueSymbols) {
        const exch = exchange || "NSE";
        if (!byExchange.has(exch)) byExchange.set(exch, []);
        byExchange.get(exch)!.push(symbol);
      }

      // Fetch all exchanges in parallel
      const allQuotes = new Map<string, any>();
      const fetchPromises = Array.from(byExchange.entries()).map(
        async ([exchange, syms]) => {
          try {
            const res = await fetch(
              `/api/quotes?symbols=${syms.join(",")}&exchange=${exchange}`
            );
            if (!res.ok) return;
            const data = await res.json();

            if (syms.length === 1 && data.symbol) {
              allQuotes.set(`${data.symbol}:${exchange}`, data);
            } else {
              for (const [key, quote] of Object.entries(data)) {
                allQuotes.set(key, quote);
              }
            }
          } catch (e) {
            console.warn(`Failed to fetch quotes for ${exchange}:`, e);
          }
        }
      );

      await Promise.all(fetchPromises);

      // Calculate P&L for each open position
      const pnlMap = new Map<string, LivePnl>();

      for (const pos of positions) {
        const key = `${pos.symbol}:${pos.exchange}`;
        const quote = allQuotes.get(key);
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

        pnlMap.set(key, {
          netPnl: pnl,
          grossPnl: pnl,
          pnlPercentage: pnlPercent,
          todayPnl,
          currentPrice,
        });
      }

      setLivePnl(pnlMap);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("useEnrichedPnl: Failed to fetch prices:", e);
    } finally {
      setLoading(false);
    }
  }, []); // No deps — uses ref

  useEffect(() => {
    fetchPrices();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPrices, refreshInterval]);

  return { livePnl, loading, lastUpdated, refresh: fetchPrices };
}
