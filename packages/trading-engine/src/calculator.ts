import type {
  PerformanceMetrics,
  EquityPoint,
  StrategyPerformance,
  DailyPnl,
  RiskCalculation,
  MatchedTrade,
} from "./types";

// ─── TRADE P&L ──────────────────────────────────────

export function calculateGrossPnl(
  avgEntry: number,
  avgExit: number,
  quantity: number,
  direction: "LONG" | "SHORT"
): number {
  if (direction === "LONG") {
    return (avgExit - avgEntry) * quantity;
  }
  return (avgEntry - avgExit) * quantity;
}

export function calculateNetPnl(grossPnl: number, totalCharges: number): number {
  return grossPnl - totalCharges;
}

export function calculateRMultiple(
  netPnl: number,
  riskAmount: number
): number | null {
  if (!riskAmount || riskAmount === 0) return null;
  return netPnl / riskAmount;
}

export function calculatePnlPercentage(
  netPnl: number,
  totalInvestment: number
): number {
  if (totalInvestment === 0) return 0;
  return (netPnl / totalInvestment) * 100;
}

export function calculateHoldingPeriod(
  entryTime: Date,
  exitTime: Date | null
): number | null {
  if (!exitTime) return null;
  return exitTime.getTime() - entryTime.getTime();
}

// ─── PORTFOLIO ANALYTICS ────────────────────────────

interface TradeForAnalytics {
  netPnl: number;
  grossPnl: number;
  rMultiple?: number | null;
  holdingPeriodMs?: number | bigint | null;
  status: string;
  entryTime: Date;
  exitTime?: Date | null;
  strategy?: string | null;
  avgEntryPrice: number;
  totalBuyQty?: number;
  totalSellQty?: number;
  todayPnl?: number;
}

export function calculatePerformanceMetrics(
  trades: TradeForAnalytics[],
  todayStart?: Date
): PerformanceMetrics {
  // Use ALL trades (open + closed). For open trades, netPnl should be
  // pre-populated with unrealized P&L from live prices.
  const allTrades = trades;
  const closedTrades = allTrades.filter((t) => t.status === "CLOSED");
  const openTrades = allTrades.filter(
    (t) => t.status === "OPEN" || t.status === "PARTIAL"
  );

  // For win/loss metrics, use all trades that have a non-zero P&L
  const tradesWithPnl = allTrades.filter((t) => t.netPnl !== 0);
  const winningTrades = tradesWithPnl.filter((t) => t.netPnl > 0);
  const losingTrades = tradesWithPnl.filter((t) => t.netPnl < 0);

  // Total P&L = realized (closed) + unrealized (open)
  const totalPnl = allTrades.reduce((sum, t) => sum + t.netPnl, 0);
  const totalWins = winningTrades.reduce((sum, t) => sum + t.netPnl, 0);
  const totalLosses = Math.abs(
    losingTrades.reduce((sum, t) => sum + t.netPnl, 0)
  );

  const winRate =
    tradesWithPnl.length > 0
      ? (winningTrades.length / tradesWithPnl.length) * 100
      : 0;

  const avgWinner =
    winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const avgLoser =
    losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;

  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

  const expectancy =
    allTrades.length > 0 ? totalPnl / allTrades.length : 0;

  const rValues = allTrades
    .filter((t) => t.rMultiple != null)
    .map((t) => Number(t.rMultiple));
  const averageR =
    rValues.length > 0
      ? rValues.reduce((sum, r) => sum + r, 0) / rValues.length
      : 0;

  const maxDrawdown = calculateMaxDrawdown(allTrades);

  const pnls = allTrades.map((t) => t.netPnl);
  const largestWin = pnls.length > 0 ? Math.max(...pnls) : 0;
  const largestLoss = pnls.length > 0 ? Math.min(...pnls) : 0;

  const holdingPeriods = allTrades
    .filter((t) => t.holdingPeriodMs != null)
    .map((t) => Number(t.holdingPeriodMs));
  const avgHoldingPeriodMs =
    holdingPeriods.length > 0
      ? holdingPeriods.reduce((sum, h) => sum + h, 0) / holdingPeriods.length
      : 0;

  // Today's P&L — include open positions' unrealized P&L
  const today = todayStart || new Date(new Date().setHours(0, 0, 0, 0));
  const todayClosedPnl = closedTrades
    .filter((t) => t.exitTime && t.exitTime >= today)
    .reduce((sum, t) => sum + t.netPnl, 0);
  // For open trades, use the provided todayPnl if available, otherwise it's 0
  const todayUnrealizedPnl = openTrades.reduce(
    (sum, t) => sum + (t.todayPnl || 0),
    0
  );
  const todayPnl = todayClosedPnl + todayUnrealizedPnl;

  return {
    totalTrades: allTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    avgWinner,
    avgLoser,
    expectancy,
    profitFactor,
    averageR,
    maxDrawdown,
    largestWin,
    largestLoss,
    avgHoldingPeriodMs,
    totalPnl,
    todayPnl,
  };
}

export function calculateMaxDrawdown(
  trades: TradeForAnalytics[]
): number {
  if (trades.length === 0) return 0;

  const sorted = [...trades].sort(
    (a, b) => a.entryTime.getTime() - b.entryTime.getTime()
  );

  let peak = 0;
  let maxDD = 0;
  let equity = 0;

  for (const trade of sorted) {
    equity += trade.netPnl;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDD) maxDD = dd;
  }

  return maxDD;
}

