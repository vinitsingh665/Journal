export default function TermsPage() {
  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>Terms of Service</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-8)", fontSize: "var(--text-sm)" }}>
        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="card card-body" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          By accessing and using TraderLabs ("we", "our", or "us"), you accept and agree to be bound by the terms and provision of this agreement. 
          If you do not agree to abide by these terms, please do not use this service.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>2. Educational Purpose Only</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          TraderLabs is a journaling and analytics platform designed to help you track your own trading performance. 
          <strong>We are not financial advisors.</strong> None of the data, metrics, AI insights, or information provided by the platform should be construed as financial, investment, or trading advice. You are solely responsible for your trading decisions and any resulting financial losses.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>3. User Accounts and Data</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          To use certain features of the service, you must register for an account. You agree to provide accurate information and to keep it updated.
          You are responsible for maintaining the confidentiality of your account password. 
          You retain all rights to the trading data you input into the platform. By using the platform, you grant us the right to store and process this data to provide the service to you.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>4. Acceptable Use</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          You agree not to use the service in any way that causes, or may cause, damage to the service or impairment of the availability or accessibility of the service.
          Automated scraping, reverse engineering, or exploiting the API without written consent is strictly prohibited.
        </p>

        <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>5. Termination</h2>
        <p style={{ marginBottom: "var(--space-5)" }}>
          We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  );
}
