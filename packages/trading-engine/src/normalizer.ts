import crypto from "crypto";
import Papa from "papaparse";
import type {
  RawCsvRow,
  NormalizedExecution,
  ColumnMapping,
  BrokerFormat,
  TradeSide,
  ImportPreview,
} from "./types";

// ─── BROKER FORMAT DEFINITIONS ──────────────────────

const ZERODHA_FORMAT: BrokerFormat = {
  name: "Zerodha Console",
  id: "zerodha",
  detectHeaders: (headers: string[]) => {
    const lower = headers.map((h) => h.toLowerCase().trim());
    return (
      lower.includes("trade_date") ||
      lower.includes("tradingsymbol") ||
      (lower.includes("symbol") && lower.includes("trade_type"))
    );
  },
  getMapping: () => ({
    symbol: "tradingsymbol|symbol",
    side: "trade_type|transaction_type",
    quantity: "quantity|qty",
    price: "price|trade_price|avg_price",
    executionTime: "trade_date|order_execution_time",
    exchange: "exchange",
    orderId: "order_id",
    executionId: "trade_id",
    orderType: "order_type",
    productType: "product",
  }),
  parseSide: (value: string): TradeSide => {
    const v = value.toUpperCase().trim();
    if (v === "BUY" || v === "B") return "BUY";
    return "SELL";
  },
  parseDate: (value: string): Date => parseIndianDate(value),
};

const GROWW_FORMAT: BrokerFormat = {
  name: "Groww",
  id: "groww",
  detectHeaders: (headers: string[]) => {
    const lower = headers.map((h) => h.toLowerCase().trim());
    return lower.includes("stock_name") || lower.includes("scrip_name");
  },
  getMapping: () => ({
    symbol: "stock_name|scrip_name|symbol",
    side: "action|type|transaction_type",
    quantity: "quantity|qty|shares",
    price: "price|avg_price|trade_price",
    executionTime: "date|trade_date|order_date",
    exchange: "exchange",
    orderId: "order_id|order_no",
  }),
  parseSide: (value: string): TradeSide => {
    const v = value.toUpperCase().trim();
    if (v === "BUY" || v === "B" || v === "BOUGHT") return "BUY";
    return "SELL";
  },
  parseDate: (value: string): Date => parseIndianDate(value),
};

const ANGEL_ONE_FORMAT: BrokerFormat = {
  name: "Angel One",
  id: "angel_one",
  detectHeaders: (headers: string[]) => {
    const lower = headers.map((h) => h.toLowerCase().trim());
    return (
      lower.includes("script_name") ||
      (lower.includes("trade_no") && lower.includes("order_no"))
    );
  },
  getMapping: () => ({
    symbol: "script_name|symbol|scrip",
    side: "buy_sell|type|transaction_type",
    quantity: "quantity|qty|trade_qty",
    price: "trade_price|price|rate",
    executionTime: "trade_date|date|trade_time",
    exchange: "exchange|exch",
    orderId: "order_no|order_id",
    executionId: "trade_no|trade_id",
    orderType: "order_type",
    productType: "product_type|product",
  }),
  parseSide: (value: string): TradeSide => {
    const v = value.toUpperCase().trim();
    if (v === "BUY" || v === "B" || v === "BOUGHT") return "BUY";
    return "SELL";
  },
  parseDate: (value: string): Date => parseIndianDate(value),
};

const GENERIC_FORMAT: BrokerFormat = {
  name: "Generic CSV",
  id: "generic",
  detectHeaders: () => true,
  getMapping: () => ({
    symbol: "symbol|stock|scrip|instrument|name",
    side: "side|type|action|buy_sell|transaction_type|trade_type",
    quantity: "quantity|qty|shares|volume",
    price: "price|rate|avg_price|trade_price|execution_price",
    executionTime: "date|time|datetime|timestamp|trade_date|execution_time",
    exchange: "exchange|exch|market",
    orderId: "order_id|order_no|order_number",
    executionId: "trade_id|execution_id|trade_no",
    orderType: "order_type|type",
    productType: "product|product_type|segment",
  }),
  parseSide: (value: string): TradeSide => {
    const v = value.toUpperCase().trim();
    if (v === "BUY" || v === "B" || v === "BOUGHT" || v === "LONG") return "BUY";
    return "SELL";
  },
  parseDate: (value: string): Date => parseIndianDate(value),
};

const BROKER_FORMATS: BrokerFormat[] = [
  ZERODHA_FORMAT,
  GROWW_FORMAT,
  ANGEL_ONE_FORMAT,
  GENERIC_FORMAT,
];

// ─── HELPERS ────────────────────────────────────────

function parseIndianDate(value: string): Date {
  if (!value) return new Date();
  
  // Try ISO format first
  const isoDate = new Date(value);
  if (!isNaN(isoDate.getTime())) return isoDate;

  // DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = value.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (ddmmyyyy) {
    const [, day, month, year, hour, min, sec] = ddmmyyyy;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour || "0"),
      parseInt(min || "0"),
      parseInt(sec || "0")
    );
  }

  // YYYY-MM-DD
  const yyyymmdd = value.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (yyyymmdd) {
    const [, year, month, day, hour, min, sec] = yyyymmdd;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour || "0"),
      parseInt(min || "0"),
      parseInt(sec || "0")
    );
  }

  return new Date(value);
}

