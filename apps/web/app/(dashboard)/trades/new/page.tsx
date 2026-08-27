import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TradeForm from "@/components/trades/TradeForm";

export default async function NewTradePage() {
  const userId = await getCurrentUser();
  if (!userId) redirect("/login");

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">New Trade</h1>
      </div>
      <TradeForm userId={userId} />
    </>
  );
}
