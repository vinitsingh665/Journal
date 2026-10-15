import { getCurrentUser } from "@/lib/auth";
import React from "react";
import Link from "next/link";
import { AboutHeaderAction } from "./AboutHeaderAction";

export default async function AboutLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUser();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <style>{`
        .about-header {
          border-bottom: 1px solid var(--border-secondary);
          background-color: var(--bg-secondary);
          padding: 14px 24px;
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(8px);
        }
        .about-header-inner {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .about-main {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        .about-footer {
          border-top: 1px solid var(--border-secondary);
          padding: 24px;
          text-align: center;
          margin-top: 32px;
        }
        @media (max-width: 640px) {
          .about-header {
            padding: 12px 14px !important;
          }
          .about-main {
            padding: 16px 12px !important;
          }
          .about-footer {
            padding: 20px 14px !important;
            margin-top: 20px !important;
          }
        }
      `}</style>

      {/* Simple Header */}
      <header className="about-header">
        <div className="about-header-inner">
          <Link href="/" style={{ textDecoration: "none", color: "var(--text-primary)", fontWeight: 800, fontSize: "var(--text-lg)", letterSpacing: "-0.02em" }}>
            TraderLabs
          </Link>
          <AboutHeaderAction userId={userId} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="about-main">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="about-footer">
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          © {new Date().getFullYear()} TraderLabs. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
