import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import "@/app/notes.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/home");
  }

  return (
    <div className="app-layout">
      <DashboardShell userId={userId}>
        {children}
      </DashboardShell>
    </div>
  );
}
