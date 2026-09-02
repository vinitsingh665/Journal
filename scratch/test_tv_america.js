async function main() {
  const body = {
    symbols: { tickers: ["NASDAQ:AAPL", "NYSE:CRM", "BSE:TCS"] },
    columns: ["close", "change_abs", "change"]
  };

  try {
    const res = await fetch("https://scanner.tradingview.com/america/scan", {
      method: "POST",
      body: JSON.stringify({ symbols: { tickers: ["NASDAQ:AAPL", "NYSE:CRM"] }, columns: ["close"] }),
      headers: { "Content-Type": "application/json" }
    });
    console.log("AMERICA:", await res.json());

    const res2 = await fetch("https://scanner.tradingview.com/india/scan", {
      method: "POST",
      body: JSON.stringify({ symbols: { tickers: ["BSE:TCS", "NSE:RELIANCE"] }, columns: ["close"] }),
      headers: { "Content-Type": "application/json" }
    });
    console.log("INDIA:", await res2.json());
  } catch (e) {
    console.error(e);
  }
}

main();
