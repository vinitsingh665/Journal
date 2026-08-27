export const STRATEGIES = [
  "VCP",
  "Breakout",
  "Pullback",
  "Market Profile",
  "Volume Profile",
  "Order Flow",
  "Swing",
  "Intraday",
  "Gap Up/Down",
  "Mean Reversion",
  "Momentum",
  "Other",
] as const;

export const MARKET_CONDITIONS = [
  "Strong Bullish",
  "Bullish",
  "Neutral",
  "Bearish",
  "Strong Bearish",
  "Volatile",
  "Range-bound",
] as const;

export const EMOTIONAL_STATES = [
  "Confident",
  "Calm",
  "Excited",
  "Anxious",
  "Fearful",
  "Frustrated",
  "FOMO",
  "Revenge",
  "Neutral",
] as const;

export const EXCHANGES = ["NSE", "BSE", "NASDAQ", "NYSE", "CRYPTO"] as const;

export const ORDER_TYPES = ["MARKET", "LIMIT", "SL", "SL-M"] as const;

export const PRODUCT_TYPES = ["CNC", "MIS", "NRML"] as const;

export const NAV_ITEMS = [
  {
    section: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: "dashboard" },
      { name: "Trades", href: "/trades", icon: "trades" },
      { name: "Open Positions", href: "/positions", icon: "positions" },
      { name: "Journal", href: "/journal", icon: "journal" },
      { name: "Calendar", href: "/calendar", icon: "calendar" },
    ],
  },
  {
    section: "Analysis",
    items: [
      { name: "Analytics", href: "/analytics", icon: "analytics" },
      { name: "Mistakes", href: "/mistakes", icon: "mistakes" },
    ],
  },
  {
    section: "Tools",
    items: [
      { name: "Risk Calculator", href: "/risk-calculator", icon: "calculator" },
      { name: "Import Trades", href: "/import", icon: "import" },
      { name: "Screenshots", href: "/screenshots", icon: "screenshots" },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Settings", href: "/settings", icon: "settings" },
    ],
  },
] as const;
