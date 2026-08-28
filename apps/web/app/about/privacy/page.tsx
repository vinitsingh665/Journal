export default function PrivacyPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-8)", fontSize: "var(--text-sm)" }}>
        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="card card-body" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        <p style={{ marginBottom: "var(--space-5)" }}>
          Your privacy is critically important to us. At TraderLabs, we follow a few fundamental principles:
          We don't ask for personal information unless we truly need it, we don't share your personal information except to comply with the law, 
          and we don't store personal information on our servers unless required for the on-going operation of our services.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>1. Data Collection</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          When you register for an account, we collect your email address and name. When you use the platform, we collect the trade data you input (symbols, prices, execution times, notes).
          We also collect usage statistics (like page views) to help us understand how the platform is being used and how we can improve it.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>2. How We Use Your Data</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          The trade data you provide is used exclusively to generate analytics, dashboards, and insights for your own personal viewing. 
          We do not sell, rent, or lease your trading data or personal information to third parties under any circumstances.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>3. Data Security</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          We implement a variety of security measures to maintain the safety of your personal information. All sensitive information you supply is transmitted via Secure Socket Layer (SSL) technology and then encrypted in our databases.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>4. Your Rights (Data Deletion)</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          You have the right to request the complete deletion of your account and all associated data at any time. You can do this directly from the "Security" tab in your account Settings. 
          Upon deletion, all your trade data and personal info will be permanently erased from our production databases.
        </p>
      </div>
    </div>
  );
}
