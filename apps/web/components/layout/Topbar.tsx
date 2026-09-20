"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import AiAssistant from "@/components/ai/AiAssistant";
import SnapshotTool from "@/components/layout/SnapshotTool";
import { useAppStore } from "@/stores/app-store";
import { MyBuddyCompanion } from "@/features/companion/MyBuddyCompanion";
import { PetGalleryDialog } from "@/features/companion/petdex/PetGalleryDialog";
import { useTheme } from "@/components/layout/ThemeProvider";
import "@/lib/i18n";

export default function Topbar({ userName = "Trader", avatar = null, isGuest = false, userId, role }: { userName?: string, avatar?: string | null, isGuest?: boolean, userId?: string, role?: string }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const companionKind = useAppStore(s => s.companionKind);
  const companionPet = useAppStore(s => s.companionPet);
  const pikoAccessory = useAppStore(s => s.pikoAccessory);
  const setCompanionConfig = useAppStore(s => s.setCompanionConfig);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">Welcome back, {userName}. Here&apos;s your performance overview.</div>
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
            className="btn btn-secondary btn-sm"
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

        <SnapshotTool userId={userId} />
        {!isGuest && <AiAssistant />}

        {/* Admin Button */}
        {(role === "ADMIN" || role === "MEMBER") && (
          <Link href="/admin" className="btn btn-secondary" style={{ borderRadius: "9999px", paddingLeft: "20px", paddingRight: "20px" }}>
            Admin
          </Link>
        )}

        {/* New Trade Button */}
        <Link href="/trades/new" className="btn btn-primary" id="btn-new-trade">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Trade
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
