import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { verifyPassword, createToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";

// Login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect email or password" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google Sign-In" },
        { status: 401 }
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
