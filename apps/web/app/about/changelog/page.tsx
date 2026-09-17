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
  color: string;
  indent: number;
  items: ChangelogItem[];
}

const releases: Release[] = [
  {
    version: "v1.5.0",
    date: "SEP 16, 2026",
    title: "Introducing Premium Sticky Notes",
    color: "#3b82f6", // Blue
    indent: 0,
    items: [
      { tag: "NEW", text: "Added a brand new Sticky Notes feature with a premium, draggable interface" },
      { tag: "NEW", text: "Sticky Notes can be dynamically pinned to any specific page across the platform" },
      { tag: "NEW", text: "Rich text formatting support including custom text colors, background colors, and typography" },
      { tag: "NEW", text: "Real-time synchronization ensures pinned notes are instantly updated" }
    ]
  },
  {
    version: "v1.4.0",
    date: "AUG 30, 2026",
    title: "Trade Journal Upgrades & Safety Checks",
    color: "#ef4444", // Red
    indent: 1,
    items: [
      { tag: "NEW", text: "Added 'Deleted' status tracking for archived trades so they show up distinctly in your journal with custom badges" },
      { tag: "IMPROVED", text: "The Trade Journey timeline now seamlessly connects deleted events and displays the date, time, and live price upon deletion" },
      { tag: "FIXED", text: "Added strict frontend and backend validation to prevent scaling out (exiting) more shares than you currently hold in a trade" },
      { tag: "FIXED", text: "Fixed an issue allowing fractional decimal quantities to be entered for non-crypto assets" }
    ]
  },
  {
    version: "v1.3.0",
    date: "AUG 28, 2026",
    title: "Smarter AI Assistant",
    color: "#10b981", // Green
    indent: 2,
    items: [
      { tag: "NEW", text: "The AI Assistant can now delete trades directly via natural language commands" },
      { tag: "IMPROVED", text: "Refactored the AI command router to simplify intent processing and execution logic for better reliability" },
      { tag: "FIXED", text: "Explicitly instructed the AI not to hallucinate 'Exit Trade' buttons, and correctly prompt for missing symbols instead of closing chats" }
    ]
  },
  {
    version: "v1.2.0",
    date: "AUG 26, 2026",
    title: "Global Currency & Chart Stability",
    color: "#a855f7", // Purple
    indent: 1,
    items: [
      { tag: "FIXED", text: "Fixed currency conversion (USD/INR) across the Calendar, Analytics, Trades, Journal, Dashboard P&L, and Chart formatting" },
      { tag: "FIXED", text: "Fixed an edge case bug where missing price candles affected the Y-axis scale and chart rendering" }
    ]
  },
  {
    version: "v1.1.0",
    date: "AUG 24, 2026",
    title: "Trading Engine Foundations",
    color: "#f59e0b", // Orange
    indent: 0,
    items: [
      { tag: "NEW", text: "Added initial support for scaling in and out of positions via executions API" },
      { tag: "IMPROVED", text: "Enhanced accuracy of R-Multiple and P&L calculations on partially closed trades" }
    ]
  },
  {
    version: "v1.0.0",
    date: "AUG 22, 2026",
    title: "The Beginning",
    color: "#6b7280", // Gray
    indent: 1,
    items: [
      { tag: "NEW", text: "Initial platform launch! Started building the most advanced AI-powered trading journal." }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="changelog-root" style={{
      width: "100vw",
      position: "relative",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "calc(-1 * var(--space-8))", // Overcome layout padding
      minHeight: "100vh",
      backgroundColor: "#090a0f", // Very dark matching image
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
      display: "flex",
      color: "#fff",
      overflowX: "hidden"
    }}>
      
      {/* Background Ambient Glows */}
      <div style={{ position: "fixed", top: "20%", left: "30%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "10%", right: "10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(239,68,68,0.03) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Left Panel */}
      <div className="changelog-left-panel" style={{
        width: "40%",
        minWidth: "350px",
        padding: "160px 40px 80px 80px", // Align top padding with right side
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        zIndex: 10
      }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#94a3b8",
          marginBottom: "16px"
        }}>
          Product Updates
        </div>
        
        <h1 style={{ 
          fontSize: "clamp(3.5rem, 6vw, 5rem)", 
          fontWeight: 700, 
          letterSpacing: "-2px",
          lineHeight: 1.1,
          marginBottom: "24px"
        }}>
          What's <span style={{ color: "#64748b" }}>New</span>
        </h1>
        
        <p style={{ 
          color: "#94a3b8", 
          fontSize: "1.125rem", 
          lineHeight: 1.6,
          maxWidth: "340px",
          marginBottom: "60px"
        }}>
          Small changes. A better experience.<br />
          Here's what we've been working on.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#94a3b8", fontSize: "0.875rem" }}>
          <div style={{ 
            width: "36px", height: "36px", 
            borderRadius: "50%", 
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.02)"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          Scroll to explore
        </div>

        <div className="changelog-footer-nav" style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          fontSize: "11px",
          letterSpacing: "3px",
          fontWeight: 600,
          color: "#475569"
        }}>
          <div>BUILD</div>
          <div>CREATE</div>
          <div>IMPROVE</div>
          <div>REPEAT</div>
          <div style={{ width: "24px", height: "1px", background: "#475569", marginTop: "8px" }} />
        </div>
      </div>

      {/* Right Panel - Timeline */}
      <div className="changelog-right-panel" style={{
        flex: 1,
        padding: "160px 80px 140px 0", // Ensure top aligns with left panel
        position: "relative",
        zIndex: 1
      }}>
        {releases.map((release, index) => {
          const prevRelease = index > 0 ? releases[index - 1] : null;
          return (
            <TimelineNode 
              key={release.version} 
              release={release} 
              prevRelease={prevRelease}
              isFirst={index === 0}
              isLast={index === releases.length - 1}
            />
          );
        })}
        
        {/* "More to come" node */}
        <TimelineNode 
          release={{
            version: "",
            date: "More to come",
            title: "We're just getting started.",
            color: "#475569",
            indent: releases[releases.length - 1].indent,
            items: []
          }} 
          prevRelease={releases[releases.length - 1]}
          isFirst={false}
          isLast={true}
          isEndNode={true}
        />
      </div>
      
      <style>{`
        .timeline-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .timeline-card:hover {
          transform: translateY(-4px);
        }
        @media (max-width: 1024px) {
          .changelog-root {
             flex-direction: column !important;
          }
          .changelog-left-panel {
             width: 100% !important;
             height: auto !important;
             position: relative !important;
             padding: 60px 40px !important;
          }
          .changelog-footer-nav {
             display: none !important;
          }
          .changelog-right-panel {
             padding: 40px 20px 80px 20px !important;
             overflow: hidden;
          }
        }
        @media (max-width: 600px) {
          .changelog-card-content {
             padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

function TimelineNode({ 
  release, 
  prevRelease, 
  isFirst, 
  isLast,
  isEndNode = false
}: { 
  release: Release; 
  prevRelease: Release | null; 
  isFirst: boolean;
  isLast: boolean;
  isEndNode?: boolean;
}) {
  // Layout constants
  const BASE_X = 60;        // x position of indent=0 nodes
  const INDENT_STEP = 140;  // px per indent level

  const currentX = BASE_X + release.indent * INDENT_STEP;
  const prevX = prevRelease ? BASE_X + prevRelease.indent * INDENT_STEP : currentX;

  // The dot sits at this Y from the top of its row
  const DOT_Y = 72;
  // Node circle radius (matches the big circle in the image ~32px radius)
  const NODE_R = 32;
  // Curve corner radius for the S-curves
  const CURVE_R = 40;
  // Gap between node edge and card left edge
  const CARD_GAP = 60;

  // Line style: very thin, muted
  const LINE_COLOR = "rgba(255,255,255,0.18)";
  const LINE_WIDTH = "2";

  // ── SVG path logic ─────────────────────────────────────────────
  // The incoming path draws the connector FROM the previous node
  // down to this node. Strategy:
  //   - Straight vertical drop from prevX at y=0 down to the curve start
  //   - Bezier/quadratic curve turning horizontally
  //   - Straight horizontal run to currentX at DOT_Y
  let incomingPath = "";

  if (isFirst) {
    // First node: draw a long horizontal line from left edge to node center
    incomingPath = `M -400 ${DOT_Y} L ${currentX - NODE_R} ${DOT_Y}`;
  } else if (prevX === currentX) {
    // Same column: straight vertical drop
    incomingPath = `M ${prevX} 0 L ${currentX} ${DOT_Y - NODE_R}`;
  } else if (prevX < currentX) {
    // Moving RIGHT: drop down, curve right
    incomingPath = `M ${prevX} 0 L ${prevX} ${DOT_Y - CURVE_R} Q ${prevX} ${DOT_Y} ${prevX + CURVE_R} ${DOT_Y} L ${currentX - NODE_R} ${DOT_Y}`;
  } else {
    // Moving LEFT: drop down, curve left
    incomingPath = `M ${prevX} 0 L ${prevX} ${DOT_Y - CURVE_R} Q ${prevX} ${DOT_Y} ${prevX - CURVE_R} ${DOT_Y} L ${currentX + NODE_R} ${DOT_Y}`;
  }

  // Short horizontal connector from right edge of node to card
  const connectorX1 = currentX + NODE_R;
  const connectorX2 = currentX + NODE_R + CARD_GAP;

  return (
    <div style={{ position: "relative", minHeight: isEndNode ? "100px" : "300px" }}>

      {/* ── SVG lines ── */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Incoming connector (from previous node down to this node) */}
        <path d={incomingPath} fill="none" stroke={LINE_COLOR} strokeWidth={LINE_WIDTH} />

        {/* Short horizontal stub: node → card */}
        {!isEndNode && (
          <line
            x1={connectorX1}
            y1={DOT_Y}
            x2={connectorX2}
            y2={DOT_Y}
            stroke={LINE_COLOR}
            strokeWidth={LINE_WIDTH}
          />
        )}

        {/* Outgoing vertical: from bottom of this node's circle to the bottom of this div.
            The NEXT node's incomingPath starts at y=0 from the same x, so they connect seamlessly. */}
        {!isLast && (
          <line
            x1={currentX}
            y1={DOT_Y + NODE_R}
            x2={currentX}
            y2="100%"
            stroke={LINE_COLOR}
            strokeWidth={LINE_WIDTH}
          />
        )}
      </svg>

      {/* ── Date label (above node) ── */}
      {!isEndNode && (
        <div
          style={{
            position: "absolute",
            left: currentX,
            top: DOT_Y - NODE_R - 8,
            transform: "translate(-50%, -100%)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            color: "#64748b",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {release.date}
        </div>
      )}

      {/* ── Node circle ── */}
      <div
        style={{
          position: "absolute",
          left: currentX,
          top: DOT_Y,
          transform: "translate(-50%, -50%)",
          width: isEndNode ? "40px" : `${NODE_R * 2}px`,
          height: isEndNode ? "22px" : `${NODE_R * 2}px`,
          borderRadius: isEndNode ? "11px" : "50%",
          // Solid dark-blue fill matching the reference image
          background: isEndNode
            ? "rgba(30,41,59,0.8)"
            : `radial-gradient(circle at 40% 35%, rgba(${hexToRgb(release.color)}, 0.55) 0%, rgba(15,23,42,0.95) 70%)`,
          border: isEndNode
            ? "1px solid rgba(255,255,255,0.12)"
            : `1px solid rgba(${hexToRgb(release.color)}, 0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          boxShadow: isEndNode
            ? "none"
            : `0 0 0 6px rgba(${hexToRgb(release.color)}, 0.08), inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        {isEndNode ? (
          <div style={{ display: "flex", gap: "3px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        ) : (
          /* White center dot — exactly like the reference */
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 8px rgba(255,255,255,0.9)",
            }}
          />
        )}
      </div>

      {/* ── Card ── */}
      <div
        style={{
          // Card starts at right edge of node + gap
          paddingLeft: `${connectorX2}px`,
          // Vertically center card against the node dot
          paddingTop: `${DOT_Y - NODE_R}px`,
          paddingBottom: "40px",
          boxSizing: "border-box",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {isEndNode ? (
          <div style={{ paddingTop: "10px" }}>
            <div style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
              {release.date}
            </div>
            <div style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>
              {release.title}
            </div>
          </div>
        ) : (
          <div
            className="timeline-card changelog-card-content"
            style={{
              background: "rgba(17, 24, 39, 0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderTop: `1px solid rgba(${hexToRgb(release.color)}, 0.25)`,
              borderRadius: "16px",
              padding: "32px 36px",
              maxWidth: "460px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Version pill */}
            <div
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                background: `rgba(${hexToRgb(release.color)}, 0.12)`,
                color: release.color,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                marginBottom: "18px",
                border: `1px solid rgba(${hexToRgb(release.color)}, 0.2)`,
              }}
            >
              {release.version}
            </div>

            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#f1f5f9",
                marginBottom: "12px",
                letterSpacing: "-0.3px",
                lineHeight: 1.3,
              }}
            >
              {release.title}
            </h3>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                lineHeight: 1.65,
                marginBottom: "20px",
              }}
            >
              {release.items[0].text}
            </p>

            {release.items.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {release.items.slice(1).map((item, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: release.color,
                        marginTop: "7px",
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${release.color}`,
                      }}
                    />
                    <span style={{ color: "#94a3b8", fontSize: "13.5px", lineHeight: 1.55 }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: hex → "r, g, b" for use in rgba()
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 255, 255";
}

