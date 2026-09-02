import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import JournalDetail from "@/components/journal/JournalDetail";

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId },
    include: {
      executions: { orderBy: { executionTime: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
      mistakes: { include: { mistakeTag: true } },
      screenshots: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trade) redirect("/journal");

  // Get prev/next trade IDs efficiently (1 query each instead of fetching ALL IDs)
  const [prevTrade, nextTrade] = await Promise.all([
    prisma.trade.findFirst({
      where: { userId, entryTime: { gt: trade.entryTime } },
      select: { id: true },
      orderBy: { entryTime: "asc" },
    }),
    prisma.trade.findFirst({
      where: { userId, entryTime: { lt: trade.entryTime } },
      select: { id: true },
      orderBy: { entryTime: "desc" },
    }),
  ]);

  const prevId = prevTrade?.id || null;
  const nextId = nextTrade?.id || null;

  // Use DB-stored P&L values (live prices fetched client-side)
  const serialized = {
    id: trade.id,
    symbol: trade.symbol,
    exchange: trade.exchange,
    direction: trade.direction,
    status: trade.status,
    avgEntryPrice: trade.avgEntryPrice,
    avgExitPrice: trade.avgExitPrice,
    totalBuyQty: trade.totalBuyQty,
    totalSellQty: trade.totalSellQty,
    grossPnl: trade.grossPnl,
    totalCharges: trade.totalCharges,
    netPnl: trade.netPnl,
    pnlPercentage: trade.pnlPercentage,
    riskAmount: trade.riskAmount,
    rMultiple: trade.rMultiple,
    entryTime: trade.entryTime.toISOString(),
    exitTime: trade.exitTime?.toISOString() || null,
    holdingPeriodMs: trade.holdingPeriodMs ? Number(trade.holdingPeriodMs) : null,
    strategy: trade.strategy,
    setup: trade.setup,
    thesis: trade.thesis,
    plannedEntry: trade.plannedEntry,
    stopLoss: trade.stopLoss,
    target: trade.target,
    expectedRR: trade.expectedRR,
    marketCondition: trade.marketCondition,
    confidence: trade.confidence,
    reasonForEntry: trade.reasonForEntry,
    reasonForExit: trade.reasonForExit,
    emotionalState: trade.emotionalState,
    notes: trade.notes,
    postTradeReview: trade.postTradeReview,
    executions: trade.executions.map((e) => ({
      id: e.id,
      side: e.side,
      quantity: e.quantity,
      price: e.price,
      executionTime: e.executionTime.toISOString(),
      totalCharges: e.totalCharges,
      orderType: e.orderType,
    })),
    events: trade.events.map((e) => ({
      id: e.id,
      type: e.type,
      description: e.description,
      oldValue: e.oldValue,
      newValue: e.newValue,
      createdAt: e.createdAt.toISOString(),
    })),
    mistakes: trade.mistakes.map((m) => ({
      name: m.mistakeTag.name,
      color: m.mistakeTag.color,
    })),
    prevId,
    nextId,
  };

  return <JournalDetail trade={serialized} />;
}
