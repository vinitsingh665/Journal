import { NextResponse } from "next/server";
import prisma from "@repo/database";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Ensure the mistake belongs to the user
    const mistake = await prisma.mistakeLog.findUnique({
      where: { id },
    });

    if (!mistake || mistake.userId !== userId) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
    }

    await prisma.mistakeLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete mistake:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
