"use client";

import React, { useState, useEffect } from "react";
import { Users, Mail, Bell, Activity, UserCog, CheckCircle2, AlertTriangle, Bug, BarChart3 } from "lucide-react";

export default function AdminOverviewPage() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    // Client-side only time to avoid hydration mismatch
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>Overview</h1>
          <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Live platform metrics and user feedback.</p>
        </div>
        <button style={{ 
          display: "flex", alignItems: "center", gap: 8, 
          backgroundColor: "transparent", border: "1px solid #3f3f46", 
          color: "#f4f4f5", padding: "8px 16px", borderRadius: 8, 
          fontSize: 14, fontWeight: 500, cursor: "pointer" 
        }}>
          <UserCog size={16} />
          Manage Users
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Users size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>2</div>
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
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>0</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Unresolved Tickets</div>
          <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 600 }}>
            Action Required
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Bell size={20} color="#818cf8" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>1,430</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Active User Alerts</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 12, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Growing steadily
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Activity size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>1</div>
          <div style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>Global API Latency</div>
          <div style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>
            Operational
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, paddingBottom: 40 }}>
        
        {/* User Inbox Table */}
        <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: "24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>User Inbox</h2>
            <a href="#" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>View full inbox →</a>
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
              {/* Row 1 */}
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>RESOLVED</span>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>vinay singh1</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>vinaysingh@gmail.com</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", maxWidth: 280 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Mail size={14} color="#a1a1aa" /> Support: business
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>i wanna buy this website for my personal project.</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <a href="#" style={{ color: "#a1a1aa", fontSize: 13, textDecoration: "none" }}>View</a>
                </td>
              </tr>
              {/* Row 2 */}
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>RESOLVED</span>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>tinku</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>tinku@tinku.com</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", maxWidth: 280 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Mail size={14} color="#a1a1aa" /> Support: general
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>mein hoon tinku</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <a href="#" style={{ color: "#a1a1aa", fontSize: 13, textDecoration: "none" }}>View</a>
                </td>
              </tr>
              {/* Row 3 */}
              <tr style={{ borderBottom: "1px solid #27272a" }}>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>RESOLVED</span>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>expire</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>expire@gmail.com</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", maxWidth: 280 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Mail size={14} color="#a1a1aa" /> Support: feature
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>yeh toh expire ho gaya</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <a href="#" style={{ color: "#a1a1aa", fontSize: 13, textDecoration: "none" }}>View</a>
                </td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4 }}>RESOLVED</span>
                </td>
                <td style={{ padding: "16px 24px 16px 0" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5" }}>younamebug</div>
                  <div style={{ fontSize: 12, color: "#71717a" }}>bug@gmail.com</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", maxWidth: 280 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Bug size={14} color="#10b981" /> Bug: bug don't have title
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>actual reproduce</div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                  <a href="#" style={{ color: "#a1a1aa", fontSize: 13, textDecoration: "none" }}>View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Column (Vitals & Stocks) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* System Vitals */}
          <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>System Vitals</h2>
              <a href="#" style={{ color: "#818cf8", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>Details →</a>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Load */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f5" }}>Database Load</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>34%</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <div style={{ width: "34%", height: "100%", backgroundColor: "#10b981", borderRadius: 3 }}></div>
                </div>
              </div>
              
              {/* Redis */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f5" }}>Redis Cache Hit Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>94.2%</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <div style={{ width: "94.2%", height: "100%", backgroundColor: "#10b981", borderRadius: 3 }}></div>
                </div>
              </div>

              {/* Error */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#f4f4f5" }}>Error Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "monospace" }}>0.02%</span>
                </div>
                <div style={{ width: "100%", height: 6, backgroundColor: "#27272a", borderRadius: 3 }}>
                  <div style={{ width: "2%", height: "100%", backgroundColor: "#f97316", borderRadius: 3 }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Searched */}
          <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 24px 0" }}>Top Searched Stocks</h2>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#52525b" }}>
              <BarChart3 size={32} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: 13, color: "#71717a" }}>No search data available yet.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
