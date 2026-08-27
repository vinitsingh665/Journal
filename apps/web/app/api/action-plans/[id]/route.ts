import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@repo/database";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Verify ownership
    const actionPlan = await prisma.actionPlan.findUnique({
      where: { id },
    });

    if (!actionPlan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (actionPlan.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.actionPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete action plan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
