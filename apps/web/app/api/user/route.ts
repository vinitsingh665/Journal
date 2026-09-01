import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth";
import prisma from "@repo/database";
import { encrypt } from "@/lib/encryption";

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        settings: true,
        trades: {
          where: { status: { in: ["OPEN", "PARTIAL"] }, isArchived: false }
        }
      }
    });

    if (user && user.settings) {
      // Redact sensitive keys from being sent to the browser
      const hasDhanToken = !!user.settings.dhanAccessToken;
      const hasGeminiKey = !!user.settings.geminiApiKey;
      
      user.settings.dhanAccessToken = hasDhanToken ? "********" : "";
      user.settings.geminiApiKey = hasGeminiKey ? "********" : "";
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { name, tradingStyle, about, avatar, defaultCapital, dhanClientId, dhanAccessToken } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    // Only encrypt if they provided a real token (not the placeholder). Empty string means delete.
    const newDhanToken = dhanAccessToken === "" ? "" : (dhanAccessToken && dhanAccessToken !== "********" ? encrypt(dhanAccessToken) : undefined);

    if (tradingStyle !== undefined || about !== undefined || avatar !== undefined || defaultCapital !== undefined || dhanClientId !== undefined || newDhanToken !== undefined) {
      await prisma.userSettings.upsert({
        where: { userId },
        update: { 
          ...(tradingStyle !== undefined && { tradingStyle }),
          ...(about !== undefined && { about }),
          ...(avatar !== undefined && { avatar }),
          ...(defaultCapital !== undefined && { defaultCapital: Number(defaultCapital) }),
          ...(dhanClientId !== undefined && { dhanClientId }),
          ...(newDhanToken !== undefined && { dhanAccessToken: newDhanToken })
        },
        create: {
          userId,
          tradingStyle,
          about,
          avatar,
          defaultCapital: defaultCapital ? Number(defaultCapital) : 500000,
          dhanClientId,
          dhanAccessToken: newDhanToken
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
