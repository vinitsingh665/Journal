export interface FAQItem {
  question: string;
  answer: string;
}

export const LANDING_FAQS: FAQItem[] = [
  {
    question: "What makes TraderLabs the best trading journal for Indian traders?",
    answer: "TraderLabs is engineered specifically for the Indian financial markets. Unlike generic spreadsheets or foreign tools, TraderLabs natively supports NSE, BSE, MCX, Nifty, and BankNifty Options & Futures alongside Crypto. It features automated R-Multiple tracking, position sizing risk calculators, a dynamic P&L heatmap calendar, and an actionable Mistake Vault to stop emotional overtrading."
  },
  {
    question: "Can I journal Nifty, Bank Nifty, and FinNifty Option & Futures (F&O) trades?",
    answer: "Yes! TraderLabs is fully optimized for intraday and swing F&O traders. You can log Option Buying, Option Selling, Futures, and Equity setups with custom strike prices, stop-loss invalidation levels, and target ratios to uncover your exact win rate and profit expectancy by setup."
  },
  {
    question: "Which Indian stock brokers are supported for importing trades?",
    answer: "You can import trade logs via standard CSV exports from all top Indian brokers, including Zerodha Kite, Dhan, Groww, Angel One, Upstox, and Fyers. Direct automated sync for select brokers like Dhan is also actively rolling out."
  },
  {
    question: "How does TraderLabs eliminate overtrading and emotional revenge trades?",
    answer: "TraderLabs acts as an objective mirror for your trading psychology. By tagging emotional triggers (such as FOMO, revenge trading, sizing too large, or premature profit booking) in the Mistake Vault, the journal reveals the exact monetary and R-multiple cost of your leaks, keeping you disciplined."
  },
  {
    question: "What is R-Multiple tracking and why is it better than looking at P&L?",
    answer: "Profit and Loss in Rupees can be distorted by varying position sizes. R-Multiple standardizes every trade against your initial risk (e.g., +2R means you made twice your risk, while -1R means you respected your stop-loss). Tracking your R-Multiple lets you verify positive expectancy, even with a 40% win rate."
  },
  {
    question: "Is TraderLabs free to use?",
    answer: "Yes, TraderLabs is completely free during our public beta. You get full access to unlimited trade journaling, risk calculators, P&L heatmap analytics, and the Mistake Vault with no credit card required."
  }
];
