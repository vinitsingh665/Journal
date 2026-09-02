import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TradeDetail from "@/components/trades/TradeDetail";

export default async function TradeDetailPage({
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
      mistakes: { include: { mistakeTag: true } },
    },
  });

  if (!trade) redirect("/trades");

  const serialized = {
    id: trade.id,
    symbol: trade.symbol,
    exchange: trade.exchange,
    direction: trade.direction,
    status: trade.status,
    totalBuyQty: trade.totalBuyQty,
    totalSellQty: trade.totalSellQty,
    avgEntryPrice: trade.avgEntryPrice,
    avgExitPrice: trade.avgExitPrice,
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
      orderType: e.orderType,
    })),
    mistakes: trade.mistakes.map((m) => ({
      id: m.id,
      name: m.mistakeTag.name,
      color: m.mistakeTag.color,
    })),
  };

  return <TradeDetail trade={serialized} />;
}
