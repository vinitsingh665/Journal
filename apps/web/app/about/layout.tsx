import { getCurrentUser } from "@/lib/auth";
import React from "react";
import Link from "next/link";
import { AboutHeaderAction } from "./AboutHeaderAction";

export default async function AboutLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUser();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Simple Header */}
      <header style={{ 
        borderBottom: "1px solid var(--border-secondary)", 
        backgroundColor: "var(--bg-secondary)",
        padding: "var(--space-4) var(--space-6)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--text-primary)", fontWeight: 800, fontSize: "var(--text-lg)" }}>
            TraderLabs
          </Link>
          <AboutHeaderAction userId={userId} />
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-8) var(--space-6)" }}>
        {children}
      </main>

      {/* Simple Footer */}
      <footer style={{ 
        borderTop: "1px solid var(--border-secondary)", 
        padding: "var(--space-6)", 
        textAlign: "center",
        marginTop: "var(--space-8)"
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          © {new Date().getFullYear()} TraderLabs. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
