import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";

async function SharedCalendarContent({ userId }: { userId: string }) {
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

  if (!trades) notFound();

  const serialized = trades.map((t) => ({
    id: t.id,
    entryTime: t.entryTime.toISOString(),
    netPnl: t.netPnl,
    grossPnl: t.grossPnl,
    totalCharges: t.totalCharges,
  }));

  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">Trading Calendar</h1>
          <p className="page-description text-muted">Daily performance at a glance.</p>
        </div>
      </div>
      <CalendarView initialTrades={serialized as any} />
    </>
  );
}

export default async function SharedCalendarPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedCalendarContent userId={userId} />
    </Suspense>
  );
}
