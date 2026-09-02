import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";
import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";

async function SharedCalendarContent({ userId, searchParams }: { userId: string, searchParams: { month?: string; year?: string } }) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  if (searchParams.year !== undefined) {
    const parsedYear = parseInt(String(searchParams.year), 10);
    if (!isNaN(parsedYear)) year = parsedYear;
  }
  if (searchParams.month !== undefined) {
    const parsedMonth = parseInt(String(searchParams.month), 10);
    if (!isNaN(parsedMonth)) month = parsedMonth;
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  // Fetch ONLY trades for the current month
  const trades = await prisma.trade.findMany({
    where: { 
      userId,
      entryTime: {
        gte: startDate,
        lt: endDate
      }
    },
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
      <CalendarView initialTrades={serialized as any} year={year} month={month} />
    </>
  );
}

export default async function SharedCalendarPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { userId } = await params;
  const resolvedParams = await searchParams;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedCalendarContent userId={userId} searchParams={resolvedParams} />
    </Suspense>
  );
}