export function calculateEquityCurve(
  trades: TradeForAnalytics[]
): EquityPoint[] {
  // Use entry dates for all trades, exit dates for closed ones.
  // For open trades with unrealized P&L, plot on entry date.
  const allTrades = [...trades].sort(
    (a, b) => {
      const dateA = (a.status === "CLOSED" && a.exitTime) ? a.exitTime : a.entryTime;
      const dateB = (b.status === "CLOSED" && b.exitTime) ? b.exitTime : b.entryTime;
      return dateA.getTime() - dateB.getTime();
    }
  );

  // Only include trades that have non-zero P&L
  const withPnl = allTrades.filter((t) => t.netPnl !== 0 || t.status !== "CLOSED");

  const points: EquityPoint[] = [];
  let cumPnl = 0;

  // Group by day using the appropriate date
  const byDay = new Map<string, TradeForAnalytics[]>();
  for (const trade of withPnl) {
    const refDate = (trade.status === "CLOSED" && trade.exitTime)
      ? trade.exitTime
      : trade.entryTime;
    const dateKey = refDate.toISOString().split("T")[0];
    if (!byDay.has(dateKey)) byDay.set(dateKey, []);
    byDay.get(dateKey)!.push(trade);
  }

  // Sort dates
  const sortedDates = [...byDay.keys()].sort();

  for (const dateStr of sortedDates) {
    const dayTrades = byDay.get(dateStr)!;
    const dayPnl = dayTrades.reduce((sum, t) => sum + t.netPnl, 0);
    cumPnl += dayPnl;
    points.push({
      date: new Date(dateStr),
      equity: cumPnl,
      pnl: dayPnl,
      cumulativePnl: cumPnl,
      tradeCount: dayTrades.length,
    });
  }

  return points;
}

export function calculateStrategyPerformance(
  trades: TradeForAnalytics[]
): StrategyPerformance[] {
  const byStrategy = new Map<string, TradeForAnalytics[]>();

  for (const trade of trades) {
    const strategy = trade.strategy || "Untagged";
    if (!byStrategy.has(strategy)) byStrategy.set(strategy, []);
    byStrategy.get(strategy)!.push(trade);
  }

  const results: StrategyPerformance[] = [];

  for (const [strategy, stratTrades] of byStrategy) {
    // Include ALL trades, not just closed
    const tradesWithPnl = stratTrades.filter((t) => t.netPnl !== 0);
    const wins = tradesWithPnl.filter((t) => t.netPnl > 0);
    const totalPnl = stratTrades.reduce((sum, t) => sum + t.netPnl, 0);
    const totalWins = wins.reduce((sum, t) => sum + t.netPnl, 0);
    const totalLosses = Math.abs(
      tradesWithPnl
        .filter((t) => t.netPnl < 0)
        .reduce((sum, t) => sum + t.netPnl, 0)
    );

    const rValues = stratTrades
      .filter((t) => t.rMultiple != null)
      .map((t) => Number(t.rMultiple));

    const holdingPeriods = stratTrades
      .filter((t) => t.holdingPeriodMs != null)
      .map((t) => Number(t.holdingPeriodMs));

    results.push({
      strategy,
      trades: stratTrades.length,
      winRate:
        tradesWithPnl.length > 0 ? (wins.length / tradesWithPnl.length) * 100 : 0,
      avgR:
        rValues.length > 0
          ? rValues.reduce((s, r) => s + r, 0) / rValues.length
          : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
      totalPnl,
      expectancy: stratTrades.length > 0 ? totalPnl / stratTrades.length : 0,
      avgHoldingPeriodMs:
        holdingPeriods.length > 0
          ? holdingPeriods.reduce((s, h) => s + h, 0) / holdingPeriods.length
          : 0,
    });
  }

  return results.sort((a, b) => b.totalPnl - a.totalPnl);
}

export function calculateDailyPnl(
  trades: TradeForAnalytics[]
): DailyPnl[] {
  const closed = trades.filter((t) => t.status === "CLOSED" && t.exitTime);
  const byDay = new Map<string, TradeForAnalytics[]>();

  for (const trade of closed) {
    const dateKey = trade.exitTime!.toISOString().split("T")[0];
    if (!byDay.has(dateKey)) byDay.set(dateKey, []);
    byDay.get(dateKey)!.push(trade);
  }

  const results: DailyPnl[] = [];
  for (const [date, dayTrades] of byDay) {
    results.push({
      date,
      pnl: dayTrades.reduce((sum, t) => sum + t.netPnl, 0),
      tradeCount: dayTrades.length,
      winCount: dayTrades.filter((t) => t.netPnl > 0).length,
      lossCount: dayTrades.filter((t) => t.netPnl < 0).length,
    });
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

// ─── RISK CALCULATOR ────────────────────────────────

export function calculateRisk(
  capital: number,
  riskPercent: number,
  entry: number,
  stopLoss: number,
  target: number
): RiskCalculation {
  const riskPerShare = Math.abs(entry - stopLoss);
  const maxRiskAmount = (capital * riskPercent) / 100;
  const maxQuantity =
    riskPerShare > 0 ? Math.floor(maxRiskAmount / riskPerShare) : 0;
  const totalCapitalRequired = maxQuantity * entry;
  const potentialLoss = maxQuantity * riskPerShare;
  const rewardPerShare = Math.abs(target - entry);
  const potentialProfit = maxQuantity * rewardPerShare;
  const rewardToRisk =
    riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;

  return {
    capital,
    riskPercent,
    entry,
    stopLoss,
    target,
    riskPerShare,
    maxQuantity,
    totalCapitalRequired,
    potentialLoss,
    potentialProfit,
    rewardToRisk,
  };
}
