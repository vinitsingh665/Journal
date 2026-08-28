"use client";

import React, { useState, useEffect } from "react";

const usersData = [
  { name: "Vinay Singh", username: "@vinay", email: "vinnis7.kushwaha@gmail.com", dateJoined: "Aug 12, 2026", status: "Active" },
  { name: "Jitender Kumar", username: "@jeet", email: "kumarjitu9999@gmail.com", dateJoined: "Aug 3, 2026", status: "Active" },
  { name: "Arun Arun", username: "@arunkumar", email: "arun01051994me@gmail.com", dateJoined: "Jun 30, 2026", status: "Active" },
  { name: "md touseef attar", username: "@touseefattar53gmail", email: "touseefattar53@gmail.com", dateJoined: "May 17, 2026", status: "Active" },
  { name: "Swinglify AI Analyst", username: "@swinglifyai", email: "ai@swinglify.online", dateJoined: "Mar 28, 2026", status: "Active" },
  { name: "Vinit Singh", username: "@swinglify", email: "vinits.7kushwaha@gmail.com", dateJoined: "Mar 27, 2026", status: "Active" },
  { name: "ayush bhutt", username: "@axel", email: "ayushs.93singh@gmail.com", dateJoined: "Mar 26, 2026", status: "Active" },
  { name: "Vinit Singh", username: "@vinit", email: "vinitsingh665@gmail.com", dateJoined: "Mar 26, 2026", status: "Active" },
  { name: "Dr. Momo", username: "@vinit1", email: "drmomotales@gmail.com", dateJoined: "Mar 26, 2026", status: "Active" },
];

export default function AdminUsersPage() {
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
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>User Management</h1>
        <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Manage registered users, set usernames, and monitor activity.</p>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: "24px 0", paddingBottom: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #27272a", textAlign: "left", color: "#71717a", fontSize: 11, letterSpacing: "0.05em" }}>
              <th style={{ padding: "0 24px 16px 24px", fontWeight: 600 }}>NAME</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>USERNAME</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>EMAIL</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>DATE JOINED</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user, idx) => (
              <tr key={idx} style={{ borderBottom: idx === usersData.length - 1 ? "none" : "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#818cf8" }}>{user.username}</td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#a1a1aa" }}>{user.email}</td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#a1a1aa" }}>{user.dateJoined}</td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }}></div>
                    {user.status}
                  </div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <button style={{ 
                    backgroundColor: "transparent", border: "1px solid #27272a", 
                    color: "#f4f4f5", padding: "6px 12px", borderRadius: 6, 
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "background 0.2s"
                  }}>
                    Edit Username
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
