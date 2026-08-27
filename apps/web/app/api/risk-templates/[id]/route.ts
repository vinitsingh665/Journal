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

    const template = await prisma.riskTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });
    }

    await prisma.riskTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete risk template:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
