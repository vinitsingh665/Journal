import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyPassword, createToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";

// Login
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { error: "No account found. Please set up first." },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const token = await createToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

// Logout
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
