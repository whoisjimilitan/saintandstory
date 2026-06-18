import { NextResponse } from "next/server";
import { aggregateBehaviorMetrics } from "@/lib/b2b-behavior-aggregation";

export async function POST(request: Request) {
  try {
    // Optional: Add auth check here if needed
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await aggregateBehaviorMetrics();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Behavior metrics recomputed",
      created: result.created,
      updated: result.updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[BEHAVIOR RECOMPUTE] Error:", error);
    return NextResponse.json(
      { error: "Failed to recompute metrics" },
      { status: 500 }
    );
  }
}
