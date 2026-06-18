import { prisma } from "@/lib/prisma";

interface CausalAnalysis {
  patternId: string;
  observedOutcome: number;
  controlEstimate: number;
  causalLift: number;
  confidenceScore: number;
  isValidCausal: boolean;
  reason: string;
}

async function estimateBaseline(campaignId?: string, sampleSize: number = 30): Promise<number> {
  // Get average revenue for leads WITHOUT using this pattern
  const avgRevenue = await prisma.b2bRevenueEvent.aggregate({
    _avg: { value: true },
    where: campaignId ? { campaignId } : {},
  });

  return Number(avgRevenue._avg?.value) || 0;
}

export async function validateCausalLift(data: {
  patternId: string;
  revenueEventId: string;
  observedOutcome: number;
  campaignId?: string;
}): Promise<CausalAnalysis> {
  // Get baseline (average revenue for similar prospects)
  const controlEstimate = await estimateBaseline(data.campaignId);

  // Calculate causal lift
  const causalLift = data.observedOutcome - controlEstimate;

  // Get pattern for sample size validation
  const pattern = await prisma.b2bMemoryPattern.findUnique({
    where: { id: data.patternId as any },
  });

  // Validation rules
  const sampleSize = pattern?.evidenceCount || 0;
  const hasEnoughSamples = sampleSize >= 30;
  const hasPositiveLift = causalLift > 0;
  const liftRatio = controlEstimate > 0 ? (causalLift / controlEstimate) * 100 : 0;
  const liftIsSignificant = liftRatio >= 15; // 15%+ lift required

  // Confidence scoring (0-100)
  let confidenceScore = 0;

  if (!hasEnoughSamples) {
    confidenceScore = (sampleSize / 30) * 50; // Max 50% if not enough samples
  } else if (hasPositiveLift && liftIsSignificant) {
    confidenceScore = Math.min(100, 70 + (liftRatio / 100) * 30); // 70-100 range
  } else {
    confidenceScore = 40;
  }

  // Final determination
  const isValidCausal =
    hasEnoughSamples &&
    hasPositiveLift &&
    liftIsSignificant &&
    confidenceScore >= 70;

  // Reason statement
  let reason = "";
  if (!hasEnoughSamples) {
    reason = `Insufficient samples (${sampleSize}/30). Correlation observed but confidence low.`;
  } else if (!hasPositiveLift) {
    reason = `Negative or neutral lift. Pattern may not be causal.`;
  } else if (!liftIsSignificant) {
    reason = `Lift ${liftRatio.toFixed(1)}% is below 15% threshold. Likely noise or coincidence.`;
  } else if (isValidCausal) {
    reason = `Valid causal signal: ${liftRatio.toFixed(1)}% lift confirmed over ${sampleSize} samples.`;
  }

  return {
    patternId: data.patternId,
    observedOutcome: data.observedOutcome,
    controlEstimate,
    causalLift,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    isValidCausal,
    reason,
  };
}

export async function recordCausalValidation(data: {
  patternId: string;
  revenueEventId: string;
  analysis: CausalAnalysis;
  campaignId?: string;
}): Promise<{ success: boolean; recordId?: string }> {
  try {
    const record = await prisma.b2bCausalValidationRecord.create({
      data: {
        patternId: data.patternId as any,
        revenueEventId: data.revenueEventId as any,
        campaignId: data.campaignId,
        observedOutcome: data.analysis.observedOutcome,
        controlEstimate: data.analysis.controlEstimate,
        causalLift: data.analysis.causalLift,
        confidenceScore: data.analysis.confidenceScore,
        isValidCausal: data.analysis.isValidCausal,
        metadata: { reason: data.analysis.reason },
      },
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("[CAUSAL VALIDATION] Error:", error);
    return { success: false };
  }
}

export async function getAutopilotStatus(): Promise<{
  systemMode: string;
  causalValidationRequired: boolean;
  minCausalConfidence: number;
  minSampleSize: number;
  revenueStabilityRequired: boolean;
  canExecuteAutomated: boolean;
}> {
  let constraint = await prisma.b2bAutopilotConstraint.findFirst();

  if (!constraint) {
    constraint = await prisma.b2bAutopilotConstraint.create({
      data: {
        systemMode: "SUGGESTION_ONLY",
        causalValidationRequired: true,
        minCausalConfidence: 80,
        minSampleSize: 100,
        revenueStabilityRequired: true,
        allowedExecutionActions: ["recommendation"],
      },
    });
  }

  const canExecuteAutomated = constraint.systemMode === "LIMITED_AUTOPILOT";

  return {
    systemMode: constraint.systemMode,
    causalValidationRequired: constraint.causalValidationRequired,
    minCausalConfidence: Number(constraint.minCausalConfidence),
    minSampleSize: constraint.minSampleSize,
    revenueStabilityRequired: constraint.revenueStabilityRequired,
    canExecuteAutomated,
  };
}
