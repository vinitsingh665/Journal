import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

/**
 * Keep-alive cron job — runs every 6 hours.
 * Executes a minimal DB query to prevent the database connection
 * from going idle and causing cold-start errors on dashboard routes.
 */
export async function GET(request: Request) {
  // Verify Vercel Cron Secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Minimal query — just count users, extremely cheap
    const count = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      ping: "pong",
      userCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/ping] DB ping failed:", error);
    return NextResponse.json(
      { ok: false, error: "DB ping failed" },
      { status: 500 }
    );
  }
}
