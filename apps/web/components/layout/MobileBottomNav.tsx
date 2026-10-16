"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  userName?: string;
  userEmail?: string;
  avatar?: string | null;
  isGuest?: boolean;
}

export default function MobileBottomNav({
  userName = "Trader",
  userEmail = "",
  avatar = null,
  isGuest = false,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close profile sheet on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  // Lock body scroll when profile sheet is open
  useEffect(() => {
    if (profileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setProfileOpen(false);
    router.push('/login');
    router.refresh();
  };

  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const isTrades = pathname.startsWith("/trades") && pathname !== "/trades/new";
  const isPositions = pathname.startsWith("/positions");

  return (
    <>
      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <Link
          href="/dashboard"
          onClick={() => {
            setProfileOpen(false);
            setMobileSidebarOpen(false);
          }}
          className={cn("mobile-nav-item", isDashboard && !profileOpen && "active")}
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
          onClick={() => {
            setProfileOpen(false);
            setMobileSidebarOpen(false);
          }}
          className={cn("mobile-nav-item", isTrades && !profileOpen && "active")}
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
          onClick={() => {
            setProfileOpen(false);
            setMobileSidebarOpen(false);
          }}
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
          onClick={() => {
            setProfileOpen(false);
            setMobileSidebarOpen(false);
          }}
          className={cn("mobile-nav-item", isPositions && !profileOpen && "active")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Positions</span>
        </Link>

        {/* Profile Tab (Replaces Menu) */}
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          className={cn("mobile-nav-item", profileOpen && "active")}
          aria-label="Open Profile"
        >
          {avatar ? (
            <div className="mobile-nav-profile-thumb">
              <img src={avatar} alt={userName} />
            </div>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
          <span>Profile</span>
        </button>
      </nav>

      {/* ─── MOBILE PROFILE BOTTOM SHEET ─── */}
      {profileOpen && (
        <>
          <div 
            className="mobile-profile-backdrop"
            onClick={() => setProfileOpen(false)}
            aria-hidden="true"
          />

          <div className="mobile-profile-sheet" role="dialog" aria-modal="true" aria-label="User Profile">
            {/* Grab Handle */}
            <div className="mobile-profile-handle-bar" onClick={() => setProfileOpen(false)}>
              <div className="mobile-profile-handle" />
            </div>

            {/* Header with Title & Close button */}
            <div className="mobile-profile-header">
              <span className="mobile-profile-title">Account</span>
              <button 
                type="button"
                onClick={() => setProfileOpen(false)}
                className="mobile-profile-close-btn"
                aria-label="Close Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Profile User Card: DP, Name, Gmail/Email */}
            <div className="mobile-profile-user-card">
              <div className="mobile-profile-avatar-wrap">
                {avatar ? (
                  <img src={avatar} alt={userName} className="mobile-profile-avatar-img" />
                ) : (
                  <div className="mobile-profile-avatar-fallback">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="mobile-profile-user-details">
                <div className="mobile-profile-name-row">
                  <h3 className="mobile-profile-user-name">{userName}</h3>
                  {isGuest && <span className="mobile-profile-guest-badge">GUEST</span>}
                </div>
                <p className="mobile-profile-user-email">
                  {userEmail || "No email linked"}
                </p>
              </div>
            </div>

            {/* Actions: Settings and Logout */}
            <div className="mobile-profile-actions">
              {/* Settings Button */}
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="mobile-profile-action-btn settings-btn"
              >
                <div className="mobile-profile-action-left">
                  <div className="mobile-profile-action-icon settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                  <div className="mobile-profile-action-text">
                    <span className="mobile-profile-action-label">Settings</span>
                    <span className="mobile-profile-action-sublabel">Preferences, trading style, capital</span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-profile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="mobile-profile-action-btn logout-btn"
              >
                <div className="mobile-profile-action-left">
                  <div className="mobile-profile-action-icon logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </div>
                  <div className="mobile-profile-action-text">
                    <span className="mobile-profile-action-label logout-text">Log Out</span>
                    <span className="mobile-profile-action-sublabel">Sign out from your account</span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-profile-chevron">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
