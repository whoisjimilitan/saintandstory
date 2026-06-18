import { NextResponse } from "next/server";
import { checkGuardrails } from "@/lib/b2b-safety-guardrails";

export async function GET() {
  try {
    const result = await checkGuardrails();

    return NextResponse.json({
      success: true,
      guardrailsOk: result.passed,
      recommendedMode: result.recommendedMode,
      triggeredRules: result.triggeredRules.map((rule) => ({
        ruleType: rule.ruleType,
        action: rule.action,
        severity: rule.severity,
      })),
    });
  } catch (error) {
    console.error("[B2B GUARDRAILS] Error:", error);
    return NextResponse.json(
      { error: "Failed to check guardrails" },
      { status: 500 }
    );
  }
}
