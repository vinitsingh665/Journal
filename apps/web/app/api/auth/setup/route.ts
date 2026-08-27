import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { hashPassword, createToken, setSessionCookie } from "@/lib/auth";

// Setup - create initial user
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Account with this email already exists. Please login." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name || "Trader",
        email,
        passwordHash,
        settings: {
          create: {
            defaultCapital: 500000,
            defaultRiskPct: 1.0,
          },
        },
      },
    });

    // Seed mistake tags
    const mistakeTags = [
      { name: "Chased entry", description: "Entered at a price far from planned entry", color: "#EF4444" },
      { name: "Entered late", description: "Entered after the ideal trigger point", color: "#F97316" },
      { name: "FOMO", description: "Fear of missing out drove the entry", color: "#EAB308" },
      { name: "Moved stop loss", description: "Adjusted stop loss against the trade plan", color: "#EF4444" },
      { name: "Took profit early", description: "Exited before target was reached", color: "#F59E0B" },
      { name: "Oversized position", description: "Position size exceeded risk rules", color: "#DC2626" },
      { name: "Revenge trade", description: "Traded to recover a loss emotionally", color: "#B91C1C" },
      { name: "Overtrading", description: "Too many trades in a session", color: "#D97706" },
      { name: "Ignored market condition", description: "Traded against the prevailing market trend", color: "#9333EA" },
      { name: "Weak setup", description: "Setup did not meet all criteria", color: "#7C3AED" },
      { name: "Poor R:R", description: "Risk-to-reward ratio was unfavorable", color: "#6366F1" },
      { name: "Broke trading plan", description: "Deviated from the predefined trading plan", color: "#DC2626" },
    ];

    for (const tag of mistakeTags) {
      await prisma.mistakeTag.upsert({
        where: { name: tag.name },
        update: {},
        create: tag,
      });
    }

    const token = await createToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
