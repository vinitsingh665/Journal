"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AboutHeaderAction({ userId }: { userId?: string | null }) {
  const pathname = usePathname();

  let href = "/";
  let label = "Home";

  if (pathname === "/about/faq") {
    href = "/about/contact";
    label = "Contact";
  } else if (userId) {
    href = "/settings?tab=About";
    label = "Settings";
  }

  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        textDecoration: "none",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        color: "var(--text-secondary)",
        padding: "6px 12px",
        borderRadius: "9999px",
        border: "1px solid var(--border-secondary)",
        background: "var(--bg-primary)",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap"
      }}
    >
      <ArrowLeft size={13} />
      <span>{label}</span>
    </Link>
  );
}