function resolveColumn(
  row: RawCsvRow,
  mappingValue: string
): string | undefined {
  const candidates = mappingValue.split("|");
  for (const candidate of candidates) {
    // Try exact match
    if (row[candidate] !== undefined) return row[candidate];
    // Try case-insensitive
    const key = Object.keys(row).find(
      (k) => k.toLowerCase().trim() === candidate.toLowerCase().trim()
    );
    if (key) return row[key];
  }
  return undefined;
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  // Remove ₹, commas, spaces
  const cleaned = value.replace(/[₹,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function generateFingerprint(exec: {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  timestamp: Date;
  orderId?: string;
}): string {
  const data = [
    exec.symbol,
    exec.side,
    exec.quantity.toString(),
    exec.price.toFixed(2),
    exec.timestamp.toISOString(),
    exec.orderId || "",
  ].join("|");

  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 32);
}

// ─── PUBLIC API ─────────────────────────────────────

export function parseCsv(csvContent: string): {
  data: RawCsvRow[];
  headers: string[];
} {
  const result = Papa.parse<RawCsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });
  return {
    data: result.data,
    headers: result.meta.fields || [],
  };
}

export function detectBrokerFormat(headers: string[]): BrokerFormat {
  for (const format of BROKER_FORMATS) {
    if (format.id !== "generic" && format.detectHeaders(headers)) {
      return format;
    }
  }
  return GENERIC_FORMAT;
}

export function getImportPreview(csvContent: string): ImportPreview {
  const { data, headers } = parseCsv(csvContent);
  const format = detectBrokerFormat(headers);

  return {
    totalRows: data.length,
    sampleRows: data.slice(0, 10),
    detectedFormat: format.name,
    suggestedMapping: format.getMapping(),
    headers,
  };
}

export function normalizeExecutions(
  rows: RawCsvRow[],
  mapping: ColumnMapping,
  formatId: string = "generic"
): {
  executions: NormalizedExecution[];
  errors: Array<{ row: number; message: string; data: RawCsvRow }>;
} {
  const format =
    BROKER_FORMATS.find((f) => f.id === formatId) || GENERIC_FORMAT;
  const executions: NormalizedExecution[] = [];
  const errors: Array<{ row: number; message: string; data: RawCsvRow }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const symbol = resolveColumn(row, mapping.symbol);
      const sideRaw = resolveColumn(row, mapping.side);
      const qtyRaw = resolveColumn(row, mapping.quantity);
      const priceRaw = resolveColumn(row, mapping.price);
      const dateRaw = resolveColumn(row, mapping.executionTime);

      if (!symbol || !sideRaw || !qtyRaw || !priceRaw) {
        errors.push({
          row: i + 1,
          message: `Missing required field: ${!symbol ? "symbol" : !sideRaw ? "side" : !qtyRaw ? "quantity" : "price"}`,
          data: row,
        });
        continue;
      }

      const side = format.parseSide(sideRaw);
      const quantity = Math.abs(Math.round(parseNumber(qtyRaw)));
      const price = parseNumber(priceRaw);
      const executionTime = dateRaw ? format.parseDate(dateRaw) : new Date();

      if (quantity <= 0 || price <= 0) {
        errors.push({
          row: i + 1,
          message: `Invalid quantity (${quantity}) or price (${price})`,
          data: row,
        });
        continue;
      }

      const exchange =
        (mapping.exchange
          ? resolveColumn(row, mapping.exchange)
          : undefined) || "NSE";
      const orderId = mapping.orderId
        ? resolveColumn(row, mapping.orderId)
        : undefined;
      const executionId = mapping.executionId
        ? resolveColumn(row, mapping.executionId)
        : undefined;
      const orderType = mapping.orderType
        ? resolveColumn(row, mapping.orderType)
        : undefined;
      const productType = mapping.productType
        ? resolveColumn(row, mapping.productType)
        : undefined;

      const fingerprint = generateFingerprint({
        symbol: symbol.toUpperCase().trim(),
        side,
        quantity,
        price,
        timestamp: executionTime,
        orderId,
      });

      executions.push({
        symbol: symbol.toUpperCase().trim(),
        exchange: exchange.toUpperCase().trim(),
        side,
        quantity,
        executedQty: quantity,
        price,
        avgPrice: price,
        orderId,
        executionId,
        orderType,
        productType,
        executionTime,
        fingerprint,
      });
    } catch (err) {
      errors.push({
        row: i + 1,
        message: err instanceof Error ? err.message : "Unknown parsing error",
        data: row,
      });
    }
  }

  return { executions, errors };
}

export { generateFingerprint, parseIndianDate, parseNumber };
