import Link from "next/link";

export default function ExpiredLinkPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "var(--bg-default)", textAlign: "center", padding: "var(--space-6)" }}>
      <div style={{ background: "var(--bg-primary)", padding: "var(--space-10)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", maxWidth: 500, width: "100%" }}>
        <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }}>⌛</div>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-3)", color: "var(--text-primary)" }}>
          Link Expired
        </h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-8)", lineHeight: 1.6 }}>
          This shared dashboard snapshot has expired. Links are only valid for 24 hours to protect the user's data privacy.
        </p>
        <Link href="/" style={{ display: "inline-block", background: "var(--accent-primary)", color: "#fff", padding: "12px 24px", borderRadius: 8, fontWeight: 600, textDecoration: "none", transition: "background 0.2s" }} className="hover:bg-accent-hover">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
