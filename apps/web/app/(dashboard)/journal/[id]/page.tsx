import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { fetchMultipleQuotes, calculateUnrealizedPnl } from "@/lib/yahoo-finance";
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

  if (!trade) notFound();

  // Get all trade IDs for navigation (prev/next)
  const allTradeIds = await prisma.trade.findMany({
    where: { userId },
    select: { id: true },
    orderBy: { entryTime: "desc" },
  });
  const tradeIds = allTradeIds.map((t) => t.id);
  const currentIndex = tradeIds.indexOf(id);
  const prevId = currentIndex > 0 ? tradeIds[currentIndex - 1] : null;
  const nextId = currentIndex < tradeIds.length - 1 ? tradeIds[currentIndex + 1] : null;

  let netPnl = trade.netPnl;
  let pnlPercentage = trade.pnlPercentage;
  let rMultiple = trade.rMultiple;

  const isOpen = trade.status === "OPEN" || trade.status === "PARTIAL";
  if (isOpen) {
    try {
      const quotes = await fetchMultipleQuotes([
        { symbol: trade.symbol, exchange: trade.exchange }
      ]);
      const quoteKey = `${trade.symbol}:${trade.exchange}`;
      const quote = quotes.get(quoteKey);
      
      if (quote) {
        const openQty = trade.totalBuyQty - trade.totalSellQty;
        if (openQty > 0) {
          const direction = trade.direction as "LONG" | "SHORT";
          const unrealized = calculateUnrealizedPnl(
            trade.avgEntryPrice,
            quote.regularMarketPrice,
            openQty,
            direction
          );
          
          netPnl = unrealized.pnl;
          pnlPercentage = unrealized.pnlPercent;
          
          if (trade.riskAmount && trade.riskAmount > 0) {
            rMultiple = netPnl / trade.riskAmount;
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch live quote for journal detail:", e);
    }
  }

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
    netPnl,
    pnlPercentage,
    riskAmount: trade.riskAmount,
    rMultiple,
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
