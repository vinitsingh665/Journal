import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import {
  hashPassword,
  verifyPassword,
  createToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

// Check if user exists
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ hasUser: userCount > 0 });
  } catch {
    return NextResponse.json({ hasUser: false });
  }
}
