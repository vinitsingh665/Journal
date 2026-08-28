import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Mail, ActivitySquare, LogOut, Activity } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | TraderLabs",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#09090b", color: "#f4f4f5" }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: 260, 
        borderRight: "1px solid #27272a", 
        display: "flex", 
        flexDirection: "column", 
        padding: "24px 16px",
        backgroundColor: "#000" // A bit darker for sidebar
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, paddingLeft: 8 }}>
          <div style={{ 
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", // Blue/Indigo gradient from screenshot
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
            <div style={{ fontSize: 10, fontWeight: 600, color: "#a1a1aa", letterSpacing: "0.05em" }}>ADMIN PANEL</div>
          </div>
        </div>

        {/* Nav Group */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", letterSpacing: "0.05em", marginBottom: 12, paddingLeft: 8 }}>
          MAIN
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <Link href="/vinit_admin" style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
            borderRadius: 8, textDecoration: "none", 
            backgroundColor: "rgba(79, 70, 229, 0.1)", // Active bg
            border: "1px solid rgba(79, 70, 229, 0.2)",
            color: "#818cf8", // Active text
            fontWeight: 500
          }}>
            <LayoutDashboard size={18} />
            Overview
          </Link>
          
          <Link href="#" style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
            borderRadius: 8, textDecoration: "none", color: "#a1a1aa", fontWeight: 500
          }}>
            <Users size={18} />
            Users
          </Link>
          
          <Link href="#" style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
            borderRadius: 8, textDecoration: "none", color: "#a1a1aa", fontWeight: 500
          }}>
            <Mail size={18} />
            Feedback
          </Link>
          
          <Link href="#" style={{ 
            display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", 
            borderRadius: 8, textDecoration: "none", color: "#a1a1aa", fontWeight: 500
          }}>
            <ActivitySquare size={18} />
            System Health
          </Link>
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

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
