import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Count opportunities in "queued" status waiting to be sent
    const count = await prisma.opportunityFeed.count({
      where: { status: "queued" },
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("[OPPORTUNITIES WAITING] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
