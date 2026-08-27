import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSharedToken } from "@/lib/jwt";

export async function POST() {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await createSharedToken(userId);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to generate shared link token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
