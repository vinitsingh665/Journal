"use client";

import React, { useState, useEffect } from "react";
import { Mail, Bug, CheckCircle2, Square, Circle } from "lucide-react";

const feedbackData = [
  { name: "vinay singh1", email: "vinaysingh@gmail.com", title: "Support: business", desc: "i wanna buy this website for my personal project.", type: "contact", date: "8/4/2026" },
  { name: "tinku", email: "tinku@tinku.com", title: "Support: general", desc: "mein hoon tinku", type: "contact", date: "6/10/2026" },
  { name: "expire", email: "expire@gmail.com", title: "Support: feature", desc: "yeh toh expire ho gaya", type: "contact", date: "4/15/2026" },
  { name: "younamebug", email: "bug@gmail.com", title: "Bug: bug don't have title", desc: "actual reproduce", type: "bug", date: "3/28/2026" },
  { name: "contact", email: "vi@gmail.com", title: "Support: business", desc: "what are you doing business man", type: "contact", date: "3/28/2026" },
  { name: "yourname", email: "vinit@gmail.com", title: "Bug: bug title", desc: "actual behavior", type: "bug", date: "3/28/2026" },
  { name: "vinitbug", email: "vinitsingh@gmail.com", title: "Bug: buggg", desc: "bug", type: "bug", date: "3/28/2026" },
  { name: "vinit", email: "vinitsingh@gmail.com", title: "Support: general", desc: "hi", type: "contact", date: "3/28/2026" },
  { name: "rrg", email: "vinits.7kushwaha@gmail.com", title: "Support: general", desc: "fffu", type: "contact", date: "3/28/2026" },
];

export default function AdminFeedbackPage() {
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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>User Inbox & Feedback</h1>
        <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Read contact messages, bug reports, and resolve user issues.</p>
      </div>

      {/* Pills Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#312e81", border: "1px solid #4338ca", padding: "6px 16px", borderRadius: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>All</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#818cf8", backgroundColor: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: 10 }}>11</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "transparent", border: "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <Bug size={14} color="#a3e635" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Bugs</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>4</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "transparent", border: "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <Square size={12} color="#f4f4f5" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Contact</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>7</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "transparent", border: "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <CheckCircle2 size={14} color="#10b981" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Resolved</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>11</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "transparent", border: "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <Circle size={10} color="#ef4444" fill="#ef4444" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>Not Resolved</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>0</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: "24px 0", paddingBottom: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #27272a", textAlign: "left", color: "#71717a", fontSize: 11, letterSpacing: "0.05em" }}>
              <th style={{ padding: "0 24px 16px 24px", fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>USER</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>MESSAGE</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>TYPE</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>DATE</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: idx === feedbackData.length - 1 ? "none" : "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>RESOLVED</span>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>{item.email}</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", maxWidth: 280 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {item.type === "contact" ? <Mail size={14} color="#a1a1aa" /> : <Bug size={14} color="#a3e635" />} 
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.desc}</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  {item.type === "contact" ? (
                    <span style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f4f4f5", fontSize: 11, fontWeight: 500, padding: "4px 8px", borderRadius: 4 }}>contact</span>
                  ) : (
                    <span style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", fontSize: 11, fontWeight: 500, padding: "4px 8px", borderRadius: 4 }}>bug</span>
                  )}
                </td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#a1a1aa" }}>{item.date}</td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <button style={{ 
                    backgroundColor: "transparent", border: "1px solid #27272a", 
                    color: "#f4f4f5", padding: "6px 12px", borderRadius: 6, 
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
