import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchStockQuote, fetchMultipleQuotes } from "@/lib/finance";
import { prisma } from "@repo/database";

// GET /api/quotes?symbols=RELIANCE,TCS,INFY&exchange=NSE
export async function GET(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");
  const exchange = searchParams.get("exchange") || "NSE";

  if (!symbolsParam) {
    return NextResponse.json({ error: "symbols parameter required" }, { status: 400 });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());

  try {
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    if (symbols.length === 1) {
      const quote = await fetchStockQuote(symbols[0], exchange, baseCurrency);
      if (!quote) {
        return NextResponse.json(
          { error: `Failed to fetch quote for ${symbols[0]}` },
          { status: 404 }
        );
      }
      return NextResponse.json(quote);
    }

    // Multiple symbols
    const quotes = await fetchMultipleQuotes(
      symbols.map((s) => ({ symbol: s, exchange })),
      baseCurrency
    );

    const result: Record<string, ReturnType<typeof Object>> = {};
    for (const [key, quote] of quotes) {
      result[key] = quote;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quote fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

// POST /api/quotes
// Body: { symbols: { symbol: string, exchange: string }[], currency?: string }
// NOTE: Auth is optional — stock quotes are public market data.
// Authenticated users get their preferred currency; unauthenticated users (e.g.
// viewing a shared dashboard) fall back to INR.
export async function POST(request: NextRequest) {
  try {
    const { symbols, currency: bodyCurrency } = await request.json();
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "symbols array required" }, { status: 400 });
    }

    // Try to resolve the user's preferred currency. Falls back to INR for
    // unauthenticated visitors (e.g. shared-link recipients).
    let baseCurrency = bodyCurrency || "INR";
    try {
      const userId = await getCurrentUser();
      if (userId) {
        const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
        baseCurrency = userSettings?.currency || baseCurrency;
      }
    } catch {
      // Non-fatal — continue with fallback currency
    }

    const quotes = await fetchMultipleQuotes(symbols, baseCurrency);

    const result: Record<string, any> = {};
    for (const [key, quote] of quotes) {
      result[key] = quote;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quote fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
