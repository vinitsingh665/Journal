async function main() {
  const body = {
    symbols: { tickers: ["NSE:RELIANCE"] },
    columns: ["close", "change_abs", "change", "open", "high", "low", "volume", "currency"]
  };

  try {
    const res = await fetch("https://scanner.tradingview.com/india/scan", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    console.log("INDIA:", JSON.stringify(await res.json(), null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
