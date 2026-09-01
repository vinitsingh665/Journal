import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import JournalDetail from "@/components/journal/JournalDetail";

export default async function SharedJournalDetailPage({
  params,
}: {
  params: Promise<{ userId: string; id: string }>;
}) {
  const { userId, id } = await params;

  const [trade, allTradeIds] = await Promise.all([
    prisma.trade.findFirst({
      where: { id, userId },
      include: {
        executions: { orderBy: { executionTime: "asc" } },
        mistakes: { include: { mistakeTag: true } },
        screenshots: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.trade.findMany({
      where: { userId },
      select: { id: true },
      orderBy: { entryTime: "desc" },
    }),
  ]);

  if (!trade) notFound();

  // Get prev/next trade IDs for navigation
  const tradeIds = allTradeIds.map((t) => t.id);
  const currentIndex = tradeIds.indexOf(id);
  const prevId = currentIndex > 0 ? tradeIds[currentIndex - 1] : null;
  const nextId = currentIndex < tradeIds.length - 1 ? tradeIds[currentIndex + 1] : null;

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
    mistakes: trade.mistakes.map((m) => ({
      name: m.mistakeTag.name,
      color: m.mistakeTag.color,
    })),
    prevId,
    nextId,
  };

  return <JournalDetail trade={serialized} isShared={true} sharedUserId={userId} />;
}
