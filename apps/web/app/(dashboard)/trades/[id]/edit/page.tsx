import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import TradeForm from "@/components/trades/TradeForm";

export default async function EditTradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  const { id } = await params;

  const trade = await prisma.trade.findFirst({
    where: { id, userId },
  });

  if (!trade) {
    redirect("/trades");
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Edit Trade: {trade.symbol}</h1>
      </div>
      <TradeForm userId={userId} tradeId={trade.id} initialData={trade} />
    </>
  );
}
