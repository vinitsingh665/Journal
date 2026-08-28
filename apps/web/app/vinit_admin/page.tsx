"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Mail, Bell, Activity, UserCog, Bug, BarChart3 } from "lucide-react";

export default function AdminOverviewPage() {
  const [timeStr, setTimeStr] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + " IST");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Data
  const fetchDashboardData = async () => {
    try {
      const [statsRes, fbRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/feedback')
      ]);
      const statsData = await statsRes.json();
      const fbData = await fbRes.json();

      if (statsData.success) setStats(statsData.data);
      if (fbData.success) setFeedback(fbData.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetch('/api/admin/stats').then(r=>r.json()).then(d => {
        if(d.success) setStats(d.data);
      });
    }, 5000);
    return () => clearInterval(interval);
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

  if (loading || !stats) {
    return (
      <div style={{ flex: 1, padding: "24px 40px", backgroundColor: "#09090b", color: "#a1a1aa" }}>
        Loading Overview Dashboard...
      </div>
    );
  }

  const pendingFeedback = feedback.filter(f => f.status === 'new').length;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>Overview</h1>
          <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Live platform metrics and user feedback.</p>
        </div>
        <Link href="/vinit_admin/users" style={{ 
          display: "flex", alignItems: "center", gap: 8, 
          backgroundColor: "transparent", border: "1px solid #3f3f46", 
          color: "#f4f4f5", padding: "8px 16px", borderRadius: 8, textDecoration: "none",
          fontSize: 14, fontWeight: 500, cursor: "pointer" 
        }}>
          <UserCog size={16} />
          Manage Users
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Users size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{stats.liveUsers}</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Live Active Users</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 12, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            12% vs last hour
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Mail size={20} color="#f97316" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{pendingFeedback}</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Unresolved Tickets</div>
          <div style={{ color: pendingFeedback > 0 ? "#ef4444" : "#10b981", fontSize: 12, fontWeight: 600 }}>
            {pendingFeedback > 0 ? "Action Required" : "All clear"}
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Bell size={20} color="#818cf8" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{stats.activeAlerts.toLocaleString()}</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Active User Alerts</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 12, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Growing steadily
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Activity size={20} color={stats.systemHealth.status === 'Operational' ? '#10b981' : '#f59e0b'} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{stats.systemHealth.apiLatency}</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Global API Latency (MS)</div>
          <div style={{ color: stats.systemHealth.status === 'Operational' ? '#10b981' : '#f59e0b', fontSize: 12, fontWeight: 600 }}>
            {stats.systemHealth.status}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, paddingBottom: 40 }}>
        
        {/* User Inbox Table */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: "24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>User Inbox</h2>
            <Link href="/vinit_admin/feedback" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>View full inbox →</Link>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #27272a", textAlign: "left", color: "#71717a", fontSize: 11, letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 24px 12px 24px", fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: "0 24px 12px 0", fontWeight: 600 }}>SENDER</th>
                <th style={{ padding: "0 24px 12px 0", fontWeight: 600 }}>MESSAGE</th>
                <th style={{ padding: "0 24px 12px 0", fontWeight: 600, textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {feedback.slice(0,4).map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #27272a" }}>
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
                      {item.type === 'bug' ? <Bug size={14} color="#10b981" /> : <Mail size={14} color="#a1a1aa" />} {item.subject}
                    </div>
                    <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.body}</div>
                  </td>
                  <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                    {item.status === 'new' ? (
                      <button 
                        onClick={() => handleResolve(item.id)}
                        style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}
                      >
                        Resolve
                      </button>
                    ) : (
                      <Link href="/vinit_admin/feedback" style={{ color: "#a1a1aa", fontSize: 13, textDecoration: "none" }}>View</Link>
                    )}
                  </td>
                </tr>
              ))}
              {feedback.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "#52525b" }}>No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Column (Vitals & Stocks) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* System Vitals */}
          <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>System Vitals</h2>
              <Link href="/vinit_admin/health" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Details →</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Load */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f5" }}>Database Load</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>{stats.databaseLoad}%</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <div style={{ width: `${stats.databaseLoad}%`, height: "100%", backgroundColor: "#10b981", borderRadius: 3, transition: "width 1s ease-in-out" }}></div>
                </div>
              </div>
              
              {/* Redis */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f5" }}>Redis Cache Hit Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>{stats.cacheHitRate}%</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <div style={{ width: `${stats.cacheHitRate}%`, height: "100%", backgroundColor: "#10b981", borderRadius: 3, transition: "width 1s ease-in-out" }}></div>
                </div>
              </div>

              {/* Error */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f5" }}>Error Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>{stats.systemHealth.errorRate}</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <div style={{ width: `${Math.max(2, parseFloat(stats.systemHealth.errorRate) * 10)}%`, height: "100%", backgroundColor: "#f97316", borderRadius: 3, transition: "width 1s ease-in-out" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Searched */}
          <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 24px 0" }}>Top Searched Stocks</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.trendingSearches.map((item: any, idx: number) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#52525b", fontWeight: 800, fontSize: 11 }}>0{idx+1}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{item.symbol}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "#a1a1aa" }}>{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
