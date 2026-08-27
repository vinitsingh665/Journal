import { Suspense } from "react";
import DashboardLoading from "../loading";
import { prisma } from "@repo/database";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PositionsClient from "@/components/positions/PositionsClient";

async function PositionsContent() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

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

  return <PositionsClient initialPositions={serializedTrades} capital={capital} />;
}

export default function PositionsPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <PositionsContent />
    </Suspense>
  );
}
