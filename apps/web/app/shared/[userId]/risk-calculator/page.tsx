import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { verifySharedAccess } from "@/lib/shared-auth";
import RiskCalculatorClient from "./RiskCalculatorClient";

export default async function SharedRiskCalculatorPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ userId: string }>; 
  searchParams: Promise<{ t?: string }>; 
}) {
  const { userId } = await params;
  const { t } = await searchParams;

  await verifySharedAccess(userId, "risk-calculator", t);

  return (
    <Suspense fallback={<DashboardLoading />}>
      <RiskCalculatorClient />
    </Suspense>
  );
}
