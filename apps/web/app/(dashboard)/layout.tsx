import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import NotesFAB from "@/components/notes/NotesFAB";
import prisma from "@repo/database";
import "@/app/notes.css";

export default async function DashboardLayout({
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
    select: { name: true, settings: true, isGuest: true, role: true }
  });
  
  const userName = user?.name || "Trader";
  const tradingStyle = user?.settings?.tradingStyle || "Swing Trader";
  const avatar = user?.settings?.avatar || null;

  return (
    <div className="app-layout">
      <Sidebar userName={userName} tradingStyle={tradingStyle} avatar={avatar} />
      <div className="app-main">
        <Topbar userName={userName} avatar={avatar} isGuest={user?.isGuest} userId={userId} role={user?.role} />
        <main className="app-content">{children}</main>
        <NotesFAB />
      </div>
    </div>
  );
}

