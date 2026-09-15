"use client";

import { useEffect } from "react";

export function PresenceTracker() {
  useEffect(() => {
    // Function to ping the server
    const pingPresence = async () => {
      try {
        await fetch('/api/presence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (err) {
        console.error("Failed to ping presence", err);
      }
    };

    // Ping immediately on mount
    pingPresence();

    // Then ping every 30 seconds
    const interval = setInterval(pingPresence, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything visible
  return null;
}
