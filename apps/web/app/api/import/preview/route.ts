import { NextRequest, NextResponse } from "next/server";
import { getImportPreview } from "@repo/trading-engine";

export async function POST(request: NextRequest) {
  try {
    const { csvContent } = await request.json();
    if (!csvContent) {
      return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
    }

    const preview = getImportPreview(csvContent);
    return NextResponse.json(preview);
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Failed to parse CSV" }, { status: 500 });
  }
}
