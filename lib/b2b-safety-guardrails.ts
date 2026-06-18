import { prisma } from "@/lib/prisma";

export type GuardrailAction = "BLOCK_AUTOMATION" | "REVERT_TO_MEMORY" | "FALLBACK_VARIANT" | "REDUCE_CONFIDENCE";

interface GuardrailCheckResult {
  passed: boolean;
  triggeredRules: Array<{
    ruleType: string;
    action: GuardrailAction;
    severity: string;
  }>;
  recommendedMode: "MANUAL" | "ASSISTED" | "AUTOPILOT";
}

export async function checkGuardrails(): Promise<GuardrailCheckResult> {
  const triggeredRules: GuardrailCheckResult["triggeredRules"] = [];

  // Get active guardrails
  const guardrails = await prisma.b2bSafetyGuardrail.findMany({
    where: { isActive: true },
  });

  // Check revenue drop protection
  const recentRevenue = await prisma.b2bRevenueAttribution.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (recentRevenue.length >= 10) {
    const recent = recentRevenue.slice(0, 10);
    const older = recentRevenue.slice(10, 20);

    const recentAvg =
      recent.reduce((sum, r) => sum + Number(r.totalRevenue), 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, r) => sum + Number(r.totalRevenue), 0) / older.length
        : recentAvg;

    const dropPercentage = ((olderAvg - recentAvg) / olderAvg) * 100;

    const revenueDropRule = guardrails.find((r) => r.ruleType === "REVENUE_DROP_PROTECTION");
    if (
      revenueDropRule &&
      dropPercentage > Number(revenueDropRule.threshold)
    ) {
      triggeredRules.push({
        ruleType: "REVENUE_DROP_PROTECTION",
        action: revenueDropRule.action as GuardrailAction,
        severity: revenueDropRule.severity,
      });
    }
  }

  // Check pattern overfitting (no single pattern should dominate)
  const topPatterns = await prisma.b2bRevenueAttribution.findMany({
    orderBy: { totalRevenue: "desc" },
    take: 5,
  });

  if (topPatterns.length > 0) {
    const totalRevenue = topPatterns.reduce((sum, p) => sum + Number(p.totalRevenue), 0);
    const topWeight = (Number(topPatterns[0].totalRevenue) / totalRevenue) * 100;

    const overfitRule = guardrails.find((r) => r.ruleType === "PATTERN_OVERFITTING_PROTECTION");
    if (overfitRule && topWeight > Number(overfitRule.threshold)) {
      triggeredRules.push({
        ruleType: "PATTERN_OVERFITTING_PROTECTION",
        action: overfitRule.action as GuardrailAction,
        severity: overfitRule.severity,
      });
    }
  }

  // Check random spike filter
  const recentSpikes = recentRevenue.slice(0, 5);
  if (recentSpikes.length > 0) {
    const avgRecent = recentSpikes.reduce((sum, r) => sum + Number(r.totalRevenue), 0) / recentSpikes.length;
    const hasSpike = recentSpikes.some((r) => Number(r.totalRevenue) > avgRecent * 3);

    if (hasSpike) {
      const spikeRule = guardrails.find((r) => r.ruleType === "RANDOM_SPIKE_FILTER");
      if (spikeRule) {
        triggeredRules.push({
          ruleType: "RANDOM_SPIKE_FILTER",
          action: spikeRule.action as GuardrailAction,
          severity: spikeRule.severity,
        });
      }
    }
  }

  // Determine recommended mode based on guardrail triggers
  let recommendedMode: "MANUAL" | "ASSISTED" | "AUTOPILOT" = "AUTOPILOT";

  const highSeverityTriggered = triggeredRules.some((r) => r.severity === "HIGH");
  const mediumSeverityTriggered = triggeredRules.some((r) => r.severity === "MEDIUM");

  if (highSeverityTriggered) {
    recommendedMode = "MANUAL";
  } else if (mediumSeverityTriggered) {
    recommendedMode = "ASSISTED";
  }

  return {
    passed: triggeredRules.length === 0,
    triggeredRules,
    recommendedMode,
  };
}

export async function logSystemOverride(data: {
  trigger: "AUTOPILOT" | "HUMAN" | "GUARDRAIL";
  previousDecision?: any;
  newDecision?: any;
  reason: string;
  impactScore?: number;
  metadata?: any;
}): Promise<{ success: boolean; logId?: string }> {
  try {
    const log = await prisma.b2bSystemOverrideLog.create({
      data: {
        trigger: data.trigger,
        previousDecision: data.previousDecision,
        newDecision: data.newDecision,
        reason: data.reason,
        impactScore: data.impactScore || 0,
        metadata: data.metadata,
      },
    });

    return { success: true, logId: log.id };
  } catch (error) {
    console.error("[SYSTEM OVERRIDE LOG] Error:", error);
    return { success: false };
  }
}

export async function updateSystemHealth(): Promise<{ success: boolean }> {
  try {
    // Get or create system health record
    let health = await prisma.b2bSystemHealth.findFirst();

    if (!health) {
      health = await prisma.b2bSystemHealth.create({
        data: {
          learningStability: 100,
          revenueVolatility: "LOW",
          patternConfidenceDrift: 0,
          guardrailTriggersSevenDay: 0,
          systemMode: "MANUAL",
        },
      });
    }

    // Calculate metrics
    const guardrailResult = await checkGuardrails();

    // Count guardrail triggers in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOverrides = await prisma.b2bSystemOverrideLog.findMany({
      where: {
        trigger: "GUARDRAIL",
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Calculate learning stability (inverse of drift)
    const patterns = await prisma.b2bMemoryPattern.findMany({
      take: 100,
    });
    const avgConfidenceDrift =
      patterns.length > 0
        ? patterns.reduce((sum, p) => sum + Math.abs(Number(p.confidenceScore) - 50), 0) / patterns.length
        : 0;

    // Update health
    await prisma.b2bSystemHealth.update({
      where: { id: health.id },
      data: {
        learningStability: Math.max(0, 100 - avgConfidenceDrift),
        revenueVolatility: guardrailResult.triggeredRules.some((r) => r.ruleType === "RANDOM_SPIKE_FILTER")
          ? "HIGH"
          : "LOW",
        patternConfidenceDrift: avgConfidenceDrift,
        guardrailTriggersSevenDay: recentOverrides.length,
        systemMode: guardrailResult.recommendedMode,
        lastAnomalyDetected: guardrailResult.triggeredRules.length > 0 ? new Date() : undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[SYSTEM HEALTH UPDATE] Error:", error);
    return { success: false };
  }
}
