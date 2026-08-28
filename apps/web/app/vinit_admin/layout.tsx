import React from "react";
import { Metadata } from "next";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Panel | TraderLabs",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "MEMBER")) {
    redirect("/dashboard");
  }

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
