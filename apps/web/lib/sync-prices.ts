import { prisma } from "@repo/database";

function yahooTicker(symbol: string, exchange: string): string {
  const ex = exchange.toUpperCase();
  if (ex === "CRYPTO") return symbol.toUpperCase() + "-USD";
  if (ex === "NSE") return symbol.toUpperCase() + ".NS";
  if (ex === "BSE") return symbol.toUpperCase() + ".BO";
  return symbol.toUpperCase();
}

function formatUTC(d: Date): string {
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
}

function toUTCMidnight(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

async function fetchCandles(ticker: string, from: Date, to: Date): Promise<{ date: string; close: number }[]> {
  const p1 = Math.floor(from.getTime() / 1000);
  const p2 = Math.floor(to.getTime() / 1000);
  const url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(ticker) + "?interval=1d&period1=" + p1 + "&period2=" + p2;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];
    const timestamps: number[] = result.timestamps ?? result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
    return timestamps.map((ts: number, i: number) => ({ date: formatUTC(new Date(ts * 1000)), close: closes[i] })).filter((c: any) => c.close && !isNaN(c.close));
  } catch { return []; }
}

export async function syncPricesForUser(userId: string): Promise<{ synced: number; skipped: number }> {
  const openTrades = await prisma.trade.findMany({
    where: { userId, isArchived: false, status: { in: ["OPEN", "PARTIAL"] } },
    select: { symbol: true, exchange: true, entryTime: true },
  });
  if (openTrades.length === 0) return { synced: 0, skipped: 0 };

  const bySymbol = new Map<string, { exchange: string; entryTime: Date }>();
  for (const t of openTrades) {
    const entry = new Date(t.entryTime);
    if (!bySymbol.has(t.symbol) || entry < bySymbol.get(t.symbol)!.entryTime) {
      bySymbol.set(t.symbol, { exchange: t.exchange, entryTime: entry });
    }
  }

  const existing = await prisma.priceHistory.findMany({
    where: { symbol: { in: [...bySymbol.keys()] } },
    select: { symbol: true, date: true },
  });
  const existingSet = new Set(existing.map((r: any) => r.symbol + "::" + formatUTC(new Date(r.date))));

  const usdInrCache = new Map<string, number>();
  async function getUsdInr(date: string): Promise<number> {
    if (usdInrCache.has(date)) return usdInrCache.get(date)!;
    const d = toUTCMidnight(date);
    const candles = await fetchCandles("USDINR=X", d, new Date(d.getTime() + 86400000));
    const rate = candles[0]?.close ?? 84;
    usdInrCache.set(date, rate);
    return rate;
  }

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(23, 59, 59, 999);

  let synced = 0;
  let skipped = 0;

  for (const [symbol, { exchange, entryTime }] of bySymbol.entries()) {
    const ticker = yahooTicker(symbol, exchange);
    const isForeign = ["NASDAQ", "NYSE", "CRYPTO"].includes(exchange.toUpperCase());
    const candles = await fetchCandles(ticker, entryTime, yesterday);

    for (const { date, close } of candles) {
      const key = symbol + "::" + date;
      if (existingSet.has(key)) { skipped++; continue; }
      const closeUSD = close;
      let usdInrRate = 1;
      let closeINR = closeUSD;
      if (isForeign) { usdInrRate = await getUsdInr(date); closeINR = closeUSD * usdInrRate; }
      await prisma.priceHistory.upsert({
        where: { symbol_date: { symbol, date: toUTCMidnight(date) } },
        create: { symbol, date: toUTCMidnight(date), closeUSD, closeINR, usdInrRate },
        update: { closeUSD, closeINR, usdInrRate },
      });
      existingSet.add(key);
      synced++;
    }
  }
  console.log("[sync-prices] user=" + userId + " synced=" + synced + " skipped=" + skipped);
  return { synced, skipped };
}