"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

      // Fetch all required symbols via batch API
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: uniqueSymbols.map(s => ({ symbol: s.symbol, exchange: s.exchange || "NSE" }))
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch quotes");
      const quotesMap = await res.json();
      
      const allQuotes = new Map<string, any>();
      for (const [key, quote] of Object.entries(quotesMap)) {
        allQuotes.set(key, quote);
      }

      // Calculate P&L for each open position
      const pnlMap = new Map<string, LivePnl>();

      for (const pos of positions) {
        const quote = allQuotes.get(`${pos.symbol}:${pos.exchange}`);
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

  // Ensure stale positions are removed immediately when openPositions changes
  // and trigger a fetch if there are new positions we don't have prices for.
  useEffect(() => {
    let needsFetch = false;
    
    // Check if we need to fetch (do we have positions that aren't in livePnl yet?)
    setLivePnl(prev => {
      let changed = false;
      const next = new Map(prev);
      
      // Remove stale
      for (const key of Array.from(next.keys())) {
        if (!openPositions.find(p => p.id === key)) {
          next.delete(key);
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    // Check for new positions that aren't in the current livePnl state
    // We can just look at livePnl because it's a dependency of this hook?
    // Wait, no, we shouldn't add livePnl to deps. 
    // We can just check if any openPosition is missing from the Map.
    // However, since we can't reliably read the latest livePnl here without putting it in deps,
    // let's just trigger a fetch if we don't have a lastUpdated OR if openPositions has changed
    // since the last fetch.
    // Actually, just fetchPrices() whenever openPositions changes and we have at least 1 open position!
    if (openPositions.length > 0) {
      fetchPrices();
    }
  }, [openPositions, fetchPrices]);

  return { livePnl, loading, lastUpdated, refresh: fetchPrices };
}
