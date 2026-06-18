import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get recent valid causal validations
    const validCausal = await prisma.b2bCausalValidationRecord.findMany({
      where: { isValidCausal: true },
      orderBy: { confidenceScore: "desc" },
      take: 20,
    });

    // Get pattern details
    const patternIds = validCausal.map((c) => c.patternId);
    const patterns = await prisma.b2bMemoryPattern.findMany({
      where: { id: { in: patternIds as any } },
    });

    const patternMap = new Map(patterns.map((p) => [p.id, p]));

    const insights = validCausal.map((record) => {
      const pattern = patternMap.get(record.patternId);
      return {
        patternId: record.patternId,
        patternKey: pattern?.key,
        causalLift: Number(record.causalLift),
        confidence: Number(record.confidenceScore),
        isValidCausal: record.isValidCausal,
        reason: (record.metadata as any)?.reason || "Valid causal pattern",
        recommendation: Number(record.confidenceScore) >= 80 ? "USE" : "MONITOR",
      };
    });

    const avgConfidence =
      insights.length > 0
        ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
        : 0;

    return NextResponse.json({
      success: true,
      summary: {
        validCausalPatterns: insights.length,
        averageConfidence: Math.round(avgConfidence),
        recommendedActions: insights.filter((i) => i.recommendation === "USE").length,
      },
      insights,
    });
  } catch (error) {
    console.error("[B2B CAUSAL INSIGHTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch causal insights" },
      { status: 500 }
    );
  }
}
