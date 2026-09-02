async function main() {
  const body = {
    symbols: { tickers: ["NSE:RELIANCE", "BSE:TCS", "BINANCE:BTCUSDT"] },
    columns: ["close", "change", "change_abs", "Recommend.All"]
  };

  try {
    const res = await fetch("https://scanner.tradingview.com/india/scan", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    console.log("INDIA:", await res.json());
  } catch (e) {
    console.error(e);
  }

  try {
    const res2 = await fetch("https://scanner.tradingview.com/crypto/scan", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });
    console.log("CRYPTO:", await res2.json());
  } catch (e) {
    console.error(e);
  }
}

main();
