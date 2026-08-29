import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toYahooSymbol } from "@/lib/yahoo-finance";
import { prisma } from "@repo/database";

// GET /api/chart?symbol=RELIANCE&exchange=NSE&range=1mo&interval=1d
export async function GET(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const exchange = searchParams.get("exchange") || "NSE";
  const range = searchParams.get("range") || "1mo";
  const interval = searchParams.get("interval") || "1d";

  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter required" }, { status: 400 });
  }

  try {
    const yahooSymbol = toYahooSymbol(symbol, exchange);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch chart data" }, { status: res.status });
    }

    const data = await res.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];

    if (!quote) {
      return NextResponse.json({ error: "No quote data" }, { status: 404 });
    }

    const meta = result.meta;
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    let rate = 1;
    if (meta?.currency && meta.currency !== baseCurrency) {
      try {
        const rateSymbol = `${meta.currency}${baseCurrency}=X`;
        const rateUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${rateSymbol}?interval=1d&range=1d`;
        const rateRes = await fetch(rateUrl, { next: { revalidate: 3600 } });
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          rate = rateData?.chart?.result?.[0]?.meta?.regularMarketPrice || 1;
        }
      } catch (e) {
        console.error("Chart exchange rate fetch error", e);
      }
    }

    const candles = timestamps.map((ts: number, i: number) => ({
      time: ts * 1000, // Convert to milliseconds
      open: (quote.open?.[i] ?? null) !== null ? quote.open[i] * rate : null,
      high: (quote.high?.[i] ?? null) !== null ? quote.high[i] * rate : null,
      low: (quote.low?.[i] ?? null) !== null ? quote.low[i] * rate : null,
      close: (quote.close?.[i] ?? null) !== null ? quote.close[i] * rate : null,
      volume: quote.volume?.[i] ?? null,
    })).filter((c: any) => c.open !== null && c.high !== null && c.low !== null && c.close !== null); // Filter out invalid candles

    return NextResponse.json({
      symbol,
      exchange,
      candles,
      currentPrice: meta?.regularMarketPrice ? meta.regularMarketPrice * rate : null,
      previousClose: (meta?.chartPreviousClose ?? meta?.previousClose ?? null) ? (meta?.chartPreviousClose ?? meta?.previousClose) * rate : null,
    });
  } catch (error) {
    console.error("Chart data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
