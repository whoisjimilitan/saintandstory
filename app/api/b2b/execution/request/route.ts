import { NextResponse } from "next/server";
import { getAutopilotStatus } from "@/lib/b2b-causal-validator";
import { checkGuardrails } from "@/lib/b2b-safety-guardrails";
import { logSystemOverride } from "@/lib/b2b-safety-guardrails";

interface ExecutionRequest {
  action: string; // "send_email" | "apply_variant"
  variantId?: string;
  prospectId?: string;
  campaignId?: string;
  reason?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExecutionRequest;

    if (!body.action) {
      return NextResponse.json(
        { error: "Missing action" },
        { status: 400 }
      );
    }

    // Get autopilot status
    const autopilotStatus = await getAutopilotStatus();

    // Check guardrails
    const guardrailCheck = await checkGuardrails();

    // Evaluate execution permission
    let approved = false;
    let reason = "";
    let recommendedAction = "";

    if (autopilotStatus.systemMode === "OBSERVE_ONLY") {
      approved = false;
      reason = "System is in OBSERVE_ONLY mode";
      recommendedAction = "Check system recommendations";
    } else if (autopilotStatus.systemMode === "SUGGESTION_ONLY") {
      approved = false;
      reason = "System is in SUGGESTION_ONLY mode - requires operator approval";
      recommendedAction = "manual_approval_required";
    } else if (autopilotStatus.systemMode === "HUMAN_APPROVAL_REQUIRED") {
      approved = false;
      reason = "All actions require explicit operator approval";
      recommendedAction = "manual_approval_required";
    } else if (autopilotStatus.systemMode === "LIMITED_AUTOPILOT") {
      // Can execute only if guardrails pass
      if (!guardrailCheck.passed) {
        approved = false;
        reason = `Guardrails triggered: ${guardrailCheck.triggeredRules
          .map((r) => r.ruleType)
          .join(", ")}`;
        recommendedAction = "review_guardrails";
      } else {
        approved = true;
        reason = "Guardrails passed and system in LIMITED_AUTOPILOT mode";
      }
    }

    // Log the request
    await logSystemOverride({
      trigger: approved ? "AUTOPILOT" : "HUMAN",
      previousDecision: undefined,
      newDecision: { action: body.action, approved },
      reason: reason || body.reason || "Execution request",
      impactScore: approved ? 10 : 0,
    });

    return NextResponse.json({
      success: true,
      approved,
      action: body.action,
      reason,
      recommendedAction,
      systemMode: autopilotStatus.systemMode,
      guardrailsStatus: guardrailCheck.passed ? "PASS" : "FAIL",
      guardrailsTriggered: guardrailCheck.triggeredRules.map((r) => r.ruleType),
    });
  } catch (error) {
    console.error("[B2B EXECUTION REQUEST] Error:", error);
    return NextResponse.json(
      { error: "Failed to process execution request" },
      { status: 500 }
    );
  }
}
