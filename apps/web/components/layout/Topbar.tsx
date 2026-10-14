"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AiAssistant from "@/components/ai/AiAssistant";
import SnapshotTool from "@/components/layout/SnapshotTool";
import { useAppStore } from "@/stores/app-store";
import { MyBuddyCompanion } from "@/features/companion/MyBuddyCompanion";
import { PetGalleryDialog } from "@/features/companion/petdex/PetGalleryDialog";
import { useTheme } from "@/components/layout/ThemeProvider";
import "@/lib/i18n";

function getPageHeaderInfo(pathname: string, userName: string): { title: string; subtitle: string } {
  if (!pathname || pathname === "/" || pathname === "/dashboard") {
    return {
      title: "Dashboard",
      subtitle: `Welcome back, ${userName}. Here's your performance overview.`,
    };
  }
  if (pathname.startsWith("/trades/new")) {
    return {
      title: "New Trade",
      subtitle: "Log and execute a new trade record.",
    };
  }
  if (pathname.includes("/edit")) {
    return {
      title: "Edit Trade",
      subtitle: "Update trade executions and review details.",
    };
  }
  if (pathname.startsWith("/trades")) {
    return {
      title: "Trades",
      subtitle: "All your executed trades. Review each trade and learn from it.",
    };
  }
  if (pathname.startsWith("/positions") || pathname.startsWith("/open-positions")) {
    return {
      title: "Positions",
      subtitle: "Track live unrealized P&L and manage open trades.",
    };
  }
  if (pathname.startsWith("/analytics")) {
    return {
      title: "Analytics",
      subtitle: "In-depth metrics, win rates, and trading edge statistics.",
    };
  }
  if (pathname.startsWith("/calendar")) {
    return {
      title: "Calendar",
      subtitle: "Daily and monthly trading performance heatmap.",
    };
  }
  if (pathname.startsWith("/journal")) {
    return {
      title: "Journal",
      subtitle: "Daily notes, psychology logs, and market reflections.",
    };
  }
  if (pathname.startsWith("/mistakes")) {
    return {
      title: "Mistakes",
      subtitle: "Tag and analyze behavioral errors to protect capital.",
    };
  }
  if (pathname.startsWith("/calculator") || pathname.startsWith("/risk-calculator")) {
    return {
      title: "Risk Calculator",
      subtitle: "Size your position accurately based on risk tolerance.",
    };
  }
  if (pathname.startsWith("/import")) {
    return {
      title: "Import Trades",
      subtitle: "Bulk import trade logs via CSV or broker sync.",
    };
  }
  if (pathname.startsWith("/screenshots")) {
    return {
      title: "Screenshots",
      subtitle: "Visual gallery of trade setups and chart snapshots.",
    };
  }
  if (pathname.startsWith("/notes")) {
    return {
      title: "Notes",
      subtitle: "Strategy rules, watchlists, and quick reminders.",
    };
  }
  if (pathname.startsWith("/settings")) {
    return {
      title: "Settings",
      subtitle: "Manage account settings, brokers, and preferences.",
    };
  }

  // Fallback: capitalize the first route segment
  const segment = pathname.split("/").filter(Boolean)[0];
  if (segment) {
    const formatted = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return {
      title: formatted,
      subtitle: `Welcome back, ${userName}.`,
    };
  }

  return {
    title: "Dashboard",
    subtitle: `Welcome back, ${userName}. Here's your performance overview.`,
  };
}

export default function Topbar({ userName = "Trader", avatar = null, isGuest = false, userId, role }: { userName?: string, avatar?: string | null, isGuest?: boolean, userId?: string, role?: string }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const pageHeader = getPageHeaderInfo(pathname, userName);
  const companionKind = useAppStore(s => s.companionKind);
  const companionPet = useAppStore(s => s.companionPet);
  const pikoAccessory = useAppStore(s => s.pikoAccessory);
  const setCompanionConfig = useAppStore(s => s.setCompanionConfig);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileSidebar = useAppStore(s => s.toggleMobileSidebar);

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-hamburger-btn"
          onClick={toggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div>
          <div className="topbar-title">{pageHeader.title}</div>
          <div className="topbar-subtitle">{pageHeader.subtitle}</div>
        </div>
      </div>

      <div className="topbar-right">
        <button 
          className="companion-capsule-btn"
          onClick={() => setGalleryOpen(true)}
          title="Companion"
        >
          <img src="/companion-capsule.png" alt="Companion" draggable={false} />
        </button>

        {mounted && (
          <button 
            className="btn btn-secondary btn-sm topbar-theme-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 20,
              padding: "0 10px",
              height: "32px",
              color: "var(--text-secondary)"
            }}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        )}

        <div className="topbar-desktop-only">
          <SnapshotTool userId={userId} />
        </div>
        {!isGuest && (
          <div className="topbar-desktop-only">
            <AiAssistant />
          </div>
        )}

        {/* Admin Button */}
        {(role === "ADMIN" || role === "MEMBER") && (
          <Link href="/admin" className="btn btn-secondary topbar-desktop-only" style={{ borderRadius: "9999px", paddingLeft: "16px", paddingRight: "16px" }}>
            Admin
          </Link>
        )}

        {/* New Trade Button */}
        <Link href="/trades/new" className="btn btn-primary topbar-new-trade-btn" id="btn-new-trade">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="topbar-new-trade-text">New Trade</span>
        </Link>
      </div>

      {mounted && (
        <>
          <MyBuddyCompanion />
          <PetGalleryDialog
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
            currentKind={companionKind}
            currentPet={companionPet}
            currentAccessory={pikoAccessory}
            onConfirm={(selection, accessory) => {
              setCompanionConfig(selection.kind, selection.pet, accessory);
              setGalleryOpen(false);
            }}
          />
        </>
      )}
    </header>
  );
}
