import { Suspense } from "react";
import DashboardLoading from "../../../(dashboard)/loading";
import { verifySharedAccess } from "@/lib/shared-auth";
import MistakesClient from "./MistakesClient";

export default async function SharedMistakesPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ userId: string }>; 
  searchParams: Promise<{ t?: string }>; 
}) {
  const { userId } = await params;
  const { t } = await searchParams;

  await verifySharedAccess(userId, "mistakes", t);

  return (
    <Suspense fallback={<DashboardLoading />}>
      <MistakesClient />
    </Suspense>
  );
}
