"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Mail, ActivitySquare, LogOut, Activity } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Feedback", href: "/admin/feedback", icon: Mail },
    { name: "System Health", href: "/admin/health", icon: ActivitySquare },
  ];

  return (
    <aside style={{ 
      width: 260, 
      borderRight: "1px solid #27272a", 
      display: "flex", 
      flexDirection: "column", 
      padding: "24px 16px",
      backgroundColor: "#000"
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
        {navItems.map((item) => {
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
        <button onClick={() => router.back()} style={{ 
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
  );
}
