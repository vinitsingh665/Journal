"use client";

import React, { useState, useEffect } from "react";
import { Users as UsersIcon, ShieldAlert, UserCheck, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [timeStr, setTimeStr] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('USER');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        setUsers(data.data);
        setCurrentUserRole(data.currentUserRole);
        setCurrentUserId(data.currentUserId);
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (currentUserRole !== 'ADMIN') return;
    setUpdatingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(data.error || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating role');
    }
    setUpdatingId(null);
  };

  const admins = users.filter(u => u.role === 'ADMIN');
  const members = users.filter(u => u.role === 'MEMBER');
  const regularUsers = users.filter(u => u.role === 'USER' || !u.role);

function formatTimeAgo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0 || diffMs < 60 * 1000) return "Just now";
  const diffMin = Math.floor(diffMs / (60 * 1000));
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString();
}

  const renderUserTable = (userList: any[], emptyMessage: string) => (
    <div className="admin-card admin-users-card-container" style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: "24px 0", marginBottom: 32 }}>
      {/* ─── DESKTOP TABLE VIEW (100% untouched for desktop mode) ─── */}
      <div className="admin-table-desktop-view" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #27272a", textAlign: "left", color: "#71717a", fontSize: 11, letterSpacing: "0.05em" }}>
              <th style={{ width: "22%", padding: "0 24px 16px 24px", fontWeight: 600 }}>NAME</th>
              <th style={{ width: "28%", padding: "0 24px 16px 0", fontWeight: 600 }}>EMAIL</th>
              <th style={{ width: "16%", padding: "0 24px 16px 0", fontWeight: 600 }}>DATE JOINED</th>
              <th style={{ width: "20%", padding: "0 24px 16px 0", fontWeight: 600 }}>STATUS</th>
              <th style={{ width: "14%", padding: "0 24px 16px 0", fontWeight: 600, textAlign: "right" }}>ROLE</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, idx) => (
              <tr key={user.id} style={{ borderBottom: idx === userList.length - 1 ? "none" : "1px solid #27272a", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <td style={{ padding: "16px 24px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    {user.isGuest && <span style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#a1a1aa", fontSize: 10, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>GUEST</span>}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px 16px 0", color: "#a1a1aa", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email || 'N/A'}
                </td>
                <td style={{ padding: "16px 24px 16px 0", color: "#a1a1aa", fontSize: 13, whiteSpace: "nowrap" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "16px 24px 16px 0", whiteSpace: "nowrap" }}>
                  {user.isOnline ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 6px #10b981" }}></div>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Online</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#52525b" }}></div>
                      <span style={{ color: "#a1a1aa", fontWeight: 500 }}>Offline</span>
                      <span 
                        style={{ color: "#71717a", fontSize: 11, fontFamily: "var(--font-mono), monospace" }}
                        title={user.lastSeen ? new Date(user.lastSeen).toLocaleString() : undefined}
                      >
                        • {formatTimeAgo(user.lastSeen)}
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ padding: "16px 24px 16px 0", textAlign: "right", whiteSpace: "nowrap" }}>
                  {currentUserRole === 'ADMIN' && user.id !== currentUserId ? (
                    <select 
                      disabled={updatingId === user.id}
                      value={user.role || 'USER'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ 
                        backgroundColor: "rgba(255,255,255,0.05)", 
                        border: "1px solid #27272a", 
                        color: "#f4f4f5", 
                        padding: "6px 12px", 
                        borderRadius: 6, 
                        fontSize: 12, 
                        fontWeight: 500, 
                        cursor: updatingId === user.id ? "wait" : "pointer",
                        outline: "none"
                      }}
                    >
                      <option value="USER" style={{ backgroundColor: "#09090b", color: "#f4f4f5" }}>User</option>
                      <option value="MEMBER" style={{ backgroundColor: "#09090b", color: "#f4f4f5" }}>Member</option>
                      <option value="ADMIN" style={{ backgroundColor: "#09090b", color: "#f4f4f5" }}>Admin</option>
                    </select>
                  ) : (
                    <span style={{ 
                      backgroundColor: "rgba(255,255,255,0.05)", 
                      border: "1px solid #27272a", 
                      color: user.id === currentUserId ? "#3b82f6" : "#a1a1aa", 
                      padding: "6px 12px", 
                      borderRadius: 6, 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {user.id === currentUserId ? `${user.role || 'USER'} (You)` : (user.role || 'USER')}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {userList.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#52525b" }}>{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── MOBILE PHONE LIST VIEW (Clean, No Horizontal Scrolling) ─── */}
      <div className="admin-users-mobile-view">
        {userList.length === 0 ? (
          <div className="admin-user-mobile-empty">{emptyMessage}</div>
        ) : (
          userList.map((user) => (
            <div key={user.id} className="admin-user-mobile-item">
              <div className="admin-user-mobile-info">
                {/* Name Row with Online/Offline Dot and Time Ago on the right of the name */}
                <div className="admin-user-mobile-name-row">
                  <span 
                    className={`admin-user-status-dot ${user.isOnline ? "online" : "offline"}`} 
                    title={user.isOnline ? "Online" : "Offline"}
                  />
                  <span className="admin-user-mobile-name">{user.name}</span>
                  {user.isGuest && <span className="admin-user-guest-badge">GUEST</span>}
                  {!user.isOnline && user.lastSeen && (
                    <span 
                      style={{ color: "#71717a", fontSize: 11, fontFamily: "var(--font-mono), monospace", flexShrink: 0, marginLeft: 2 }}
                      title={new Date(user.lastSeen).toLocaleString()}
                    >
                      • {formatTimeAgo(user.lastSeen)}
                    </span>
                  )}
                </div>

                {/* Email */}
                {user.email && (
                  <div className="admin-user-mobile-email">{user.email}</div>
                )}

                {/* Date Joined */}
                <div className="admin-user-mobile-joined">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Role Action (Right side) */}
              <div className="admin-user-mobile-action">
                {currentUserRole === 'ADMIN' && user.id !== currentUserId ? (
                  <select 
                    disabled={updatingId === user.id}
                    value={user.role || 'USER'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="admin-user-mobile-select"
                  >
                    <option value="USER">User</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span className={`admin-user-mobile-role-badge ${user.id === currentUserId ? "self" : ""}`}>
                    {user.id === currentUserId ? `${user.role || 'USER'} (You)` : (user.role || 'USER')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-page-container" style={{ flex: 1, overflowY: "auto", padding: "24px 40px", backgroundColor: "#09090b" }}>
      
      {/* Top Navbar */}
      <div className="admin-top-navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid #27272a", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 12px", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }}></div>
            <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>SYSTEM ONLINE</span>
          </div>
          <div style={{ color: "#a1a1aa", fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>
            {timeStr || "Loading..."}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#3f3f46", overflow: "hidden" }}>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=f87171" alt="Admin" style={{ width: "100%", height: "100%" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{currentUserRole}</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="admin-page-title" style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>User Management</h1>
        <p className="admin-page-subtitle" style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Manage roles and permissions. Only Admins can change user roles.</p>
      </div>

      {loading ? (
        <div style={{ color: "#a1a1aa", padding: "40px 0", textAlign: "center" }}>Loading users...</div>
      ) : (
        <>
          {/* Admins Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <ShieldAlert size={20} color="#ef4444" />
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#f4f4f5" }}>Administrators</h2>
            <span style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>{admins.length}</span>
          </div>
          {renderUserTable(admins, "No administrators found.")}

          {/* Members Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Shield size={20} color="#3b82f6" />
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#f4f4f5" }}>Team Members</h2>
            <span style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>{members.length}</span>
          </div>
          {renderUserTable(members, "No team members found.")}

          {/* Users Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <UserCheck size={20} color="#10b981" />
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: "#f4f4f5" }}>Registered Users</h2>
            <span style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12 }}>{regularUsers.length}</span>
          </div>
          {renderUserTable(regularUsers, "No regular users found.")}
        </>
      )}

    </div>
  );
}
