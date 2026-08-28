"use client";

import React, { useState, useEffect } from "react";
import { Mail, Bug, CheckCircle2, Square, Circle } from "lucide-react";

export default function AdminFeedbackPage() {
  const [timeStr, setTimeStr] = useState("");
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + " IST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
      }
      setLoading(false);
    } catch(e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'resolve' })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
      }
    } catch (e) {
      console.error('Failed to resolve', e);
    }
  };

  const bugsCount = feedback.filter(f => f.type === 'bug').length;
  const contactsCount = feedback.filter(f => f.type === 'contact').length;
  const resolvedCount = feedback.filter(f => f.status === 'resolved').length;
  const notResolvedCount = feedback.filter(f => f.status === 'new').length;

  const filteredFeedback = feedback.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'bugs') return f.type === 'bug';
    if (filter === 'contact') return f.type === 'contact';
    if (filter === 'resolved') return f.status === 'resolved';
    if (filter === 'not_resolved') return f.status === 'new';
    return true;
  });

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>User Inbox & Feedback</h1>
        <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Read contact messages, bug reports, and resolve user issues.</p>
      </div>

      {/* Pills Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <div onClick={() => setFilter("all")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, backgroundColor: filter === "all" ? "#312e81" : "transparent", border: filter === "all" ? "1px solid #4338ca" : "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: filter === "all" ? "#fff" : "#a1a1aa" }}>All</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: filter === "all" ? "#818cf8" : "#71717a", backgroundColor: filter === "all" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>{feedback.length}</span>
        </div>
        
        <div onClick={() => setFilter("bugs")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, backgroundColor: filter === "bugs" ? "#312e81" : "transparent", border: filter === "bugs" ? "1px solid #4338ca" : "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <Bug size={14} color={filter === "bugs" ? "#fff" : "#a3e635"} />
          <span style={{ fontSize: 13, fontWeight: 600, color: filter === "bugs" ? "#fff" : "#a1a1aa" }}>Bugs</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: filter === "bugs" ? "#818cf8" : "#71717a", backgroundColor: filter === "bugs" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>{bugsCount}</span>
        </div>
        
        <div onClick={() => setFilter("contact")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, backgroundColor: filter === "contact" ? "#312e81" : "transparent", border: filter === "contact" ? "1px solid #4338ca" : "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <Square size={12} color={filter === "contact" ? "#fff" : "#f4f4f5"} />
          <span style={{ fontSize: 13, fontWeight: 600, color: filter === "contact" ? "#fff" : "#a1a1aa" }}>Contact</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: filter === "contact" ? "#818cf8" : "#71717a", backgroundColor: filter === "contact" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>{contactsCount}</span>
        </div>
        
        <div onClick={() => setFilter("resolved")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, backgroundColor: filter === "resolved" ? "#312e81" : "transparent", border: filter === "resolved" ? "1px solid #4338ca" : "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <CheckCircle2 size={14} color={filter === "resolved" ? "#fff" : "#10b981"} />
          <span style={{ fontSize: 13, fontWeight: 600, color: filter === "resolved" ? "#fff" : "#a1a1aa" }}>Resolved</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: filter === "resolved" ? "#818cf8" : "#71717a", backgroundColor: filter === "resolved" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>{resolvedCount}</span>
        </div>

        <div onClick={() => setFilter("not_resolved")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, backgroundColor: filter === "not_resolved" ? "#312e81" : "transparent", border: filter === "not_resolved" ? "1px solid #4338ca" : "1px solid #27272a", padding: "6px 16px", borderRadius: 20 }}>
          <Circle size={10} color={filter === "not_resolved" ? "#fff" : "#ef4444"} fill={filter === "not_resolved" ? "#fff" : "#ef4444"} />
          <span style={{ fontSize: 13, fontWeight: 600, color: filter === "not_resolved" ? "#fff" : "#a1a1aa" }}>Not Resolved</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: filter === "not_resolved" ? "#818cf8" : "#71717a", backgroundColor: filter === "not_resolved" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 10 }}>{notResolvedCount}</span>
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
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#a1a1aa" }}>Loading tickets...</td></tr>
            ) : filteredFeedback.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: idx === filteredFeedback.length - 1 ? "none" : "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px" }}>
                  {item.status === 'resolved' ? (
                    <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>RESOLVED</span>
                  ) : (
                    <span style={{ border: "1px solid rgba(249, 115, 22, 0.3)", color: "#f97316", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>NEW</span>
                  )}
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>{item.senderName}</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>{item.senderEmail}</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", maxWidth: 280 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {item.type === 'contact' ? <Mail size={14} color="#a1a1aa" /> : <Bug size={14} color="#a3e635" />} 
                    {item.subject}
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.body}</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  {item.type === 'contact' ? (
                    <span style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f4f4f5", fontSize: 11, fontWeight: 500, padding: "4px 8px", borderRadius: 4 }}>contact</span>
                  ) : (
                    <span style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", fontSize: 11, fontWeight: 500, padding: "4px 8px", borderRadius: 4 }}>bug</span>
                  )}
                </td>
                <td style={{ padding: "16px 24px 16px 0", fontSize: 13, color: "#a1a1aa" }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  {item.status === 'new' ? (
                    <button 
                      onClick={() => handleResolve(item.id)}
                      style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
                    >
                      Resolve
                    </button>
                  ) : (
                    <button style={{ backgroundColor: "transparent", border: "1px solid #27272a", color: "#f4f4f5", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                      View
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filteredFeedback.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#a1a1aa" }}>No tickets found matching the filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
