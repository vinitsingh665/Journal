import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import NotesFAB from "@/components/notes/NotesFAB";
import prisma from "@repo/database";

async function ShellData({ userId, children }: { userId: string, children: React.ReactNode }) {
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, settings: true, isGuest: true, role: true }
    });
  } catch (err: unknown) {
    // Retry once
    await new Promise((r) => setTimeout(r, 500));
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, settings: true, isGuest: true, role: true }
    });
  }

  const userName = user?.name || "Trader";
  const tradingStyle = user?.settings?.tradingStyle || "Swing Trader";
  const avatar = user?.settings?.avatar || null;

  return (
    <>
      <Sidebar userName={userName} tradingStyle={tradingStyle} avatar={avatar} />
      <div className="app-main">
        <Topbar userName={userName} avatar={avatar} isGuest={user?.isGuest} userId={userId} role={user?.role} />
        <main className="app-content">{children}</main>
        <NotesFAB />
      </div>
    </>
  );
}

export function DashboardShell({ userId, children }: { userId: string, children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <>
        <Sidebar userName="Loading..." tradingStyle="..." avatar={null} />
        <div className="app-main">
          <Topbar userName="Loading..." avatar={null} isGuest={false} userId={userId} role="USER" />
          <main className="app-content">{children}</main>
          <NotesFAB />
        </div>
      </>
    }>
      <ShellData userId={userId}>{children}</ShellData>
    </Suspense>
  );
}
