export default function BugReportPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Report a Bug</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-8)", fontSize: "var(--text-lg)" }}>
        Found something that isn't working right? Let us know so we can fix it immediately. Your feedback helps us improve TraderLabs for everyone.
      </p>

      <div className="card card-body" style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>How to report a bug</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
          To help us resolve the issue quickly, please send us an email with the following details:
        </p>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          <li><strong>What happened:</strong> A brief description of the issue.</li>
          <li><strong>How to reproduce:</strong> Steps you took before the bug occurred.</li>
          <li><strong>Expected result:</strong> What you expected to happen instead.</li>
          <li><strong>Screenshots:</strong> If applicable, attach a screenshot of the error.</li>
        </ul>
        <a 
          href="mailto:bugs@traderlabs.in?subject=Bug Report - [Short Description here]" 
          className="btn btn-secondary"
          style={{ display: "inline-flex", textDecoration: "none", color: "var(--color-negative)", borderColor: "rgba(239, 68, 68, 0.2)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Email bugs@traderlabs.in
        </a>
      </div>
    </div>
  );
}
