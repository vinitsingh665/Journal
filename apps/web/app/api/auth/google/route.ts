import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@repo/database";
import { createToken, setSessionCookie } from "@/lib/auth";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { credential, accessToken } = await request.json();

    if (!credential && !accessToken) {
      return NextResponse.json(
        { error: "Google credentials are required" },
        { status: 400 }
      );
    }

    let email, name, googleId;

    if (credential) {
      // Verify the Google ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
      }
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } else {
      // Verify the access token by fetching userinfo
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!userInfoRes.ok) {
        return NextResponse.json({ error: "Invalid Google access token" }, { status: 400 });
      }
      
      const userInfo = await userInfoRes.json();
      if (!userInfo || !userInfo.email) {
        return NextResponse.json({ error: "Invalid Google user info" }, { status: 400 });
      }
      email = userInfo.email;
      name = userInfo.name;
      googleId = userInfo.sub;
    }

    // Find or create the user
    let user = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      // Check if a user with this email exists (if they previously registered, though not possible in current setup)
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link google account to existing email
        user = await prisma.user.update({
          where: { email },
          data: { googleId },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: name || "Trader",
            googleId,
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
      }
    }

    // Issue JWT session token
    const token = await createToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Google Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
