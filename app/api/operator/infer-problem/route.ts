import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inferProblemFromConfession } from "@/lib/confession-inferencer";
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

    // Use the intelligent inference system
    const inference = await inferProblemFromConfession(problem_description);

    if (!inference.inferred_problem_type || inference.confidence < 0.5) {
      console.log(`[INFER-PROBLEM] Low confidence: ${inference.confidence}`);
      return NextResponse.json(
        { error: "Could not confidently infer problem. Please select a category manually." },
        { status: 400 }
      );
    }

    const problemType = inference.inferred_problem_type;
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
