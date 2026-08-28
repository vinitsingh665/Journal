"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, ActivitySquare, LogOut, Activity } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/vinit_admin", icon: LayoutDashboard },
    { name: "Users", href: "/vinit_admin/users", icon: Users },
    { name: "Feedback", href: "/vinit_admin/feedback", icon: Mail },
    { name: "System Health", href: "/vinit_admin/health", icon: ActivitySquare },
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
        <div style={{ 
          background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", 
          width: 32, 
          height: 32, 
          borderRadius: 8, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(79, 70, 229, 0.4)"
        }}>
          <Activity color="white" size={18} strokeWidth={3} />
        </div>
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
        <Link href="/" style={{ 
          display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
          borderRadius: 8, textDecoration: "none", color: "#ef4444", fontWeight: 500
        }}>
          <LogOut size={18} />
          Exit Admin
        </Link>
      </div>
    </aside>
  );
}
