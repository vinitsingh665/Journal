"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Mail, Bell, Activity, UserCog, Bug, BarChart3, X } from "lucide-react";

export default function AdminOverviewPage() {
  const [timeStr, setTimeStr] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

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

  const handleResolve = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'resolve' })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
        if (selectedTicket && selectedTicket.id === id) {
          setSelectedTicket({ ...selectedTicket, status: 'resolved' });
        }
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
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px", backgroundColor: "#09090b", position: "relative" }}>
      
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
                <tr key={item.id} style={{ borderBottom: "1px solid #27272a", cursor: "pointer", transition: "background 0.2s" }} onClick={() => setSelectedTicket(item)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
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
                        onClick={(e) => handleResolve(item.id, e)}
                        style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 6, cursor: "pointer", zIndex: 10, position: "relative" }}
                      >
                        Resolve
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedTicket(item); }}
                        style={{ backgroundColor: "transparent", border: "1px solid #27272a", color: "#f4f4f5", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                      >
                        View
                      </button>
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

      {/* Ticket Modal */}
      {selectedTicket && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: 12, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid #27272a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {selectedTicket.type === 'bug' ? (
                  <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: 8, borderRadius: 8 }}><Bug size={20} color="#ef4444" /></div>
                ) : (
                  <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: 8, borderRadius: 8 }}><Mail size={20} color="#a1a1aa" /></div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedTicket.subject}</h3>
                  <div style={{ fontSize: 13, color: "#a1a1aa", marginTop: 4 }}>From {selectedTicket.senderName} ({selectedTicket.senderEmail})</div>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: "transparent", border: "none", color: "#a1a1aa", cursor: "pointer" }}><X size={20} /></button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                <span style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: 4, fontSize: 12, color: "#a1a1aa" }}>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                {selectedTicket.status === 'resolved' ? (
                  <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 4 }}>RESOLVED</span>
                ) : (
                  <span style={{ border: "1px solid rgba(249, 115, 22, 0.3)", color: "#f97316", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 4 }}>NEW</span>
                )}
              </div>

              {selectedTicket.type === 'bug' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, backgroundColor: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid #27272a" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#71717a", fontWeight: 600, marginBottom: 4 }}>SEVERITY</div>
                    <div style={{ fontSize: 14, color: "#f4f4f5" }}>{selectedTicket.severity || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#71717a", fontWeight: 600, marginBottom: 4 }}>AFFECTED PAGE</div>
                    <div style={{ fontSize: 14, color: "#f4f4f5" }}>{selectedTicket.affectedPage || 'N/A'}</div>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#71717a", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>MESSAGE / STEPS TO REPRODUCE</div>
                <div style={{ fontSize: 14, color: "#f4f4f5", lineHeight: 1.6, whiteSpace: "pre-wrap", backgroundColor: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid #27272a" }}>
                  {selectedTicket.body}
                </div>
              </div>

              {selectedTicket.type === 'bug' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#71717a", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>EXPECTED BEHAVIOR</div>
                    <div style={{ fontSize: 14, color: "#f4f4f5", lineHeight: 1.6, whiteSpace: "pre-wrap", backgroundColor: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid #27272a" }}>
                      {selectedTicket.expectedBehavior || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#71717a", fontWeight: 600, marginBottom: 8, letterSpacing: "0.05em" }}>ACTUAL BEHAVIOR</div>
                    <div style={{ fontSize: 14, color: "#f4f4f5", lineHeight: 1.6, whiteSpace: "pre-wrap", backgroundColor: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid #27272a" }}>
                      {selectedTicket.actualBehavior || 'N/A'}
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #27272a", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setSelectedTicket(null)} style={{ background: "transparent", border: "1px solid #3f3f46", color: "#f4f4f5", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Close</button>
              {selectedTicket.status === 'new' && (
                <button 
                  onClick={() => handleResolve(selectedTicket.id)}
                  style={{ backgroundColor: "#10b981", border: "none", color: "#000", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
