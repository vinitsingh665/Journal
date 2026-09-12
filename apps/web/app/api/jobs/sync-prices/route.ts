import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { syncPricesForUser } from "@/lib/sync-prices";

export async function POST(request: NextRequest) {
  const queryUserId = request.nextUrl.searchParams.get("userId");
  const userId = queryUserId || (await getCurrentUser());
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await syncPricesForUser(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[sync-prices] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}