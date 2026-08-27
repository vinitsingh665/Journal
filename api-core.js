

// ─── In-Memory Cache ─────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

// ─── TradingView Screener Config ─────────────────────────────────────────────
const TV_SCAN_URL = 'https://scanner.tradingview.com/india/scan';

const FIELDS = [
    'name', 'description', 'logoid', 'type', 'exchange',
    'close', 'change', 'change_abs', 'volume',
    'market_cap_basic', 'price_earnings_ttm',
    'earnings_per_share_basic_ttm',
    'open', 'high', 'low',
    'price_52_week_high', 'price_52_week_low',
    'Perf.W', 'Perf.1M', 'Perf.3M', 'Perf.6M', 'Perf.YTD', 'Perf.Y',
    'Recommend.All', 'Recommend.MA', 'Recommend.Other',
    'RSI', 'Mom', 'AO',
    'ADX', 'Stoch.K', 'Stoch.D',
    'MACD.macd', 'MACD.signal',
    'BB.upper', 'BB.lower',
    'EMA20', 'SMA20', 'EMA50', 'SMA50', 'EMA200', 'SMA200',
    'average_volume_10d_calc', 'average_volume_30d_calc',
    'sector', 'industry',
    'Volatility.D',
    'EMA10'
];

// ─── Stock Category Filters ──────────────────────────────────────────────────
// Base filter used by all categories
const NSE_BASE = [
    { left: 'is_primary', operation: 'equal', right: true },
    { left: 'exchange', operation: 'equal', right: 'NSE' }
];

