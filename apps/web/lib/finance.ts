/**
 * Central Finance API Wrapper
 * 
 * This file serves as the single source of truth for financial data fetching in the app.
 * It currently routes to `tradingview-finance.ts` for lightning-fast price fetching.
 * If you ever need to fallback to Yahoo Finance, simply change the import below
 * from "./tradingview-finance" to "./yahoo-finance".
 */

// CHANGE THIS IMPORT TO SWAP DATA PROVIDERS:
import { fetchStockQuote, fetchMultipleQuotes, calculateUnrealizedPnl } from "./tradingview-finance";

// Re-export the types so other files can use them
export type { StockQuote } from "./yahoo-finance";

// Re-export the functions
export { fetchStockQuote, fetchMultipleQuotes, calculateUnrealizedPnl };
