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
    redirect("/home");
  }

  // Retry once on connection errors (Prisma cold-start / idle connection timeout on serverless)
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, settings: true, isGuest: true, role: true }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConnectionError =
      msg.includes("connection") ||
      msg.includes("socket") ||
      msg.includes("ECONNRESET") ||
      msg.includes("Can't reach database") ||
      msg.includes("prepared statement") ||
      msg.includes("Connection pool");

    if (isConnectionError) {
      // Wait briefly for the connection pool to recover, then retry once
      await new Promise((r) => setTimeout(r, 500));
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, settings: true, isGuest: true, role: true }
      });
    } else {
      throw err;
    }
  }
  
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

