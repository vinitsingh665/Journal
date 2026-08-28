import { NextResponse } from "next/server";
import { createToken, setSessionCookie } from "@/lib/auth";
import prisma from "@repo/database";
import crypto from "crypto";

// Fire-and-forget cleanup of old guest accounts
async function cleanupOldGuests() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find all old guest users
    const oldGuests = await prisma.user.findMany({
      where: {
        isGuest: true,
        createdAt: {
          lt: twentyFourHoursAgo
        }
      },
      select: { id: true }
    });

    // Delete them one by one to avoid huge transactions locking the DB
    for (const guest of oldGuests) {
      const userId = guest.id;
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
    }
  } catch (error) {
    console.error("Failed to cleanup old guests:", error);
  }
}

export async function POST() {
  try {
    // Generate random guest info
    const randomId = crypto.randomBytes(4).toString("hex");
    const name = `Guest_${randomId}`;
    const email = `guest_${randomId}@traderlabs.local`;

    // Create the guest user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        isGuest: true,
        settings: {
          create: {
            tradingStyle: "Exploring",
            about: "I'm just looking around!",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow&backgroundColor=ffd5dc"
          }
        }
      }
    });

    const token = await createToken(user.id);
    await setSessionCookie(token);

    // Trigger cleanup in background after 5s to prevent SQLite locks during redirect
    setTimeout(() => {
      cleanupOldGuests().catch(console.error);
    }, 5000);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { error: "Failed to create guest session" },
      { status: 500 }
    );
  }
}
