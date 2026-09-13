import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { verifySharedAccess } from "@/lib/shared-auth";
import { prisma } from "@repo/database";
import TradesList from "@/components/trades/TradesList";

async function SharedTradesContent({ userId }: { userId: string }) {
  const trades = await prisma.trade.findMany({
    where: { userId, isArchived: false },
    include: {
      mistakes: { include: { mistakeTag: true } },
      executions: { orderBy: { executionTime: "asc" } },
    },
    orderBy: { entryTime: "desc" },
  });

  // Use DB-stored P&L values (live prices fetched client-side)
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
    <>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Trades</h1>
          <p className="page-description text-muted">
            All executed trades. Review each trade and learn from it.
          </p>
        </div>
      </div>
      <TradesList trades={serializedTrades as any} isShared={true} sharedUserId={userId} />
    </>
  );
}

export default async function SharedTradesPage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<{ t?: string }> }) {
  const { userId } = await params;
  const { t } = await searchParams;
  
  await verifySharedAccess(userId, "trades", t);
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedTradesContent userId={userId} />
    </Suspense>
  );
}
