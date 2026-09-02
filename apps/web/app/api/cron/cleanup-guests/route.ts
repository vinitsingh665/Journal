import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Vercel Cron Authentication (optional but recommended)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const guestsToDelete = await prisma.user.findMany({
      where: {
        isGuest: true,
        createdAt: { lt: twentyFourHoursAgo },
      },
      select: { id: true },
    });

    if (guestsToDelete.length === 0) {
      return NextResponse.json({ success: true, message: "No guest accounts to delete." });
    }

    let deletedCount = 0;

    for (const guest of guestsToDelete) {
      const userId = guest.id;

      // Safely delete all associated data in a transaction in the correct order
      // We also include relations that might not have been in the manual delete route
      await prisma.$transaction([
        prisma.screenshot.deleteMany({ where: { userId } }),
        prisma.execution.deleteMany({ where: { userId } }),
        prisma.trade.deleteMany({ where: { userId } }),
        prisma.tradePlan.deleteMany({ where: { userId } }),
        prisma.position.deleteMany({ where: { userId } }),
        prisma.dailyJournal.deleteMany({ where: { userId } }),
        prisma.rawImportData.deleteMany({ where: { importLog: { userId } } }),
        prisma.importLog.deleteMany({ where: { userId } }),
        prisma.actionPlan.deleteMany({ where: { userId } }),
        prisma.mistakeLog.deleteMany({ where: { userId } }),
        prisma.riskTemplate.deleteMany({ where: { userId } }),
        prisma.sharedLink.deleteMany({ where: { userId } }),
        prisma.passwordResetToken.deleteMany({ where: { userId } }),
        prisma.userSettings.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
      ]);
      deletedCount++;
    }

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error("Error cleaning up guest accounts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
