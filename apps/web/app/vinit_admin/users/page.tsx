"use client";

import React, { useState, useEffect } from "react";
import { Users as UsersIcon, ShieldAlert, UserCheck, Shield } from "lucide-react";

export default function AdminUsersPage() {
  const [timeStr, setTimeStr] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('USER');
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

  const renderUserTable = (userList: any[], emptyMessage: string) => (
    <div style={{ backgroundColor: "#000", border: "1px solid #27272a", borderRadius: 12, padding: "24px 0", overflow: "hidden", marginBottom: 32 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #27272a", textAlign: "left", color: "#71717a", fontSize: 11, letterSpacing: "0.05em" }}>
            <th style={{ padding: "0 24px 16px 24px", fontWeight: 600 }}>NAME</th>
            <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>EMAIL</th>
            <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>DATE JOINED</th>
            <th style={{ padding: "0 24px 16px 0", fontWeight: 600 }}>STATUS</th>
            <th style={{ padding: "0 24px 16px 0", fontWeight: 600, textAlign: "right" }}>ROLE</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user, idx) => (
            <tr key={user.id} style={{ borderBottom: idx === userList.length - 1 ? "none" : "1px solid #27272a", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
              <td style={{ padding: "16px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#f4f4f5", display: "flex", alignItems: "center", gap: 8 }}>
                  {user.isGuest && <span style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#a1a1aa", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>GUEST</span>}
                  {user.name}
                </div>
              </td>
              <td style={{ padding: "16px 24px 16px 0", color: "#a1a1aa", fontSize: 13 }}>{user.email || 'N/A'}</td>
              <td style={{ padding: "16px 24px 16px 0", color: "#a1a1aa", fontSize: 13 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td style={{ padding: "16px 24px 16px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontSize: 12, fontWeight: 500 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }}></div> Active
                </div>
              </td>
              <td style={{ padding: "16px 24px 16px 0", textAlign: "right" }}>
                {currentUserRole === 'ADMIN' ? (
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
                    <option value="USER">User</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <span style={{ 
                    backgroundColor: "rgba(255,255,255,0.05)", 
                    border: "1px solid #27272a", 
                    color: "#a1a1aa", 
                    padding: "6px 12px", 
                    borderRadius: 6, 
                    fontSize: 12, 
                    fontWeight: 500 
                  }}>
                    {user.role || 'USER'}
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
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px", backgroundColor: "#09090b" }}>
      
      {/* Top Navbar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#3f3f46", overflow: "hidden" }}>
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=f87171" alt="Admin" style={{ width: "100%", height: "100%" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{currentUserRole}</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px 0" }}>User Management</h1>
        <p style={{ color: "#a1a1aa", margin: 0, fontSize: 14 }}>Manage roles and permissions. Only Admins can change user roles.</p>
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
