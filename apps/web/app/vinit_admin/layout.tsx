import React from "react";
import { Metadata } from "next";
import { AdminSidebar } from "../../components/admin/AdminSidebar";

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
      <AdminSidebar />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}
