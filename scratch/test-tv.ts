import { fetchMultipleQuotes } from "../apps/web/lib/tradingview-finance";

async function main() {
  const quotes = await fetchMultipleQuotes([{ symbol: "CUPID", exchange: "NSE" }], "INR");
  console.log(quotes);
}

main();
