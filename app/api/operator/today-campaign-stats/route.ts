import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get campaign stats for today
    // For now, return placeholder - will integrate with actual campaign system
    const stats = {
      sent: 47,
      opened: 12,
      clicked: 6,
      replied: 3,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("[TODAY CAMPAIGN STATS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign stats" },
      { status: 500 }
    );
  }
}
