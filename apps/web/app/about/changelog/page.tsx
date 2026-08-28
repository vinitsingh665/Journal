export default function ChangelogPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, margin: 0 }}>Changelog</h1>
        <span className="badge badge-long">v1.2.0</span>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-8)", fontSize: "var(--text-lg)" }}>
        New updates and improvements to TraderLabs.
      </p>

      <div style={{ position: "relative", paddingLeft: "var(--space-6)" }}>
        {/* Vertical timeline line */}
        <div style={{ 
          position: "absolute", 
          left: "11px", 
          top: "8px", 
          bottom: 0, 
          width: "2px", 
          background: "var(--border-secondary)",
          zIndex: 0
        }}></div>

        {/* Update 1 */}
        <div style={{ position: "relative", marginBottom: "var(--space-8)", zIndex: 1 }}>
          <div style={{ 
            position: "absolute", 
            left: "calc(-1 * var(--space-6) + 7px)", 
            top: "6px", 
            width: "10px", 
            height: "10px", 
            borderRadius: "50%", 
            background: "var(--accent-primary)",
            boxShadow: "0 0 0 4px var(--bg-primary)"
          }}></div>
          <div className="text-muted" style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>August 2026</div>
          <div className="card card-body">
            <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Public Shared Journals & SEO Boost</h3>
            <ul style={{ paddingLeft: "var(--space-4)", margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <li><strong>New Feature:</strong> Share your trading journal securely via short links (e.g. traderlabs.in/s/token).</li>
              <li><strong>New Feature:</strong> Visitors can view individual shared trade details without logging in.</li>
              <li><strong>Improvement:</strong> Added comprehensive SEO metadata, sitemaps, and Twitter cards for better social sharing.</li>
              <li><strong>Improvement:</strong> Added "About" section in settings with legal policies and contact support.</li>
            </ul>
          </div>
        </div>

        {/* Update 2 */}
        <div style={{ position: "relative", marginBottom: "var(--space-8)", zIndex: 1 }}>
          <div style={{ 
            position: "absolute", 
            left: "calc(-1 * var(--space-6) + 7px)", 
            top: "6px", 
            width: "10px", 
            height: "10px", 
            borderRadius: "50%", 
            background: "var(--text-muted)",
            boxShadow: "0 0 0 4px var(--bg-primary)"
          }}></div>
          <div className="text-muted" style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--space-2)" }}>July 2026</div>
          <div className="card card-body">
            <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)" }}>Initial Release (v1.0.0)</h3>
            <ul style={{ paddingLeft: "var(--space-4)", margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <li><strong>Core:</strong> Released the core TraderLabs journaling platform.</li>
              <li><strong>Feature:</strong> Track entry/exit points, R-multiples, and P&L.</li>
              <li><strong>Feature:</strong> AI Trade Insights and Risk Management calculator.</li>
              <li><strong>Feature:</strong> Mistake tracking and emotional state logging.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
