import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { prisma } from "@repo/database";
import { Prisma } from "@prisma/client";
import JournalList from "@/components/journal/JournalList";

const TRADES_PER_PAGE = 20;

async function SharedJournalContent({ 
  userId,
  searchParams
}: { 
  userId: string;
  searchParams: { page?: string; status?: string; search?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const statusFilter = searchParams.status || "ALL";
  const searchQuery = searchParams.search || "";

  // Build the where clause
  const where: Prisma.TradeWhereInput = { userId };
  if (statusFilter === "OPEN") {
    where.status = { in: ["OPEN", "PARTIAL"] };
  } else if (statusFilter === "CLOSED") {
    where.status = { in: ["CLOSED", "STOP_LOSS_HIT"] };
  } else if (statusFilter === "DELETED") {
    where.status = "DELETED";
  } else {
    // By default, exclude DELETED and ARCHIVED for "ALL"
    where.isArchived = false;
    where.status = { not: "DELETED" };
  }
  
  if (searchQuery) {
    where.symbol = { contains: searchQuery };
  }

  const [trades, totalCount, openCount, closedCount, deletedCount] = await Promise.all([
    prisma.trade.findMany({
      where,
      include: {
        executions: { orderBy: { executionTime: "asc" } },
        mistakes: { include: { mistakeTag: true } },
      },
      orderBy: { entryTime: "desc" },
      take: TRADES_PER_PAGE,
      skip: (page - 1) * TRADES_PER_PAGE,
    }),
    prisma.trade.count({ where }),
    prisma.trade.count({
      where: { userId, isArchived: false, status: { in: ["OPEN", "PARTIAL"] } },
    }),
    prisma.trade.count({
      where: { userId, isArchived: false, status: { in: ["CLOSED", "STOP_LOSS_HIT"] } },
    }),
    prisma.trade.count({
      where: { userId, status: "DELETED" },
    }),
  ]);

  // Use DB-stored P&L values (live prices fetched client-side)
  const serialized = trades.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    exchange: t.exchange,
    direction: t.direction,
    status: t.status,
    avgEntryPrice: t.avgEntryPrice,
    avgExitPrice: t.avgExitPrice,
    totalBuyQty: t.totalBuyQty,
    totalSellQty: t.totalSellQty,
    netPnl: t.netPnl,
    pnlPercentage: t.pnlPercentage,
    rMultiple: t.rMultiple,
    strategy: t.strategy,
    setup: t.setup,
    thesis: t.thesis,
    stopLoss: t.stopLoss,
    target: t.target,
    marketCondition: t.marketCondition,
    confidence: t.confidence,
    notes: t.notes,
    postTradeReview: t.postTradeReview,
    entryTime: t.entryTime.toISOString(),
    exitTime: t.exitTime?.toISOString() || null,
    holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
    totalCharges: t.totalCharges,
    riskAmount: t.riskAmount,
    mistakes: t.mistakes.map((m) => ({
      name: m.mistakeTag.name,
      color: m.mistakeTag.color,
    })),
    executionCount: t.executions.length,
  }));

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Trading Journal</h1>
          <p className="page-description text-muted">
            Detailed log of trades, thoughts and learnings.
          </p>
        </div>
      </div>
      <JournalList 
        trades={serialized} 
        initialStatus={statusFilter}
        initialSearch={searchQuery}
        counts={{ openCount, closedCount, deletedCount }}
      />
    </>
  );
}

export default async function SharedJournalPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const { userId } = await params;
  const resolvedParams = await searchParams;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedJournalContent userId={userId} searchParams={resolvedParams} />
    </Suspense>
  );
}
