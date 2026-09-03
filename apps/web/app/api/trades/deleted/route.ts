import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";

export async function DELETE(request: NextRequest) {
  const userId = await getCurrentUser();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { count } = await prisma.trade.deleteMany({
      where: {
        userId,
        status: "DELETED",
      },
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Failed to empty trash:", error);
    return NextResponse.json(
      { error: "Failed to delete trades" },
      { status: 500 }
    );
  }
}
