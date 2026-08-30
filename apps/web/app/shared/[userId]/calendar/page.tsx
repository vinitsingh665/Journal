import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import { fetchMultipleQuotes, calculateUnrealizedPnl } from "@/lib/yahoo-finance";
import CalendarView from "@/components/calendar/CalendarView";
import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";

async function SharedCalendarContent({ userId }: { userId: string }) {
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  const baseCurrency = userSettings?.currency || "INR";

  // Fetch ALL trades to group by Entry Date
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

  // Fetch live prices for open positions to show Unrealized P&L
  const openTrades = trades.filter((t) => t.status === "OPEN" || t.status === "PARTIAL");
  const uniqueSymbols = [
    ...new Set(openTrades.map((t) => JSON.stringify({ symbol: t.symbol, exchange: t.exchange }))),
  ].map((s) => JSON.parse(s) as { symbol: string; exchange: string });

  let liveQuotes = new Map<string, { regularMarketPrice: number }>();
  try {
    if (uniqueSymbols.length > 0) {
      liveQuotes = await fetchMultipleQuotes(uniqueSymbols, baseCurrency);
    }
  } catch (e) {
    console.error("Failed to fetch live quotes for calendar:", e);
  }

  const serialized = trades.map((t) => {
    let netPnl = t.netPnl;
    if (t.status === "OPEN" || t.status === "PARTIAL") {
      const quote = liveQuotes.get(`${t.symbol}:${t.exchange}`);
      if (quote) {
        const openQty = t.totalBuyQty - t.totalSellQty;
        if (openQty > 0) {
          const { pnl } = calculateUnrealizedPnl(t.avgEntryPrice, quote.regularMarketPrice, openQty, t.direction as "LONG" | "SHORT");
          netPnl = pnl;
        }
      }
    }
    return {
      id: t.id,
      entryTime: t.entryTime.toISOString(),
      netPnl,
      grossPnl: t.grossPnl,
      totalCharges: t.totalCharges,
    };
  });

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
