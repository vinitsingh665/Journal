import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fetchStockQuote, fetchMultipleQuotes } from "@/lib/yahoo-finance";
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
// Body: { symbols: { symbol: string, exchange: string }[] }
export async function POST(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    const baseCurrency = userSettings?.currency || "INR";

    const { symbols } = await request.json();
    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "symbols array required" }, { status: 400 });
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
