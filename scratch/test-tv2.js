const https = require("https");

const data = JSON.stringify({
  symbols: { tickers: ["BSE:CUPID"] },
  columns: ["close"]
});

const options = {
  hostname: "scanner.tradingview.com",
  path: "/india/scan",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length
  }
};

const req = https.request(options, res => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => console.log(body));
});

req.write(data);
req.end();
