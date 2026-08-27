import type {
  NormalizedExecution,
  MatchedTrade,
  ExecutionLeg,
  TradeDirection,
  TradeStatus,
} from "./types";

interface ExecutionWithId extends NormalizedExecution {
  id?: string;
}

/**
 * FIFO Trade Matcher
 * 
 * Groups executions by symbol, then matches buys with sells chronologically.
 * Supports partial entries/exits and creates proper trade records.
 */
export function matchExecutionsToTrades(
  executions: ExecutionWithId[]
): MatchedTrade[] {
  // Group by symbol
  const bySymbol = new Map<string, ExecutionWithId[]>();
  for (const exec of executions) {
    const key = `${exec.symbol}:${exec.exchange}`;
    if (!bySymbol.has(key)) bySymbol.set(key, []);
    bySymbol.get(key)!.push(exec);
  }

  const trades: MatchedTrade[] = [];

  for (const [, symbolExecutions] of bySymbol) {
    // Sort by execution time
    const sorted = [...symbolExecutions].sort(
      (a, b) => a.executionTime.getTime() - b.executionTime.getTime()
    );

    const symbolTrades = matchSymbolExecutions(sorted);
    trades.push(...symbolTrades);
  }

  // Sort trades by entry time
  trades.sort((a, b) => a.entryTime.getTime() - b.entryTime.getTime());

  return trades;
}

function matchSymbolExecutions(
  executions: ExecutionWithId[]
): MatchedTrade[] {
  const trades: MatchedTrade[] = [];
  let position = 0; // positive = long, negative = short
  let currentEntries: ExecutionLeg[] = [];
  let currentExits: ExecutionLeg[] = [];
  let currentDirection: TradeDirection | null = null;

  for (const exec of executions) {
    const leg: ExecutionLeg = {
      executionId: exec.id || exec.fingerprint,
      side: exec.side,
      quantity: exec.quantity,
      price: exec.price,
      timestamp: exec.executionTime,
      charges: exec.charges?.total,
    };

    const qtyDelta = exec.side === "BUY" ? exec.quantity : -exec.quantity;

    if (position === 0) {
      // Opening new position
      currentDirection = exec.side === "BUY" ? "LONG" : "SHORT";
      currentEntries = [leg];
      currentExits = [];
      position = qtyDelta;
    } else if (
      (position > 0 && exec.side === "BUY") ||
      (position < 0 && exec.side === "SELL")
    ) {
      // Adding to existing position
      currentEntries.push(leg);
      position += qtyDelta;
    } else {
      // Closing/reducing position
      currentExits.push(leg);
      const prevPosition = position;
      position += qtyDelta;

      // Check if position is closed or flipped
      if (position === 0) {
        // Fully closed
        trades.push(
          buildTrade(executions[0].symbol, executions[0].exchange, currentDirection!, currentEntries, currentExits, "CLOSED")
        );
        currentEntries = [];
        currentExits = [];
        currentDirection = null;
      } else if (
        (prevPosition > 0 && position < 0) ||
        (prevPosition < 0 && position > 0)
      ) {
        // Position flipped — close current, open new
        // Split the exit leg
        const closeQty = Math.abs(prevPosition);
        const newQty = Math.abs(position);

        const closeLeg: ExecutionLeg = { ...leg, quantity: closeQty };
        const openLeg: ExecutionLeg = { ...leg, quantity: newQty };

        currentExits[currentExits.length - 1] = closeLeg;
        trades.push(
          buildTrade(executions[0].symbol, executions[0].exchange, currentDirection!, currentEntries, currentExits, "CLOSED")
        );

        // Start new trade in opposite direction
        currentDirection = position > 0 ? "LONG" : "SHORT";
        currentEntries = [openLeg];
        currentExits = [];
      }
    }
  }

  // Handle remaining open position
  if (position !== 0 && currentEntries.length > 0) {
    trades.push(
      buildTrade(
        executions[0].symbol,
        executions[0].exchange,
        currentDirection!,
        currentEntries,
        currentExits,
        currentExits.length > 0 ? "PARTIAL" : "OPEN"
      )
    );
  }

  return trades;
}

function buildTrade(
  symbol: string,
  exchange: string,
  direction: TradeDirection,
  entries: ExecutionLeg[],
  exits: ExecutionLeg[],
  status: TradeStatus
): MatchedTrade {
  const totalBuyQty = entries
    .filter((e) => e.side === "BUY")
    .reduce((sum, e) => sum + e.quantity, 0)
    + exits
    .filter((e) => e.side === "BUY")
    .reduce((sum, e) => sum + e.quantity, 0);

  const totalSellQty = entries
    .filter((e) => e.side === "SELL")
    .reduce((sum, e) => sum + e.quantity, 0)
    + exits
    .filter((e) => e.side === "SELL")
    .reduce((sum, e) => sum + e.quantity, 0);

  // Calculate weighted average prices
  const entryLegs = direction === "LONG"
    ? [...entries.filter(e => e.side === "BUY"), ...exits.filter(e => e.side === "BUY")]
    : [...entries.filter(e => e.side === "SELL"), ...exits.filter(e => e.side === "SELL")];
  
  const exitLegs = direction === "LONG"
    ? [...entries.filter(e => e.side === "SELL"), ...exits.filter(e => e.side === "SELL")]
    : [...entries.filter(e => e.side === "BUY"), ...exits.filter(e => e.side === "BUY")];

  const avgEntryPrice = weightedAvgPrice(entryLegs);
  const avgExitPrice = exitLegs.length > 0 ? weightedAvgPrice(exitLegs) : null;

  const entryQty = entryLegs.reduce((sum, e) => sum + e.quantity, 0);
  const exitQty = exitLegs.reduce((sum, e) => sum + e.quantity, 0);

  // Calculate P&L
  let grossPnl = 0;
  if (avgExitPrice !== null && exitQty > 0) {
    if (direction === "LONG") {
      grossPnl = (avgExitPrice - avgEntryPrice) * exitQty;
    } else {
      grossPnl = (avgEntryPrice - avgExitPrice) * exitQty;
    }
  }

  const totalCharges =
    [...entries, ...exits].reduce((sum, e) => sum + (e.charges || 0), 0);
  const netPnl = grossPnl - totalCharges;
  const totalInvestment = avgEntryPrice * entryQty;
  const pnlPercentage = totalInvestment > 0 ? (netPnl / totalInvestment) * 100 : 0;

  const entryTime = entries[0]?.timestamp || new Date();
  const exitTime =
    status === "CLOSED" && exits.length > 0
      ? exits[exits.length - 1].timestamp
      : null;

  const holdingPeriodMs = exitTime
    ? exitTime.getTime() - entryTime.getTime()
    : null;

  return {
    symbol,
    exchange,
    direction,
    status,
    entries,
    exits,
    totalBuyQty,
    totalSellQty,
    avgEntryPrice,
    avgExitPrice,
    grossPnl,
    totalCharges,
    netPnl,
    pnlPercentage,
    entryTime,
    exitTime,
    holdingPeriodMs,
  };
}

function weightedAvgPrice(legs: ExecutionLeg[]): number {
  if (legs.length === 0) return 0;
  const totalValue = legs.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const totalQty = legs.reduce((sum, l) => sum + l.quantity, 0);
  return totalQty > 0 ? totalValue / totalQty : 0;
}
