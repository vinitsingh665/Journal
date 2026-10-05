"use client";

import { useEffect, useRef } from "react";

export function PresenceTracker() {
  // Keep a ref to the interval so we can clear/restart it cleanly
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const pingPresence = async () => {
      // Never ping when the tab is not visible — saves resources and DB connections
      if (document.visibilityState === "hidden") return;
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to ping presence", err);
      }
    };

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(pingPresence, 30 * 1000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User came back to the tab — ping immediately, then resume polling
        pingPresence();
        startInterval();
      } else {
        // Tab is hidden — pause the interval to avoid wasted requests
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    // Ping immediately on mount and start the polling interval
    pingPresence();
    startInterval();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return null;
}
