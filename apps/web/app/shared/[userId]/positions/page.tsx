import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { prisma } from "@repo/database";
import PositionsClient from "@/components/positions/PositionsClient";

async function SharedPositionsContent({ userId }: { userId: string }) {
  // Fetch all open positions (status OPEN or PARTIAL)
  const trades = await prisma.trade.findMany({
    where: { 
      userId, 
      isArchived: false,
      status: {
        in: ["OPEN", "PARTIAL"]
      }
    },
    include: {
      mistakes: { include: { mistakeTag: true } },
      executions: { orderBy: { executionTime: "asc" } },
    },
    orderBy: { entryTime: "desc" },
  });

  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  const capital = settings?.defaultCapital || 1000000;

  // Serialize complex dates
  const serializedTrades = trades.map(t => ({
    ...t,
    entryTime: t.entryTime.toISOString(),
    exitTime: t.exitTime?.toISOString() || null,
    holdingPeriodMs: t.holdingPeriodMs ? Number(t.holdingPeriodMs) : null,
    mistakes: t.mistakes.map(m => ({ name: m.mistakeTag.name, color: m.mistakeTag.color })),
    executions: t.executions.map(e => ({
      ...e,
      executionTime: e.executionTime.toISOString(),
    })),
  }));

  return (
    <>
      <PositionsClient initialPositions={serializedTrades} capital={capital} />
    </>
  );
}

export default async function SharedPositionsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <SharedPositionsContent userId={userId} />
    </Suspense>
  );
}
