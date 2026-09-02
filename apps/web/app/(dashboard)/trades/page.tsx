import { Suspense } from "react";
import DashboardLoading from "../loading";
import { prisma } from "@repo/database";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import TradesList from "@/components/trades/TradesList";

const TRADES_PER_PAGE = 12;

async function TradesContent({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; search?: string; sort?: string; dir?: string };
}) {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const statusFilter = searchParams.status || "ALL";
  const searchQuery = searchParams.search || "";
  const sortField = searchParams.sort || "date";
  const sortDir = (searchParams.dir || "desc") as "asc" | "desc";

  // Build the where clause
  const where: Prisma.TradeWhereInput = { userId, isArchived: false };
  if (statusFilter === "OPEN") {
    where.status = { in: ["OPEN", "PARTIAL"] };
  } else if (statusFilter === "CLOSED") {
    where.status = { in: ["CLOSED", "STOP_LOSS_HIT"] };
  }
  if (searchQuery) {
    where.symbol = { contains: searchQuery };
  }

  // Build sort
  let orderBy: Prisma.TradeOrderByWithRelationInput = { entryTime: sortDir };
  if (sortField === "symbol") orderBy = { symbol: sortDir };
  else if (sortField === "pnl") orderBy = { netPnl: sortDir };
  else if (sortField === "r") orderBy = { rMultiple: sortDir };

  // Fetch paginated trades and counts in parallel
  const [
    trades, 
    totalCount, 
    openCount, 
    closedCount, 
    kpiAggregates, 
    rAggregates,
    winningCount,
    tradesWithPnl
  ] = await Promise.all([
    prisma.trade.findMany({
      where,
      include: {
        mistakes: { include: { mistakeTag: true } },
        executions: { orderBy: { executionTime: "asc" } },
      },
      orderBy,
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
    prisma.trade.aggregate({
      where: { userId, isArchived: false },
      _sum: { netPnl: true },
      _count: true,
      _max: { netPnl: true },
      _min: { netPnl: true },
    }),
    prisma.trade.aggregate({
      where: { userId, isArchived: false, rMultiple: { not: null } },
      _avg: { rMultiple: true },
    }),
    prisma.trade.count({
      where: { userId, isArchived: false, netPnl: { gt: 0 } },
    }),
    prisma.trade.count({
      where: { userId, isArchived: false, netPnl: { not: 0 } },
    }),
  ]);

  // Calculate win rate from DB
  const totalTrades = kpiAggregates._count;
  const winRate = tradesWithPnl > 0 ? (winningCount / tradesWithPnl) * 100 : 0;

  const kpis = {
    total: totalTrades,
    winRate,
    totalPnl: kpiAggregates._sum.netPnl || 0,
    avgR: rAggregates._avg.rMultiple || 0,
    best: totalTrades > 0 ? kpiAggregates._max.netPnl : null,
    worst: totalTrades > 0 ? kpiAggregates._min.netPnl : null,
    openCount,
    closedCount,
  };

  // Handle edge case: single trade
  if (totalTrades === 1) {
    if ((kpis.best || 0) >= 0) kpis.worst = null;
    else kpis.best = null;
  }

  // Serialize trades
  const serializedTrades = trades.map((t) => ({
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
    stopLoss: t.stopLoss,
    target: t.target,
    marketCondition: t.marketCondition,
    notes: t.notes,
    entryTime: t.entryTime.toISOString(),
    exitTime: t.exitTime?.toISOString() || null,
    holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
    mistakes: t.mistakes.map((m) => ({ name: m.mistakeTag.name, color: m.mistakeTag.color })),
    executions: t.executions.map((e) => ({
      id: e.id,
      side: e.side,
      quantity: e.quantity,
      price: e.price,
      executionTime: e.executionTime.toISOString(),
    })),
  }));

  return (
    <TradesList
      trades={serializedTrades}
      kpis={kpis}
      pagination={{
        page,
        totalCount,
        totalPages: Math.ceil(totalCount / TRADES_PER_PAGE),
        perPage: TRADES_PER_PAGE,
      }}
      filters={{
        status: statusFilter,
        search: searchQuery,
        sort: sortField,
        dir: sortDir,
      }}
    />
  );
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string; sort?: string; dir?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Trades</h1>
          <p className="page-description text-muted">
            All your executed trades. Review each trade and learn from it.
          </p>
        </div>
        <div className="page-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* <DhanSyncButton /> */}
          <Link href="/import" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Import CSV
          </Link>
          <Link href="/trades/new" className="btn btn-primary">
            + Add Trade
          </Link>
        </div>
      </div>
      <Suspense fallback={<DashboardLoading />}>
        <TradesContent searchParams={resolvedParams} />
      </Suspense>
    </>
  );
}
