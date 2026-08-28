export default function ContactPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Contact Support</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-8)", fontSize: "var(--text-lg)" }}>
        We're here to help! Reach out to us if you have any questions or need assistance with your TraderLabs account.
      </p>

      <div className="card card-body" style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Email Support</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
          For general inquiries, account issues, or billing support, the best way to reach us is via email. We typically respond within 24 hours on business days.
        </p>
        <a 
          href="mailto:support@traderlabs.in" 
          className="btn btn-primary"
          style={{ display: "inline-flex", textDecoration: "none" }}
        >
          support@traderlabs.in
        </a>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Business Hours</h2>
        <ul style={{ color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: "var(--space-4)" }}>
          <li><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM (IST)</li>
          <li><strong>Saturday:</strong> 10:00 AM - 2:00 PM (IST)</li>
          <li><strong>Sunday & Public Holidays:</strong> Closed</li>
        </ul>
      </div>
    </div>
  );
}
