import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const exchange = searchParams.get("exchange") || "NSE";

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  // Determine the correct scanner endpoint and market
  let scanUrl = 'https://scanner.tradingview.com/india/scan';
  let markets = ['india'];
  let filter: any[] = [];

  if (exchange === "CRYPTO") {
    scanUrl = 'https://scanner.tradingview.com/crypto/scan';
    markets = ['crypto'];
    // Filter by BINANCE to prevent thousands of spam DEX tokens
    filter.push({ left: 'exchange', operation: 'equal', right: 'BINANCE' });
  } else if (exchange === "NASDAQ" || exchange === "NYSE") {
    scanUrl = 'https://scanner.tradingview.com/america/scan';
    markets = ['america'];
    // We intentionally DO NOT strictly filter by exchange here.
    // If the user selects NYSE, we still want to show them NASDAQ stocks (like AAPL)
    // because most users don't know the exact exchange for US stocks.
  } else {
    // NSE or BSE
    filter.push({ left: 'is_primary', operation: 'equal', right: true });
    if (exchange) {
      filter.push({ left: 'exchange', operation: 'equal', right: exchange });
    }
  }

  const fetchWithFilter = async (searchField: string) => {
    const activeFilter = [
      ...filter,
      { left: searchField, operation: 'match', right: query.toUpperCase() }
    ];

    const body = {
      filter: activeFilter,
      options: { lang: 'en' },
      markets,
      symbols: { query: { types: [] }, tickers: [] },
      columns: ['name', 'description', 'close', 'exchange']
    };

    const response = await fetch(scanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`TV API returned ${response.status}`);
    return await response.json();
  };

  try {
    // First try searching by Ticker Symbol (name)
    let data = await fetchWithFilter('name');
    
    // If no results, they probably typed the company name (description) instead (e.g. "APPLE" instead of "AAPL")
    if (!data.data || data.data.length === 0) {
      data = await fetchWithFilter('description');
    }

    // Parse the response into a cleaner format
    const results = (data.data || []).map((item: any) => ({
      symbol: item.d[0],
      name: item.d[1],
      price: item.d[2],
      exchange: item.d[3]
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("TV Search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}
