import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inferProblemFromDescription } from "@/lib/rule-based-inferencer";
import { getProblemType } from "@/lib/problems-map";
import { getProblemCategory } from "@/lib/category-map";

export const dynamic = "force-dynamic";

/**
 * Intelligently infer problem type from freeform description
 *
 * User describes a problem → System infers the category and problem type
 * Example: "Struggling with urgent medication delivery" → hospital_supply_delivery
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { problem_description, business_name } = body;

    if (!problem_description?.trim()) {
      return NextResponse.json(
        { error: "Problem description required" },
        { status: 400 }
      );
    }

    console.log(`[INFER-PROBLEM] Analyzing: "${problem_description}" for ${business_name || "unknown"}`);

    // Use rule-based inference (fast, free, no API calls)
    const inference = inferProblemFromDescription(problem_description);

    if (!inference.problem_type || inference.confidence < 0.65) {
      console.log(`[INFER-PROBLEM] Low confidence: ${inference.confidence}. Requesting manual selection.`);
      return NextResponse.json(
        {
          success: false,
          problem_type: null,
          confidence: inference.confidence,
          message: "Could not confidently infer. Please select from the list."
        },
        { status: 200 }
      );
    }

    const problemType = inference.problem_type;
    const problem = getProblemType(problemType);

    if (!problem) {
      return NextResponse.json(
        { error: `Invalid problem type: ${problemType}` },
        { status: 400 }
      );
    }

    // Map problem type to category name for display
    const category = getProblemCategory(problemType);

    console.log(`[INFER-PROBLEM] ✓ Inferred: ${problemType} (${category}) with ${Math.round(inference.confidence * 100)}% confidence`);

    return NextResponse.json({
      success: true,
      problem_type: problemType,
      category: category,
      confidence: inference.confidence,
      reasoning: inference.reasoning
    });
  } catch (error) {
    console.error("[INFER-PROBLEM] Error:", error);
    return NextResponse.json(
      { error: "Failed to infer problem", details: String(error) },
      { status: 500 }
    );
  }
}
