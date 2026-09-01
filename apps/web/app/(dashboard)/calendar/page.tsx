import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";

import { Suspense } from "react";
import DashboardLoading from "../loading";

async function CalendarContent() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  // Fetch ALL trades to group by Entry Date — use DB-stored P&L
  const trades = await prisma.trade.findMany({
    where: { userId },
    select: {
      id: true,
      symbol: true,
      exchange: true,
      status: true,
      direction: true,
      avgEntryPrice: true,
      totalBuyQty: true,
      totalSellQty: true,
      entryTime: true,
      netPnl: true,
      grossPnl: true,
      totalCharges: true,
    },
    orderBy: {
      entryTime: "asc",
    },
  });

  const serialized = trades.map((t) => ({
    id: t.id,
    entryTime: t.entryTime.toISOString(),
    netPnl: t.netPnl,
    grossPnl: t.grossPnl,
    totalCharges: t.totalCharges,
  }));

  return <CalendarView initialTrades={serialized as any} />;
}

export default function CalendarPage() {
  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-description text-muted">Review your daily performance and trading activity.</p>
        </div>
      </div>
      <Suspense fallback={<DashboardLoading />}>
        <CalendarContent />
      </Suspense>
    </>
  );
}
