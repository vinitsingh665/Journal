import type { StockQuote } from "@/lib/finance";

interface CacheEntry {
  quote: StockQuote;
  timestamp: number;
}

// Global in-memory cache shared across all React components in the browser session
const quoteMemoryCache = new Map<string, CacheEntry>();

// Cache TTL: 120 seconds (2 minutes). Inside this window, 0 network requests are made.
const CACHE_TTL_MS = 120 * 1000;

// Batch buffer for collecting requests that occur within the same event loop tick (e.g. component mounts)
let batchQueue: Array<{
  symbol: string;
  exchange: string;
  resolve: (quote: StockQuote | null) => void;
  reject: (err: any) => void;
}> = [];

let batchTimer: ReturnType<typeof setTimeout> | null = null;

function processBatchQueue() {
  const currentBatch = batchQueue;
  batchQueue = [];
  batchTimer = null;

  if (currentBatch.length === 0) return;

  // Deduplicate symbols to fetch
  const uniqueMap = new Map<string, { symbol: string; exchange: string }>();
  for (const item of currentBatch) {
    const key = `${item.symbol.toUpperCase()}:${item.exchange.toUpperCase()}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, { symbol: item.symbol, exchange: item.exchange });
    }
  }

  const symbolsPayload = Array.from(uniqueMap.values());

  fetch("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbols: symbolsPayload }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Quotes fetch failed: ${res.status}`);
      const data: Record<string, StockQuote> = await res.json();
      const now = Date.now();

      // Store in memory cache
      for (const [key, quote] of Object.entries(data)) {
        if (quote && typeof quote === "object") {
          const upperKey = key.toUpperCase();
          quoteMemoryCache.set(upperKey, { quote, timestamp: now });
          const rawSymbol = upperKey.split(":")[0];
          quoteMemoryCache.set(rawSymbol, { quote, timestamp: now });
        }
      }

      // Resolve all waiting callers
      for (const item of currentBatch) {
        const fullKey = `${item.symbol.toUpperCase()}:${item.exchange.toUpperCase()}`;
        const quote = data[fullKey] || data[item.symbol.toUpperCase()] || null;
        item.resolve(quote);
      }
    })
    .catch((err) => {
      console.warn("[client-quotes] Batch fetch error:", err);
      // Resolve with null or stale cached data instead of hard rejection to prevent UI crashes
      for (const item of currentBatch) {
        const fullKey = `${item.symbol.toUpperCase()}:${item.exchange.toUpperCase()}`;
        const stale = quoteMemoryCache.get(fullKey)?.quote || null;
        item.resolve(stale);
      }
    });
}

/**
 * Fetch quotes for multiple symbols with automatic client-side deduplication,
 * tick-level batching, and 2-minute memory caching.
 */
export async function fetchQuotesCached(
  symbols: Array<{ symbol: string; exchange?: string }>
): Promise<Map<string, StockQuote>> {
  const resultMap = new Map<string, StockQuote>();
  if (!symbols || symbols.length === 0) return resultMap;

  const now = Date.now();
  const toFetch: Array<{ symbol: string; exchange: string }> = [];

  for (const s of symbols) {
    const exch = (s.exchange || "NSE").toUpperCase();
    const sym = s.symbol.toUpperCase();
    const key = `${sym}:${exch}`;

    const cached = quoteMemoryCache.get(key);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      resultMap.set(key, cached.quote);
      resultMap.set(sym, cached.quote);
    } else {
      toFetch.push({ symbol: s.symbol, exchange: s.exchange || "NSE" });
    }
  }

  // All symbols found fresh in cache — 0 network requests!
  if (toFetch.length === 0) {
    return resultMap;
  }

  // If the browser tab is hidden, don't execute network fetches in the background
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return resultMap;
  }

  // Enqueue remaining symbols into the micro-batch pool
  const fetchPromises = toFetch.map(
    ({ symbol, exchange }) =>
      new Promise<{ key: string; quote: StockQuote | null }>((resolve, reject) => {
        batchQueue.push({
          symbol,
          exchange,
          resolve: (quote) =>
            resolve({
              key: `${symbol.toUpperCase()}:${(exchange || "NSE").toUpperCase()}`,
              quote,
            }),
          reject,
        });
      })
  );

  // Schedule batch execution on the next event loop tick (5ms buffer to coalesce mounts)
  if (!batchTimer) {
    batchTimer = setTimeout(processBatchQueue, 10);
  }

  const results = await Promise.all(fetchPromises);
  for (const { key, quote } of results) {
    if (quote) {
      resultMap.set(key, quote);
      resultMap.set(key.split(":")[0], quote);
    }
  }

  return resultMap;
}
