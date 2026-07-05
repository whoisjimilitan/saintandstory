import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[TODAY PHONE STATS] Fetching phone-ready prospects");

  try {
    // Count prospects with phone number but no email (ready for phone outreach)
    const phoneReadyCount = await prisma.b2bLead.count({
      where: {
        phone: { not: null },
        OR: [
          { email: null },
          { email: "" },
        ],
      },
    });

    console.log("[TODAY PHONE STATS] Phone-ready prospects:", phoneReadyCount);

    return NextResponse.json({
      count: phoneReadyCount,
    });
  } catch (error) {
    console.error("[TODAY PHONE STATS] Error:", error);
    return NextResponse.json(
      { count: 0 },
      { status: 200 }
    );
  }
}
