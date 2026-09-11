import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/database";
import TradeForm from "@/components/trades/TradeForm";
import { fetchStockQuote } from "@/lib/finance";

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

  // For CRYPTO/NASDAQ/NYSE trades stored in INR, reverse-convert to USD so the
  // edit form shows USD prices (which the user enters naturally for crypto/foreign assets).
  // The PUT handler will convert back to INR on save.
  let tradeData: any = { ...trade };
  const needsReverseConversion = ["NASDAQ", "NYSE", "CRYPTO"].includes(
    trade.exchange.toUpperCase()
  );

  if (needsReverseConversion) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    const baseCurrency = userSettings?.currency || "INR";

    if (baseCurrency === "INR") {
      try {
        const quote = await fetchStockQuote("USDINR", "FX_IDC");
        if (quote?.regularMarketPrice) {
          const rate = quote.regularMarketPrice;
          tradeData = {
            ...trade,
            avgEntryPrice:
              Math.round((trade.avgEntryPrice / rate) * 100) / 100,
            avgExitPrice: trade.avgExitPrice
              ? Math.round((trade.avgExitPrice / rate) * 100) / 100
              : null,
            stopLoss: trade.stopLoss
              ? Math.round((trade.stopLoss / rate) * 100) / 100
              : null,
            target: trade.target
              ? Math.round((trade.target / rate) * 100) / 100
              : null,
          };
        }
      } catch {
        // If rate fetch fails, show stored values as-is (they'll be in INR)
      }
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Edit Trade: {trade.symbol}</h1>
      </div>
      <TradeForm userId={userId} tradeId={trade.id} initialData={tradeData} />
    </>
  );
}
