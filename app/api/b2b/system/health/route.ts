import { NextResponse } from "next/server";
import { updateSystemHealth } from "@/lib/b2b-safety-guardrails";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Update health metrics
    await updateSystemHealth();

    // Get current health
    const health = await prisma.b2bSystemHealth.findFirst();

    if (!health) {
      return NextResponse.json(
        { error: "System health not initialized" },
        { status: 500 }
      );
    }

    // Get recent overrides
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOverrides = await prisma.b2bSystemOverrideLog.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { impactScore: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      health: {
        systemMode: health.systemMode,
        learningStability: Number(health.learningStability),
        revenueVolatility: health.revenueVolatility,
        patternConfidenceDrift: Number(health.patternConfidenceDrift),
        guardrailTriggersSevenDay: health.guardrailTriggersSevenDay,
        lastAnomalyDetected: health.lastAnomalyDetected,
      },
      recentOverrides: recentOverrides.map((o) => ({
        id: o.id,
        trigger: o.trigger,
        reason: o.reason,
        impactScore: Number(o.impactScore),
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("[B2B SYSTEM HEALTH] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system health" },
      { status: 500 }
    );
  }
}
