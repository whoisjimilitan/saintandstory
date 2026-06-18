import { NextResponse } from "next/server";
import { attributeRevenueToPatterns } from "@/lib/b2b-revenue-attribution";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await attributeRevenueToPatterns();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Revenue attributed to patterns",
      created: result.created,
      updated: result.updated,
      totalRevenue: result.totalRevenue,
      patternsCount: result.patterns.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[REVENUE ATTRIBUTION] Error:", error);
    return NextResponse.json(
      { error: "Failed to attribute revenue" },
      { status: 500 }
    );
  }
}
