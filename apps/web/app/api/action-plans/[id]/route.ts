import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@repo/database";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    if (actionPlan.userId !== session.user.id) {
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
