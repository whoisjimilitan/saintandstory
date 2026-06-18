import { NextResponse } from "next/server";
import { generateLearningReport } from "@/lib/b2b/learning-engine";

/**
 * WAVE 5: Learning API
 * Pure observation layer (read-only)
 * Generates insights from what already happened
 * NEVER influences system behavior
 */
export async function GET(request: Request) {
  try {
    const report = await generateLearningReport();

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("[B2B LEARNING] Error:", error);
    return NextResponse.json(
      { error: "Failed to load learning metrics" },
      { status: 500 }
    );
  }
}
