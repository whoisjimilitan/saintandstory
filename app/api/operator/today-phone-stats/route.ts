import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Count prospects with no email from B2bLead table
    const noEmailCount = await prisma.b2bLead.count({
      where: {
        OR: [
          { email: null },
          { email: "" },
        ],
      },
    });

    return NextResponse.json({
      count: noEmailCount,
    });
  } catch (error) {
    console.error("[TODAY PHONE STATS] Error:", error);
    return NextResponse.json(
      { count: 0 },
      { status: 200 }
    );
  }
}
