import { StockQuote } from "./yahoo-finance";

/**
 * Map an exchange to the correct TradingView scanner region
 */
function getScannerRegion(exchange: string): string {
  const upper = exchange.toUpperCase();
  if (upper === "NSE" || upper === "BSE") return "india";
  if (upper === "CRYPTO" || upper === "BINANCE") return "crypto";
  if (upper === "FOREX" || upper === "FX") return "forex";
  return "america"; // Default to america for NYSE, NASDAQ, AMEX, etc
}

/**
 * Format symbol for TradingView (e.g. RELIANCE, NSE -> NSE:RELIANCE)
 */
export function toTradingViewSymbol(symbol: string, exchange: string = "NSE"): string {
  // If the symbol already includes a colon, assume it's fully formatted
  if (symbol.includes(":")) return symbol;

  const upperExchange = exchange.toUpperCase();

  // For Crypto, TradingView usually expects exchanges like BINANCE
  if (upperExchange === "CRYPTO") {
    return `BINANCE:${symbol.toUpperCase()}`;
  }

  // Fallback default
  return `${upperExchange}:${symbol.toUpperCase()}`;
}

/**
 * Fetch a single stock quote from TradingView Scanner API
 */
export async function fetchStockQuote(
  symbol: string,
  exchange: string = "NSE",
  targetCurrency?: string
): Promise<StockQuote | null> {
  try {
    const quotes = await fetchMultipleQuotes([{ symbol, exchange }], targetCurrency);
    const key = `${symbol}:${exchange}`;
    return quotes.get(key) || null;
  } catch (error) {
    console.error(`Failed to fetch TV quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols in batch from TradingView Scanner API
 */
export async function fetchMultipleQuotes(
  symbols: Array<{ symbol: string; exchange: string }>,
  targetCurrency?: string
): Promise<Map<string, StockQuote>> {
  const results = new Map<string, StockQuote>();
  if (symbols.length === 0) return results;

  // Group by region
  const regionGroups = new Map<string, Array<{ symbol: string; exchange: string }>>();
  
  for (const s of symbols) {
    const region = getScannerRegion(s.exchange);
    if (!regionGroups.has(region)) regionGroups.set(region, []);
    regionGroups.get(region)!.push(s);
  }

  // Fetch for each region in parallel
  const fetchPromises = Array.from(regionGroups.entries()).map(async ([region, syms]) => {
    try {
      const tickers = syms.map(s => toTradingViewSymbol(s.symbol, s.exchange));
      
      const body = {
        symbols: { tickers },
        columns: ["close", "change_abs", "change", "open", "high", "low", "volume", "currency"]
      };

      const res = await fetch(`https://scanner.tradingview.com/${region}/scan`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 } // Cache for 60 seconds similar to Yahoo
      });

      if (!res.ok) {
        throw new Error(`TV API failed with status ${res.status}`);
      }

      const data = await res.json();
      
      // Parse results
      if (data && data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          const tvTicker = item.s; // e.g. "NSE:RELIANCE"
          const [parsedExchange, parsedSymbol] = tvTicker.split(":");
          const d = item.d; // [close, change_abs, change, open, high, low, volume, currency]

          // Find the original request symbol/exchange mapping
          // Because CRYPTO uses BINANCE as exchange prefix, we need to match carefully
          const originalReq = syms.find(s => 
            s.symbol.toUpperCase() === parsedSymbol && 
            (s.exchange.toUpperCase() === parsedExchange || 
             (s.exchange.toUpperCase() === "CRYPTO" && parsedExchange === "BINANCE"))
          );

          if (originalReq && d && d.length >= 7) {
            const quote: StockQuote = {
              symbol: originalReq.symbol,
              exchangeName: originalReq.exchange,
              regularMarketPrice: d[0] || 0,
              regularMarketChange: d[1] || 0,
              regularMarketChangePercent: d[2] || 0,
              regularMarketOpen: d[3] || 0,
              regularMarketDayHigh: d[4] || 0,
              regularMarketDayLow: d[5] || 0,
              regularMarketVolume: d[6] || 0,
              regularMarketPreviousClose: (d[0] || 0) - (d[1] || 0), // Calculate previous close
              currency: d[7] || (region === "india" ? "INR" : "USD"),
              lastUpdated: new Date().toISOString()
            };

            // Convert currency if requested (Implementation simplified for now, assuming base app currency matches market)
            // You can implement forex conversion here if needed just like in yahoo-finance
            
            results.set(`${originalReq.symbol}:${originalReq.exchange}`, quote);
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch region ${region}:`, e);
    }
  });

  await Promise.all(fetchPromises);
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
  if (investment === 0) return { pnl: 0, pnlPercent: 0 };

  const pnl = direction === "LONG" 
    ? (currentPrice - avgEntryPrice) * quantity 
    : (avgEntryPrice - currentPrice) * quantity;
    
  return { pnl, pnlPercent: pnl / investment };
}
