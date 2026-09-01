"use client";

import Link from "next/link";
import { useState } from "react";
import AiAssistant from "@/components/ai/AiAssistant";
import SnapshotTool from "@/components/layout/SnapshotTool";

export default function Topbar({ userName = "Trader", avatar = null, isGuest = false, userId }: { userName?: string, avatar?: string | null, isGuest?: boolean, userId?: string }) {

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-subtitle">Welcome back, {userName}. Here&apos;s your performance overview.</div>
        </div>
      </div>

      <div className="topbar-right">
        <SnapshotTool userId={userId} />
        {!isGuest && <AiAssistant />}

        {/* New Trade Button */}
        <Link href="/dashboard/trades/new" className="btn btn-primary" id="btn-new-trade">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Trade
        </Link>
      </div>
    </header>
  );
}
