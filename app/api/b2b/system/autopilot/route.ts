import { NextResponse } from "next/server";
import { getAutopilotStatus } from "@/lib/b2b-causal-validator";

export async function GET() {
  try {
    const status = await getAutopilotStatus();

    return NextResponse.json({
      success: true,
      status,
      explanation: {
        OBSERVE_ONLY: "System observes patterns only, no recommendations",
        SUGGESTION_ONLY: "System recommends actions only, operator must approve",
        HUMAN_APPROVAL_REQUIRED: "All execution requires explicit operator approval",
        LIMITED_AUTOPILOT: "System can execute when confidence ≥90% and guardrails pass",
      }[status.systemMode] || "",
      requirements: {
        causalValidation: status.causalValidationRequired,
        minCausalConfidence: `${status.minCausalConfidence}%`,
        minSampleSize: status.minSampleSize,
        revenueStability: status.revenueStabilityRequired,
      },
      allowedActions: {
        automated: status.canExecuteAutomated ? ["send_email", "apply_variant"] : [],
        alwaysAllowed: ["recommendation", "analysis"],
      },
    });
  } catch (error) {
    console.error("[B2B AUTOPILOT STATUS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch autopilot status" },
      { status: 500 }
    );
  }
}
