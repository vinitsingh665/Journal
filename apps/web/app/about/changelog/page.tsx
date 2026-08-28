export default function ChangelogPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Changelog</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: 500, margin: "0 auto" }}>
          Track every update, feature, and fix we ship.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 700, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        
        {/* Release 1.4.0 */}
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-secondary)", 
          borderRadius: "var(--radius-lg)", 
          padding: "var(--space-6)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <span style={{ 
              color: "#f97316", 
              border: "1px solid #f97316", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              fontSize: "12px", 
              fontWeight: 700 
            }}>
              v1.4.0
            </span>
            <span className="text-muted" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
              August 21, 2026
            </span>
          </div>

          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            TradingView Integration & AI Engine Upgrade 🧠 📈
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>NEW</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                View on TradingView — hover over any stock row to instantly open its live chart on TradingView
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>NEW</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                TradingView button available across Screener, Markets, Watchlist, Dashboard, Analytics, and Stock Modal
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>NEW</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                Smooth fade-in hover animation with gradient background, matching the platform's design language
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#431407", color: "#fb923c", border: "1px solid #7c2d12", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>IMPROVED</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                AI Engine upgraded from Llama 3.1 8B to OpenAI GPT-OSS-120B — a 120B parameter Mixture-of-Experts model
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#431407", color: "#fb923c", border: "1px solid #7c2d12", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>IMPROVED</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                Significantly smarter and more detailed AI-powered stock insights, sector analysis, and market forecasts
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#431407", color: "#fb923c", border: "1px solid #7c2d12", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>IMPROVED</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                AI-generated smart alert suggestions are now more accurate and context-aware
              </span>
            </li>
          </ul>
        </div>

        {/* Release 1.3.0 */}
        <div style={{ 
          background: "var(--bg-secondary)", 
          border: "1px solid var(--border-secondary)", 
          borderRadius: "var(--radius-lg)", 
          padding: "var(--space-6)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <span style={{ 
              color: "#f97316", 
              border: "1px solid #f97316", 
              padding: "2px 8px", 
              borderRadius: "4px", 
              fontSize: "12px", 
              fontWeight: 700 
            }}>
              v1.3.0
            </span>
            <span className="text-muted" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
              April 10, 2026
            </span>
          </div>

          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
            SEO & Performance Overhaul ⚡
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>NEW</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                Dynamic stock pages with Server-Side Rendering (SSR) for over 2,000 NSE/BSE stocks
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#052e16", color: "#4ade80", border: "1px solid #14532d", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>NEW</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                Public shared journals can now be indexed by Google with rich OpenGraph metadata
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#431407", color: "#fb923c", border: "1px solid #7c2d12", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>IMPROVED</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                Reduced client-side bundle size by 40%, significantly improving dashboard load times
              </span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <span style={{ background: "#431407", color: "#fb923c", border: "1px solid #7c2d12", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginTop: "2px", letterSpacing: "0.05em" }}>IMPROVED</span>
              <span style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "var(--text-sm)" }}>
                Database query optimizations for large journals with 5,000+ trades
              </span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
