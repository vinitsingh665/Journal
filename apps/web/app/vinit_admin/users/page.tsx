"use client";

import React, { useState, useEffect } from "react";

export default function AdminUsersPage() {
  const [timeStr, setTimeStr] = useState("");
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + " IST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsersData(data.data);
      }
      setLoading(false);
    } catch(e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>EMAIL</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>DATE JOINED</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>STATUS</th>
              <th style={{ padding: "0 24px 16px 0", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#a1a1aa" }}>Loading users...</td></tr>
            ) : usersData.map((user, idx) => (
              <tr key={user.id} style={{ borderBottom: idx === usersData.length - 1 ? "none" : "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>{user.name}</td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#a1a1aa" }}>{user.email || "No Email"}</td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#a1a1aa" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#10b981" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }}></div>
                    Active
                  </div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <button style={{ 
                    backgroundColor: "transparent", border: "1px solid #27272a", 
                    color: "#f4f4f5", padding: "6px 12px", borderRadius: 6, 
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "background 0.2s"
                  }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {!loading && usersData.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#a1a1aa" }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