const CATEGORY_FILTERS = {
    // ── Broad Market Indices ──
    nifty50: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 200000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 50
    },
    niftynext50: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [80000000000, 200000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 50
    },
    nifty100: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 80000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    },
    nifty200: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 30000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    },
    nifty500: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 8000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    },
    // ── Size-Based Indices ──
    midcap50: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [30000000000, 80000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 50
    },
    midcap100: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [15000000000, 80000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 100
    },
    midcap150: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [10000000000, 80000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    },
    smallcap50: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [5000000000, 15000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 50
    },
    smallcap100: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [3000000000, 15000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 100
    },
    smallcap250: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [2000000000, 15000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    },
    microcap250: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [500000000, 2000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    },
    largemidcap250: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 250
    },
    midsmall400: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'in_range', right: [2000000000, 80000000000] }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 400
    },
    // ── Sectoral / Thematic Indices ──
    banknifty: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Finance', 'Financial Services'] },
        { left: 'industry', operation: 'in_range', right: ['Banks—Regional', 'Banks—Diversified', 'Banks - Regional', 'Banks - Diversified', 'Banking Services', 'Major Banks'] },
        { left: 'market_cap_basic', operation: 'greater', right: 20000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    psubank: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Finance', 'Financial Services'] },
        { left: 'industry', operation: 'in_range', right: ['Banks—Regional', 'Banks—Diversified', 'Banks - Regional', 'Banks - Diversified', 'Banking Services', 'Major Banks'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 20
    },
    privatebank: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Finance', 'Financial Services'] },
        { left: 'industry', operation: 'in_range', right: ['Banks—Regional', 'Banks—Diversified', 'Banks - Regional', 'Banks - Diversified', 'Banking Services', 'Major Banks'] },
        { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 20
    },
    financial: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Finance', 'Financial Services'] },
        { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 50
    },
    niftyit: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Technology', 'Technology Services', 'Information Technology'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    pharma: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Health Technology', 'Healthcare', 'Health Services'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    auto: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Consumer Durables', 'Producer Manufacturing'] },
        { left: 'industry', operation: 'in_range', right: ['Auto Parts: OEM', 'Auto Manufacturing', 'Auto Parts: Replacement', 'Motor Vehicles', 'Trucks/Construction/Farm Machinery', 'Auto/Truck Parts & Equipment', 'Automobile Manufacturers', 'Automotive'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    fmcg: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Consumer Non-Durables', 'Consumer Staples'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    metal: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Non-Energy Minerals', 'Process Industries'] },
        { left: 'industry', operation: 'in_range', right: ['Steel', 'Aluminum', 'Other Metals/Minerals', 'Precious Metals', 'Iron/Steel', 'Copper', 'Metal Mining', 'Steel & Iron'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    realty: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Finance', 'Financial Services'] },
        { left: 'industry', operation: 'in_range', right: ['Real Estate Development', 'Real Estate', 'Real Estate Investment Trusts', 'Homebuilding', 'Real Estate Services'] },
        { left: 'market_cap_basic', operation: 'greater', right: 3000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 20
    },
    energy: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Energy Minerals', 'Utilities', 'Energy'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    infra: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Industrial Services', 'Producer Manufacturing', 'Industrials'] },
        { left: 'industry', operation: 'in_range', right: ['Engineering & Construction', 'Construction Materials', 'Building Products', 'Electrical Products', 'Industrial Conglomerates', 'Infrastructure'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    media: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Consumer Services', 'Communication Services'] },
        { left: 'industry', operation: 'in_range', right: ['Broadcasting', 'Publishing: Newspapers', 'Publishing: Books/Magazines', 'Movies/Entertainment', 'Cable/Satellite TV', 'Media', 'Entertainment'] },
        { left: 'market_cap_basic', operation: 'greater', right: 2000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 20
    },
    healthcare: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Health Technology', 'Health Services', 'Healthcare'] },
        { left: 'market_cap_basic', operation: 'greater', right: 3000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 40
    },
    consumer: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Consumer Durables', 'Consumer Services'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 30
    },
    oilgas: {
        filter: [...NSE_BASE,
        { left: 'sector', operation: 'in_range', right: ['Energy Minerals', 'Energy'] },
        { left: 'industry', operation: 'in_range', right: ['Oil & Gas Production', 'Oil Refining/Marketing', 'Oil/Gas Production', 'Integrated Oil', 'Gas Distributors', 'Oil & Gas Refining & Marketing', 'Oil & Gas'] },
        { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 20
    },
    pse: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 50
    },
    // ── Performance-Based ──
    gainers: {
        filter: [...NSE_BASE, { left: 'change', operation: 'greater', right: 0 }, { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'change', sortOrder: 'desc' }, limit: 50
    },
    losers: {
        filter: [...NSE_BASE, { left: 'change', operation: 'less', right: 0 }, { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'change', sortOrder: 'asc' }, limit: 50
    },
    breakouts: {
        filter: [...NSE_BASE, { left: 'close', operation: 'greater', right: 'BB.upper' }, { left: 'volume', operation: 'greater', right: 'average_volume_10d_calc' }],
        sort: { sortBy: 'change', sortOrder: 'desc' }, limit: 50
    },
    mostactive: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 10000000000 }],
        sort: { sortBy: 'volume', sortOrder: 'desc' }, limit: 50
    },
    all: {
        filter: [...NSE_BASE, { left: 'market_cap_basic', operation: 'greater', right: 5000000000 }],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, limit: 1000
    }
};

// ─── Helper: Fetch from TradingView ──────────────────────────────────────────
async function fetchFromTradingView(body) {
    const response = await fetch(TV_SCAN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`TradingView API returned ${response.status}`);
    }

    return response.json();
}

// ─── Helper: Parse TradingView Response ──────────────────────────────────────
function parseStockData(tvData) {
    if (!tvData || !tvData.data) return [];

    return tvData.data.map(item => {
        const d = item.d;
        const recommendation = getRecommendation(d[23]); // Recommend.All

        return {
            symbol: d[0] || '',
            name: d[1] || d[0] || '',
            logo: d[2] ? `https://s3-symbol-logo.tradingview.com/${d[2]}.svg` : null,
            type: d[3] || 'stock',
            exchange: d[4] || 'NSE',
            price: round(d[5]),
            change: round(d[6]),
            changeAbs: round(d[7]),
            volume: d[8],
            marketCap: d[9],
            pe: round(d[10]),
            eps: round(d[11]),
            open: round(d[12]),
            high: round(d[13]),
            low: round(d[14]),
            week52High: round(d[15]),
            week52Low: round(d[16]),
            perfWeek: round(d[17]),
            perfMonth: round(d[18]),
            perf3Month: round(d[19]),
            perf6Month: round(d[20]),
            perfYTD: round(d[21]),
            perfYear: round(d[22]),
            recommendation: recommendation,
            recommendationMA: getRecommendation(d[24]),
            recommendationOther: getRecommendation(d[25]),
            rsi: round(d[26]),
            momentum: round(d[27]),
            ao: round(d[28]),
            adx: round(d[29]),
            stochK: round(d[30]),
            stochD: round(d[31]),
            macd: round(d[32]),
            macdSignal: round(d[33]),
            bbUpper: round(d[34]),
            bbLower: round(d[35]),
            ema20: round(d[36]),
            sma20: round(d[37]),
            ema50: round(d[38]),
            sma50: round(d[39]),
            ema200: round(d[40]),
            sma200: round(d[41]),
            avgVolume10d: d[42],
            avgVolume30d: d[43],
            sector: d[44] || '',
            industry: d[45] || '',
            volatility: round(d[46]),
            ema10: round(d[47]),
            indicatorScore: computeIndicatorScore(d)
        };
    });
}

function round(val) {
    if (val === null || val === undefined) return null;
    return Math.round(val * 100) / 100;
}

function getRecommendation(val) {
    if (val === null || val === undefined) return 'NEUTRAL';
    if (val >= 0.5) return 'STRONG_BUY';
    if (val >= 0.1) return 'BUY';
    if (val <= -0.5) return 'STRONG_SELL';
    if (val <= -0.1) return 'SELL';
    return 'NEUTRAL';
}

// Composite indicator score using RSI, MACD, EMA, Stoch, ADX, BB
// Returns { label, score (0-100), bullish, bearish }
function computeIndicatorScore(d) {
    let bullish = 0, bearish = 0, total = 0;
    const price = d[5];
    const rsi = d[26];
    const macd = d[32]; const macdSig = d[33];
    const ema20 = d[36];
    const stochK = d[30]; const stochD = d[31];
    const adx = d[29];
    const bbUpper = d[34]; const bbLower = d[35];
    const vol = d[8]; const avgVol = d[42];

    // 1. RSI (weight 2)
    if (rsi != null) {
        total += 2;
        if (rsi < 30) bullish += 2;  // oversold → buy
        else if (rsi < 45) bullish += 1;
        else if (rsi > 70) bearish += 2;  // overbought → sell
        else if (rsi > 55) bearish += 1;
    }

    // 2. MACD crossover (weight 2)
    if (macd != null && macdSig != null) {
        total += 2;
        if (macd > macdSig && macd > 0) bullish += 2;       // bullish crossover above 0
        else if (macd > macdSig) bullish += 1;       // bullish crossover below 0
        else if (macd < macdSig && macd < 0) bearish += 2;  // bearish crossover below 0
        else if (macd < macdSig) bearish += 1;
    }

    // 3. EMA 20 (weight 2)
    if (ema20 != null && price != null) {
        total += 2;
        const diff = (price - ema20) / ema20 * 100;
        if (diff > 3) bullish += 2;
        else if (diff > 0) bullish += 1;
        else if (diff < -3) bearish += 2;
        else bearish += 1;
    }

    // 4. Stochastic (weight 1)
    if (stochK != null && stochD != null) {
        total += 1;
        if (stochK < 20 && stochK > stochD) bullish += 1; // oversold + K crosses D
        else if (stochK > 80 && stochK < stochD) bearish += 1; // overbought + K drops
    }

    // 5. ADX trend confirmation (weight 1)
    if (adx != null && adx > 25) {
        total += 1;
        // ADX confirms existing trend direction from price change
        if (d[6] >= 0) bullish += 1;
        else bearish += 1;
    }

    // 6. Volume vs Average (weight 1)
    if (vol != null && avgVol != null && avgVol > 0) {
        const volRatio = vol / avgVol;
        if (volRatio > 1.5 && d[6] >= 0) { total += 1; bullish += 1; } // high vol + up
        if (volRatio > 1.5 && d[6] < 0) { total += 1; bearish += 1; } // high vol + down
    }

    // 7. Bollinger Bands (weight 1)
    if (bbLower != null && bbUpper != null && price != null) {
        total += 1;
        if (price <= bbLower) bullish += 1; // near lower band → buy
        else if (price >= bbUpper) bearish += 1; // near upper band → sell
    }

    if (total === 0) return { label: 'NEUTRAL', score: 50, bullishCount: 0, bearishCount: 0 };

    const score = Math.round((bullish / total) * 100);
    let label;
    if (score >= 75) label = 'STRONG BUY';
    else if (score >= 55) label = 'BUY';
    else if (score <= 25) label = 'STRONG SELL';
    else if (score <= 45) label = 'SELL';
    else label = 'NEUTRAL';

    return { label, score, bullishCount: bullish, bearishCount: bearish };
}


function formatMarketCap(val) {
    if (!val) return 'N/A';
    if (val >= 10000000000000) return `₹${(val / 10000000000000).toFixed(2)}L Cr`;
    if (val >= 100000000000) return `₹${(val / 10000000).toFixed(0)} Cr`;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${val.toLocaleString('en-IN')}`;
}


function getNextOpenTime(ist) {
    const day = ist.getUTCDay();
    let daysToAdd = 0;
    if (day === 0) daysToAdd = 1;
    else if (day === 6) daysToAdd = 2;
    else {
        const hours = ist.getUTCHours();
        const mins = ist.getUTCMinutes();
        if (hours * 60 + mins >= 15 * 60 + 30) daysToAdd = day === 5 ? 3 : 1;
    }
    return `${daysToAdd === 0 ? 'Today' : daysToAdd === 1 ? 'Tomorrow' : 'In ' + daysToAdd + ' days'} at 9:15 AM IST`;
}

module.exports = {
  getCached,
  setCache,
  CATEGORY_FILTERS,
  fetchFromTradingView,
  parseStockData,
  getNextOpenTime,
  FIELDS
};
