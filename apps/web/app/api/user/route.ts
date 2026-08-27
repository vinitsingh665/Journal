import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";
import prisma from "@repo/database";

export async function PUT(req: Request) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isGuest: true } });
    if (user?.isGuest) {
      return NextResponse.json({ error: "Guest users cannot modify profile" }, { status: 403 });
    }

    const body = await req.json();
    const { name, tradingStyle, about, avatar } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    if (tradingStyle !== undefined || about !== undefined || avatar !== undefined) {
      await prisma.userSettings.upsert({
        where: { userId },
        update: { 
          ...(tradingStyle !== undefined && { tradingStyle }),
          ...(about !== undefined && { about }),
          ...(avatar !== undefined && { avatar })
        },
        create: {
          userId,
          tradingStyle: tradingStyle || "Swing Trader",
          about: about || "",
          avatar: avatar || ""
        }
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safely delete all associated data in a transaction in the correct order
    await prisma.$transaction([
      prisma.screenshot.deleteMany({ where: { userId } }),
      prisma.execution.deleteMany({ where: { userId } }),
      prisma.trade.deleteMany({ where: { userId } }),
      prisma.tradePlan.deleteMany({ where: { userId } }),
      prisma.position.deleteMany({ where: { userId } }),
      prisma.dailyJournal.deleteMany({ where: { userId } }),
      prisma.rawImportData.deleteMany({ where: { importLog: { userId } } }),
      prisma.importLog.deleteMany({ where: { userId } }),
      prisma.userSettings.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    // Clear session
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
