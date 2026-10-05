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
          <main className="app-content">
            <div className="flex-1 w-full p-8 flex flex-col gap-6 animate-pulse">
              <div className="h-10 bg-surface rounded-lg w-1/4 mb-4 border border-border-secondary/30"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                <div className="h-32 bg-surface rounded-2xl border border-border-secondary/30"></div>
                <div className="h-32 bg-surface rounded-2xl border border-border-secondary/30"></div>
                <div className="h-32 bg-surface rounded-2xl border border-border-secondary/30"></div>
              </div>
              <div className="h-[500px] bg-surface rounded-2xl mt-4 w-full border border-border-secondary/30"></div>
            </div>
          </main>
          <NotesFAB />
        </div>
      </>
    }>
      <ShellData userId={userId}>{children}</ShellData>
    </Suspense>
  );
}
