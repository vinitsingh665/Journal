/**
 * Yahoo Finance Price Fetcher
 * Fetches real-time/delayed stock prices for Indian NSE/BSE stocks
 */

export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  currency: string;
  exchangeName: string;
  lastUpdated: string;
}

/**
 * Convert a raw symbol like "RELIANCE" to Yahoo Finance format "RELIANCE.NS"
 */
export function toYahooSymbol(symbol: string, exchange: string = "NSE"): string {
  // Already has suffix or is a FOREX symbol (e.g. USDINR=X)
  if (symbol.includes(".") || symbol.includes("=")) return symbol;
  
  const ex = exchange.toUpperCase();
  
  if (ex === "NASDAQ" || ex === "NYSE" || ex === "FOREX") return symbol;
  
  if (ex === "CRYPTO") {
    let base = symbol;
    if (base.endsWith("USDT")) {
      base = base.replace("USDT", "");
    } else if (base.endsWith("USD")) {
      base = base.replace("USD", "");
    }
    return `${base}-USD`;
  }
  
  const suffix = ex === "BSE" ? ".BO" : ".NS";
  return `${symbol}${suffix}`;
}

/**
 * Fetch a single stock quote from Yahoo Finance
 */
export async function fetchStockQuote(
  symbol: string,
  exchange: string = "NSE",
  targetCurrency?: string
): Promise<StockQuote | null> {
  try {
    const yahooSymbol = toYahooSymbol(symbol, exchange);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    let quote = {
      symbol,
      regularMarketPrice: meta.regularMarketPrice ?? 0,
      regularMarketChange:
        (meta.regularMarketPrice ?? 0) - (meta.chartPreviousClose ?? meta.previousClose ?? 0),
      regularMarketChangePercent:
        meta.chartPreviousClose || meta.previousClose
          ? (((meta.regularMarketPrice ?? 0) - (meta.chartPreviousClose ?? meta.previousClose)) /
              (meta.chartPreviousClose ?? meta.previousClose)) *
            100
          : 0,
      regularMarketPreviousClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
      regularMarketOpen: meta.regularMarketOpen ?? 0,
      regularMarketDayHigh: meta.regularMarketDayHigh ?? 0,
      regularMarketDayLow: meta.regularMarketDayLow ?? 0,
      regularMarketVolume: meta.regularMarketVolume ?? 0,
      currency: meta.currency ?? "INR",
      exchangeName: meta.exchangeName ?? exchange,
      lastUpdated: new Date().toISOString(),
    };

    if (targetCurrency && quote.currency && quote.currency !== targetCurrency) {
      try {
        const rateSymbol = `${quote.currency}${targetCurrency}=X`;
        const rateUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${rateSymbol}?interval=1d&range=1d`;
        const rateRes = await fetch(rateUrl, { next: { revalidate: 3600 } });
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          const rate = rateData?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (rate) {
            quote.regularMarketPrice *= rate;
            quote.regularMarketChange *= rate;
            quote.regularMarketPreviousClose *= rate;
            quote.regularMarketOpen *= rate;
            quote.regularMarketDayHigh *= rate;
            quote.regularMarketDayLow *= rate;
            quote.currency = targetCurrency;
          }
        }
      } catch (e) {
        console.error("Failed to fetch exchange rate for quote:", e);
      }
    }

    return quote;
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols in batch
 */
export async function fetchMultipleQuotes(
  symbols: Array<{ symbol: string; exchange: string }>,
  targetCurrency?: string
): Promise<Map<string, StockQuote>> {
  const results = new Map<string, StockQuote>();

  // Fetch in parallel with max concurrency of 5
  const chunks = [];
  for (let i = 0; i < symbols.length; i += 5) {
    chunks.push(symbols.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async ({ symbol, exchange }) => {
      const quote = await fetchStockQuote(symbol, exchange, targetCurrency);
      if (quote) {
        results.set(`${symbol}:${exchange}`, quote);
      }
    });
    await Promise.all(promises);
  }

  return results;
}

/**
 * Calculate unrealized P&L for an open position
 */
export function calculateUnrealizedPnl(
  avgEntryPrice: number,
  currentPrice: number,
  quantity: number,
  direction: "LONG" | "SHORT"
): { pnl: number; pnlPercent: number } {
  const investment = avgEntryPrice * quantity;
  let pnl: number;

  if (direction === "LONG") {
    pnl = (currentPrice - avgEntryPrice) * quantity;
  } else {
    pnl = (avgEntryPrice - currentPrice) * quantity;
  }

  const pnlPercent = investment > 0 ? (pnl / investment) * 100 : 0;

  return { pnl, pnlPercent };
}
