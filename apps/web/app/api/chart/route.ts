import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toYahooSymbol } from "@/lib/yahoo-finance";

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

    const candles = timestamps.map((ts: number, i: number) => ({
      time: ts * 1000, // Convert to milliseconds
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    })).filter((c: { open: number | null }) => c.open !== null); // Filter out null candles

    const meta = result.meta;

    return NextResponse.json({
      symbol,
      exchange,
      candles,
      currentPrice: meta?.regularMarketPrice ?? null,
      previousClose: meta?.chartPreviousClose ?? meta?.previousClose ?? null,
    });
  } catch (error) {
    console.error("Chart data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
