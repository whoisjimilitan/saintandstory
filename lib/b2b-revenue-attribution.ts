import { prisma } from "@/lib/prisma";

interface AttributionResult {
  patternId: string;
  totalRevenue: number;
  conversionCount: number;
  roiScore: number;
  confidenceScore: number;
}

async function getPatternRevenue(patternId: string): Promise<AttributionResult | null> {
  // Get all revenue events linked to this pattern
  const revenueEvents = await prisma.b2bRevenueEvent.findMany({
    where: {
      linkedMemoryPatternId: patternId as any,
      type: { in: ["DEAL_WON", "CONVERSION"] },
    },
  });

  if (revenueEvents.length === 0) {
    return null;
  }

  const totalRevenue = revenueEvents.reduce(
    (sum, event) => sum + Number(event.value),
    0
  );

  // Get all usage counts for this pattern (from MemoryPattern evidence_count)
  const pattern = await prisma.b2bMemoryPattern.findUnique({
    where: { id: patternId as any },
  });

  if (!pattern) return null;

  const usageCount = pattern.evidenceCount || 1;
  const conversionCount = revenueEvents.length;
  const roiScore = (totalRevenue / usageCount) * 100; // ROI as percentage

  // Confidence = (conversions / total usage) * pattern_confidence
  const conversionRate = (conversionCount / usageCount) * 100;
  const confidenceScore = Math.min(
    100,
    (conversionRate / 100) * Number(pattern.confidenceScore)
  );

  return {
    patternId,
    totalRevenue,
    conversionCount,
    roiScore,
    confidenceScore,
  };
}

export async function attributeRevenueToPatterns(): Promise<{
  created: number;
  updated: number;
  totalRevenue: number;
  patterns: AttributionResult[];
  error?: string;
}> {
  try {
    // Get all memory patterns
    const patterns = await prisma.b2bMemoryPattern.findMany({
      where: { evidenceCount: { gte: 10 } }, // Only patterns with evidence
    });

    let created = 0;
    let updated = 0;
    let totalRevenue = 0;
    const results: AttributionResult[] = [];

    for (const pattern of patterns) {
      const attribution = await getPatternRevenue(pattern.id);

      if (!attribution || attribution.totalRevenue === 0) {
        continue;
      }

      totalRevenue += attribution.totalRevenue;
      results.push(attribution);

      // Check if attribution already exists
      const existing = await prisma.b2bRevenueAttribution.findFirst({
        where: {
          patternId: pattern.id,
        },
      });

      if (existing) {
        await prisma.b2bRevenueAttribution.update({
          where: { id: existing.id },
          data: {
            totalRevenue: attribution.totalRevenue,
            conversionCount: attribution.conversionCount,
            roiScore: attribution.roiScore,
            confidenceScore: attribution.confidenceScore,
          },
        });
        updated++;
      } else {
        await prisma.b2bRevenueAttribution.create({
          data: {
            patternId: pattern.id,
            totalRevenue: attribution.totalRevenue,
            conversionCount: attribution.conversionCount,
            roiScore: attribution.roiScore,
            confidenceScore: attribution.confidenceScore,
          },
        });
        created++;
      }
    }

    return {
      created,
      updated,
      totalRevenue,
      patterns: results.sort((a, b) => b.roiScore - a.roiScore),
    };
  } catch (error) {
    console.error("[REVENUE ATTRIBUTION] Error:", error);
    return {
      created: 0,
      updated: 0,
      totalRevenue: 0,
      patterns: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function recordRevenueEvent(data: {
  leadId: string;
  type: "CONVERSION" | "PAYMENT" | "DEAL_WON" | "DEAL_LOST";
  value: number;
  currency?: string;
  campaignId?: string;
  linkedMemoryPatternId?: string;
  metadata?: any;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const event = await prisma.b2bRevenueEvent.create({
      data: {
        leadId: data.leadId as any,
        type: data.type,
        value: data.value,
        currency: data.currency || "GBP",
        campaignId: data.campaignId,
        linkedMemoryPatternId: data.linkedMemoryPatternId as any,
        metadata: data.metadata,
      },
    });

    return {
      success: true,
      eventId: event.id,
    };
  } catch (error) {
    console.error("[RECORD REVENUE] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record revenue",
    };
  }
}
