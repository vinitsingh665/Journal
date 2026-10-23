"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Mail, ActivitySquare, LogOut } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
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

  const mobileNavItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Feedback", href: "/admin/feedback", icon: Mail },
    { name: "System", href: "/admin/health", icon: ActivitySquare },
  ];

  return (
    <>
      {/* ─── MOBILE ADMIN TOPBAR (Phone View: Minimal Single-Row - Logo with Online Dot, Clock, Avatar) ─── */}
      <header className="admin-mobile-header">
        {/* Left: Logo with pulsing System Online indicator dot + TraderLabs brand text */}
        <div className="admin-mobile-header-left">
          <Link href="/admin" className="admin-mobile-logo-link" title="Admin Overview">
            <div className="admin-mobile-logo-wrap">
              <img 
                src="/logo.png" 
                alt="TraderLabs" 
                style={{ width: 26, height: 26, objectFit: "contain", filter: "drop-shadow(0 0 6px rgba(79, 70, 229, 0.4))" }} 
              />
              <span className="admin-mobile-online-dot" title="System Online" />
            </div>
            <span className="admin-mobile-brand-title">TraderLabs</span>
          </Link>
        </div>

        {/* Right: Live IST Clock + Super Admin Profile Picture */}
        <div className="admin-mobile-header-right">
          <div className="admin-mobile-clock">
            {timeStr || "Loading..."}
          </div>

          <div className="admin-mobile-user-avatar" title="Super Admin">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=f87171" 
              alt="Super Admin" 
              style={{ width: "100%", height: "100%" }} 
            />
          </div>
        </div>
      </header>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR (Phone View - 5 tabs including Exit) ─── */}
      <nav className="admin-mobile-bottom-nav" aria-label="Admin Mobile Navigation">
        {mobileNavItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`admin-bottom-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="admin-bottom-nav-icon-wrapper">
                <Icon size={19} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span className="admin-bottom-nav-label">{item.name}</span>
            </Link>
          );
        })}

        {/* Exit Tab in Bottom Nav */}
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="admin-bottom-nav-item admin-bottom-nav-exit"
          title="Exit Admin Panel"
        >
          <div className="admin-bottom-nav-icon-wrapper">
            <LogOut size={19} strokeWidth={1.8} />
          </div>
          <span className="admin-bottom-nav-label">Exit</span>
        </button>
      </nav>

      {/* ─── DESKTOP SIDEBAR (100% Untouched Desktop Mode) ─── */}
      <aside className="admin-desktop-sidebar" style={{ 
        width: 260, 
        borderRight: "1px solid #27272a", 
        display: "flex", 
        flexDirection: "column", 
        padding: "24px 16px",
        backgroundColor: "#000",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        flexShrink: 0
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, paddingLeft: 8 }}>
          <img 
            src="/logo.png" 
            alt="TraderLabs Logo" 
            style={{ width: 32, height: 32, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(79, 70, 229, 0.4))" }} 
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>TraderLabs</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#a1a1aa", letterSpacing: "0.05em" }}>COMMAND</div>
          </div>
        </div>

        {/* Nav Group */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", letterSpacing: "0.05em", marginBottom: 12, paddingLeft: 8 }}>
          MAIN
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {[
            { name: "Overview", href: "/admin", icon: LayoutDashboard },
            { name: "Users", href: "/admin/users", icon: Users },
            { name: "Feedback", href: "/admin/feedback", icon: Mail },
            { name: "System Health", href: "/admin/health", icon: ActivitySquare },
          ].map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href} style={{ 
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
                borderRadius: 8, textDecoration: "none", 
                backgroundColor: isActive ? "rgba(79, 70, 229, 0.1)" : "transparent",
                border: isActive ? "1px solid rgba(79, 70, 229, 0.2)" : "1px solid transparent",
                color: isActive ? "#818cf8" : "#a1a1aa",
                fontWeight: 500
              }}>
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div>
          <button onClick={() => router.push('/dashboard')} style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
            borderRadius: 8, textDecoration: "none", color: "#ef4444", fontWeight: 500,
            background: "transparent", border: "none", cursor: "pointer", width: "100%",
            fontFamily: "inherit", fontSize: "14px"
          }}>
            <LogOut size={18} />
            Exit Admin
          </button>
        </div>
      </aside>
    </>
  );
}
