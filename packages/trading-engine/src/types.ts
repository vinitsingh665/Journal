// ─── CORE TYPES ─────────────────────────────────────

export type TradeSide = "BUY" | "SELL";
export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED" | "PARTIAL";
export type OrderType = "MARKET" | "LIMIT" | "SL" | "SL-M";
export type ProductType = "CNC" | "MIS" | "NRML";

export interface ChargeBreakdown {
  brokerage?: number;
  stt?: number;
  exchangeCharges?: number;
  gst?: number;
  sebiCharges?: number;
  stampDuty?: number;
  total: number;
}

// ─── RAW / NORMALIZED EXECUTION ─────────────────────

export interface RawCsvRow {
  [key: string]: string;
}

export interface NormalizedExecution {
  symbol: string;
  exchange: string;
  side: TradeSide;
  quantity: number;
  executedQty: number;
  price: number;
  avgPrice: number;
  orderId?: string;
  executionId?: string;
  orderType?: string;
  productType?: string;
  orderStatus?: string;
  executionTime: Date;
  orderTime?: Date;
  charges?: ChargeBreakdown;
  fingerprint: string;
}

// ─── COLUMN MAPPING ─────────────────────────────────

export interface ColumnMapping {
  symbol: string;
  side: string;
  quantity: string;
  price: string;
  executionTime: string;
  exchange?: string;
  orderId?: string;
  executionId?: string;
  orderType?: string;
  productType?: string;
  orderStatus?: string;
}

export interface BrokerFormat {
  name: string;
  id: string;
  detectHeaders: (headers: string[]) => boolean;
  getMapping: () => ColumnMapping;
  parseSide: (value: string) => TradeSide;
  parseDate: (value: string) => Date;
}

// ─── DEDUPLICATION ──────────────────────────────────

export interface DeduplicationResult {
  newExecutions: NormalizedExecution[];
  duplicates: NormalizedExecution[];
  errors: Array<{ row: number; message: string; data: RawCsvRow }>;
}

// ─── TRADE MATCHING ─────────────────────────────────

export interface ExecutionLeg {
  executionId: string;
  side: TradeSide;
  quantity: number;
  price: number;
  timestamp: Date;
  charges?: number;
}

export interface MatchedTrade {
  symbol: string;
  exchange: string;
  direction: TradeDirection;
  status: TradeStatus;
  entries: ExecutionLeg[];
  exits: ExecutionLeg[];
  totalBuyQty: number;
  totalSellQty: number;
  avgEntryPrice: number;
  avgExitPrice: number | null;
  grossPnl: number;
  totalCharges: number;
  netPnl: number;
  pnlPercentage: number;
  entryTime: Date;
  exitTime: Date | null;
  holdingPeriodMs: number | null;
  riskAmount?: number;
  rMultiple?: number;
}

// ─── ANALYTICS ──────────────────────────────────────

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWinner: number;
  avgLoser: number;
  expectancy: number;
  profitFactor: number;
  averageR: number;
  maxDrawdown: number;
  largestWin: number;
  largestLoss: number;
  avgHoldingPeriodMs: number;
  totalPnl: number;
  todayPnl: number;
}

export interface EquityPoint {
  date: Date;
  equity: number;
  pnl: number;
  cumulativePnl: number;
  tradeCount: number;
}

export interface StrategyPerformance {
  strategy: string;
  trades: number;
  winRate: number;
  avgR: number;
  profitFactor: number;
  totalPnl: number;
  expectancy: number;
  avgHoldingPeriodMs: number;
}

export interface DailyPnl {
  date: string;
  pnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
}

// ─── RISK CALCULATOR ────────────────────────────────

export interface RiskCalculation {
  capital: number;
  riskPercent: number;
  entry: number;
  stopLoss: number;
  target: number;
  riskPerShare: number;
  maxQuantity: number;
  totalCapitalRequired: number;
  potentialLoss: number;
  potentialProfit: number;
  rewardToRisk: number;
}

// ─── IMPORT ─────────────────────────────────────────

export interface ImportPreview {
  totalRows: number;
  sampleRows: RawCsvRow[];
  detectedFormat: string | null;
  suggestedMapping: ColumnMapping | null;
  headers: string[];
}

export interface ImportResult {
  totalRows: number;
  newExecutions: number;
  duplicates: number;
  errors: number;
  errorDetails: Array<{ row: number; message: string }>;
  tradesCreated: number;
  tradesUpdated: number;
}
