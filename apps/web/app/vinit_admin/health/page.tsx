"use client";

import React, { useState, useEffect } from "react";

export default function AdminHealthPage() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + " IST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px", backgroundColor: "#09090b" }}>
      
      {/* Top Navbar Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid #27272a", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 12px", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }}></div>
            <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>SYSTEM ONLINE</span>
          </div>
          <div style={{ color: "#a1a1aa", fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>
            {timeStr || "Loading..."}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#3f3f46", overflow: "hidden" }}>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=f87171" alt="Admin" style={{ width: "100%", height: "100%" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Super Admin</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>System Health & Vitals</h1>
        <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Monitor server load, database health, and API latency.</p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        
        {/* Live Vitals Card */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 32px 0" }}>Live Vitals</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Primary Database Load */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>Primary Database Load</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>8%</span>
              </div>
              <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                <div style={{ width: "8%", height: "100%", backgroundColor: "#10b981", borderRadius: 3 }}></div>
              </div>
            </div>

            {/* Redis Cache Hit Rate */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>Redis Cache Hit Rate</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>95%</span>
              </div>
              <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                <div style={{ width: "95%", height: "100%", backgroundColor: "#10b981", borderRadius: 3 }}></div>
              </div>
            </div>

            {/* Background Workers */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>Background Workers</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>Running Normally</span>
              </div>
              <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                <div style={{ width: "100%", height: "100%", backgroundColor: "#10b981", borderRadius: 3 }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Latency Card */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 32px 0" }}>Global Latency</h2>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            
            {/* Circular Gauge */}
            <div style={{ position: "relative", width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: "rotate(-90deg)" }}>
                {/* Background circle */}
                <circle cx="80" cy="80" r="70" fill="none" stroke="#27272a" strokeWidth="8" />
                {/* Foreground circle (assuming it's very low/0 so it's a full circle, or almost 0) */}
                {/* Since latency is 0, we can just show a full green circle or minimal green. Let's make it look like a health ring */}
                <circle cx="80" cy="80" r="70" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="440" strokeDashoffset="0" />
              </svg>
              <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: "#10b981", lineHeight: 1 }}>0</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa", marginTop: 4 }}>MS</span>
              </div>
            </div>

            <p style={{ color: "#a1a1aa", fontSize: 13, textAlign: "center", margin: 0, lineHeight: 1.6, maxWidth: 200 }}>
              Average response time across all endpoints API.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
