"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AboutHeaderAction({ userId }: { userId?: string | null }) {
  const pathname = usePathname();

  if (pathname === "/about/faq") {
    return (
      <Link href="/about/contact" style={{ textDecoration: "none", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
        Back to Contact
      </Link>
    );
  }

  if (userId) {
    return (
      <Link href="/settings?tab=About" style={{ textDecoration: "none", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
        Back to Settings
      </Link>
    );
  }

  return (
    <Link href="/" style={{ textDecoration: "none", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
      Back to Home
    </Link>
  );
}
