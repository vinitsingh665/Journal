"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const toggleMobileSidebar = useAppStore((s) => s.toggleMobileSidebar);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);

  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const isTrades = pathname.startsWith("/trades") && pathname !== "/trades/new";
  const isPositions = pathname.startsWith("/positions");
  const isJournal = pathname.startsWith("/journal");

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <Link
        href="/dashboard"
        onClick={() => setMobileSidebarOpen(false)}
        className={cn("mobile-nav-item", isDashboard && "active")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Overview</span>
      </Link>

      <Link
        href="/trades"
        onClick={() => setMobileSidebarOpen(false)}
        className={cn("mobile-nav-item", isTrades && "active")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
        <span>Trades</span>
      </Link>

      {/* Center Action Button: New Trade */}
      <Link
        href="/trades/new"
        onClick={() => setMobileSidebarOpen(false)}
        className="mobile-nav-center-btn"
        title="Add New Trade"
        aria-label="Add New Trade"
      >
        <div className="mobile-nav-center-inner">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </Link>

      <Link
        href="/positions"
        onClick={() => setMobileSidebarOpen(false)}
        className={cn("mobile-nav-item", isPositions && "active")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <span>Positions</span>
      </Link>

      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="mobile-nav-item"
        aria-label="Open More Menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
        <span>Menu</span>
      </button>
    </nav>
  );
}
