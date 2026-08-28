"use client";

export default function BugReportPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Report a Bug 🐛</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", maxWidth: 500, margin: "0 auto" }}>
          Found something broken? Help us fix it by providing details below.
        </p>
      </div>

      <div style={{ 
        background: "var(--bg-secondary)", 
        border: "1px solid var(--border-secondary)", 
        borderRadius: "var(--radius-lg)", 
        padding: "var(--space-6)", 
        width: "100%", 
        maxWidth: 700
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>YOUR NAME (OPTIONAL)</label>
            <input className="form-input" placeholder="e.g. Rahul Sharma" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>EMAIL (REQUIRED FOR UPDATES)</label>
            <input className="form-input" placeholder="you@example.com" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>BUG TITLE</label>
          <input className="form-input" placeholder="e.g. Chart not loading on Markets page" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>SEVERITY</label>
            <select className="form-select" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}>
              <option>Low — Minor visual issue</option>
              <option>Medium — Feature partially broken</option>
              <option>High — Feature completely broken</option>
              <option>Critical — App crashing / Data loss</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>AFFECTED PAGE</label>
            <select className="form-select" style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)" }}>
              <option>Select page...</option>
              <option>Dashboard</option>
              <option>Journal</option>
              <option>Analytics</option>
              <option>Settings</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
          <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>STEPS TO REPRODUCE</label>
          <textarea 
            className="form-input form-textarea" 
            placeholder="1. Go to Markets page 2. Click on RELIANCE 3. Scroll down to chart section 4. Chart shows blank" 
            style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 140 }}
          ></textarea>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>EXPECTED BEHAVIOR</label>
            <textarea 
              className="form-input form-textarea" 
              placeholder="What should happen?" 
              style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 80 }}
            ></textarea>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>ACTUAL BEHAVIOR</label>
            <textarea 
              className="form-input form-textarea" 
              placeholder="What actually happened?" 
              style={{ background: "var(--bg-primary)", borderColor: "var(--border-secondary)", minHeight: 80 }}
            ></textarea>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          style={{ 
            background: "#f97316", // Accent orange
            color: "#fff", 
            border: "none",
            padding: "10px 24px",
            fontWeight: 600
          }}
          onClick={(e) => e.preventDefault()}
        >
          Submit Bug Report
        </button>
      </div>
    </div>
  );
}
