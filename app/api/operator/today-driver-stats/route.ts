import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Call the admin active-drivers endpoint
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/active-drivers`,
      {
        headers: {
          "x-admin-email": "whoisjimi.today@gmail.com",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch driver stats");
    }

    const data = await res.json();

    return NextResponse.json({
      available: data.live_drivers?.available_now || 0,
      revenue: data.revenue_today?.total_earned || "£0",
    });
  } catch (error) {
    console.error("[TODAY DRIVER STATS] Error:", error);
    return NextResponse.json(
      {
        available: 0,
        revenue: "£0",
      },
      { status: 200 }
    );
  }
}
