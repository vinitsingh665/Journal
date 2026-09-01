"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DhanSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/trades/sync/dhan", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to sync Dhan trades.");
      } else {
        alert(data.message || `Synced! Found ${data.newExecutions} new executions, created ${data.tradesCreated} trades.`);
        router.refresh();
      }
    } catch (e) {
      alert("An error occurred while syncing.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync} 
      disabled={isSyncing} 
      className="btn btn-secondary" 
      style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "6px",
        borderColor: "rgba(16, 185, 129, 0.4)",
        color: "#10b981",
        background: "rgba(16, 185, 129, 0.05)"
      }}
    >
      {isSyncing ? (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
      )}
      {isSyncing ? "Syncing Dhan..." : "Sync Dhan Trades"}
    </button>
  );
}
