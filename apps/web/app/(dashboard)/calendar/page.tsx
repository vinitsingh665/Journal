import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CalendarView from "@/components/calendar/CalendarView";

import { Suspense } from "react";
import DashboardLoading from "../loading";

async function CalendarContent({ searchParams }: { searchParams: { month?: string; year?: string } }) {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

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

  // Create date boundaries for the selected month (in local time / UTC neutral depending on how entryTime is stored)
  // Usually entryTime is stored as UTC, so we query for all trades from the 1st of the month to the 1st of the next month.
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  // Fetch only trades for the current month
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

  const serialized = trades.map((t) => ({
    id: t.id,
    entryTime: t.entryTime.toISOString(),
    netPnl: t.netPnl,
    grossPnl: t.grossPnl,
    totalCharges: t.totalCharges,
  }));

  return <CalendarView initialTrades={serialized as any} year={year} month={month} />;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const resolvedParams = await searchParams;

  return (
    <>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-description text-muted">Review your daily performance and trading activity.</p>
        </div>
      </div>
      <Suspense fallback={<DashboardLoading />}>
        <CalendarContent searchParams={resolvedParams} />
      </Suspense>
    </>
  );
}
