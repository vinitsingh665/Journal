"use client";

import React, { useState } from "react";

// Types
type TagType = "NEW" | "IMPROVED" | "FIXED";

interface ChangelogItem {
  tag: TagType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  icon: string;
  items: ChangelogItem[];
}

const releases: Release[] = [
  {
    version: "v1.5.0",
    date: "September 16, 2026",
    title: "Introducing Premium Sticky Notes",
    icon: "📝",
    items: [
      { tag: "NEW", text: "Added a brand new Sticky Notes feature with a premium, draggable interface" },
      { tag: "NEW", text: "Sticky Notes can be dynamically pinned to any specific page across the platform" },
      { tag: "NEW", text: "Rich text formatting support including custom text colors, background colors, and typography" },
      { tag: "NEW", text: "Real-time synchronization ensures pinned notes are instantly updated" }
    ]
  },
  {
    version: "v1.4.0",
    date: "August 30, 2026",
    title: "Trade Journal Upgrades & Safety Checks",
    icon: "🛡️",
    items: [
      { tag: "NEW", text: "Added 'Deleted' status tracking for archived trades so they show up distinctly in your journal with custom badges" },
      { tag: "IMPROVED", text: "The Trade Journey timeline now seamlessly connects deleted events and displays the date, time, and live price upon deletion" },
      { tag: "FIXED", text: "Added strict frontend and backend validation to prevent scaling out (exiting) more shares than you currently hold in a trade" },
      { tag: "FIXED", text: "Fixed an issue allowing fractional decimal quantities to be entered for non-crypto assets" }
    ]
  },
  {
    version: "v1.3.0",
    date: "August 28, 2026",
    title: "Smarter AI Assistant",
    icon: "🤖",
    items: [
      { tag: "NEW", text: "The AI Assistant can now delete trades directly via natural language commands" },
      { tag: "IMPROVED", text: "Refactored the AI command router to simplify intent processing and execution logic for better reliability" },
      { tag: "FIXED", text: "Explicitly instructed the AI not to hallucinate 'Exit Trade' buttons, and correctly prompt for missing symbols instead of closing chats" }
    ]
  },
  {
    version: "v1.2.0",
    date: "August 26, 2026",
    title: "Global Currency & Chart Stability",
    icon: "💱",
    items: [
      { tag: "FIXED", text: "Fixed currency conversion (USD/INR) across the Calendar, Analytics, Trades, Journal, Dashboard P&L, and Chart formatting" },
      { tag: "FIXED", text: "Fixed an edge case bug where missing price candles affected the Y-axis scale and chart rendering" }
    ]
  },
  {
    version: "v1.1.0",
    date: "August 24, 2026",
    title: "Trading Engine Foundations",
    icon: "⚙️",
    items: [
      { tag: "NEW", text: "Added initial support for scaling in and out of positions via executions API" },
      { tag: "IMPROVED", text: "Enhanced accuracy of R-Multiple and P&L calculations on partially closed trades" }
    ]
  },
  {
    version: "v1.0.0",
    date: "August 22, 2026",
    title: "The Beginning",
    icon: "🚀",
    items: [
      { tag: "NEW", text: "Initial platform launch! Started building the most advanced AI-powered trading journal." }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div style={{
      minHeight: "100vh",
      padding: "var(--space-8) var(--space-4)",
      background: "radial-gradient(ellipse at top, rgba(16, 185, 129, 0.05), transparent 50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-12)", animation: "fadeInDown 0.6s ease-out" }}>
        <div style={{ 
          display: "inline-block", 
          padding: "6px 16px", 
          borderRadius: "999px", 
          background: "rgba(16, 185, 129, 0.1)", 
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "#10b981",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          marginBottom: "var(--space-4)"
        }}>
          What's New
        </div>
        <h1 style={{ 
          fontSize: "3rem", 
          fontWeight: 800, 
          letterSpacing: "-1px",
          marginBottom: "var(--space-4)",
          background: "linear-gradient(to right, #ffffff, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Changelog
        </h1>
        <p style={{ 
          color: "var(--text-secondary)", 
          fontSize: "1.125rem", 
          maxWidth: "500px", 
          margin: "0 auto",
          lineHeight: 1.6 
        }}>
          New updates and improvements to help you plan, execute, and analyze your trades better.
        </p>
      </div>

      {/* Timeline Layout */}
      <div style={{ position: "relative", width: "100%", maxWidth: "800px" }}>
        {/* Vertical Line */}
        <div style={{
          position: "absolute",
          top: "40px",
          bottom: "0",
          left: "31px",
          width: "2px",
          background: "linear-gradient(to bottom, rgba(16, 185, 129, 0.5), rgba(255,255,255,0.05) 80%)",
          zIndex: 0
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {releases.map((release, index) => (
            <ReleaseCard key={release.version} release={release} index={index} />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ReleaseCard({ release, index }: { release: Release; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{ 
        position: "relative", 
        paddingLeft: "64px",
        animation: `fadeInUp 0.5s ease-out forwards`
      }}
    >
      {/* Timeline Dot */}
      <div style={{
        position: "absolute",
        left: "24px",
        top: "32px",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        background: index === 0 ? "#10b981" : "var(--bg-primary)",
        border: `3px solid ${index === 0 ? "#059669" : "var(--border-primary)"}`,
        boxShadow: index === 0 ? "0 0 15px rgba(16, 185, 129, 0.6)" : "none",
        zIndex: 1,
        transition: "all 0.3s ease"
      }} />

      {/* Card Content */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-secondary)",
          borderRadius: "16px",
          padding: "32px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: isHovered 
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 15px rgba(16, 185, 129, 0.05)" 
            : "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ 
              background: "rgba(255, 255, 255, 0.05)", 
              padding: "6px 12px", 
              borderRadius: "8px", 
              fontSize: "14px", 
              fontWeight: 700,
              color: "var(--text-primary)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              {release.version}
            </div>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
              {release.date}
            </span>
          </div>
        </div>

        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: 700, 
          color: "var(--text-primary)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          {release.title} <span>{release.icon}</span>
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {release.items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ marginTop: "2px" }}>
                <TagBadge type={item.tag} />
              </div>
              <span style={{ 
                color: "var(--text-secondary)", 
                lineHeight: 1.6, 
                fontSize: "15px",
                flex: 1 
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TagBadge({ type }: { type: TagType }) {
  let color = "";
  let bg = "";
  let border = "";

  switch (type) {
    case "NEW":
      color = "#4ade80"; // green-400
      bg = "rgba(74, 222, 128, 0.1)";
      border = "rgba(74, 222, 128, 0.2)";
      break;
    case "IMPROVED":
      color = "#60a5fa"; // blue-400
      bg = "rgba(96, 165, 250, 0.1)";
      border = "rgba(96, 165, 250, 0.2)";
      break;
    case "FIXED":
      color = "#f87171"; // red-400
      bg = "rgba(248, 113, 113, 0.1)";
      border = "rgba(248, 113, 113, 0.2)";
      break;
  }

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: 800,
      letterSpacing: "0.5px",
      color,
      background: bg,
      border: `1px solid ${border}`,
      minWidth: "75px" // align texts nicely
    }}>
      {type}
    </span>
  );
}
