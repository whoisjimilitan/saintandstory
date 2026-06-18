import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attributions = await prisma.b2bRevenueAttribution.findMany({
      orderBy: { roiScore: "desc" },
      take: 100,
    });

    // Get patterns for context
    const patternIds = attributions.map((a) => a.patternId);
    const patterns = await prisma.b2bMemoryPattern.findMany({
      where: { id: { in: patternIds as any } },
    });

    const patternMap = new Map(patterns.map((p) => [p.id, p]));

    // Aggregate by pattern type
    const byType = new Map<string, { revenue: number; count: number; roi: number }>();

    for (const attr of attributions) {
      const pattern = patternMap.get(attr.patternId);
      if (!pattern) continue;

      if (!byType.has(pattern.type)) {
        byType.set(pattern.type, { revenue: 0, count: 0, roi: 0 });
      }
      const stats = byType.get(pattern.type)!;
      stats.revenue += Number(attr.totalRevenue);
      stats.count += attr.conversionCount;
      stats.roi = Math.max(stats.roi, Number(attr.roiScore));
    }

    const totalRevenue = attributions.reduce(
      (sum, a) => sum + Number(a.totalRevenue),
      0
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        attributionsCount: attributions.length,
        averageRoi:
          attributions.length > 0
            ? Math.round(
                (attributions.reduce((sum, a) => sum + Number(a.roiScore), 0) /
                  attributions.length) *
                  100
              ) / 100
            : 0,
      },
      byType: Object.fromEntries(byType),
      topPatterns: attributions.slice(0, 10).map((a) => ({
        patternId: a.patternId,
        patternKey: patternMap.get(a.patternId)?.key,
        totalRevenue: Number(a.totalRevenue),
        conversionCount: a.conversionCount,
        roiScore: Number(a.roiScore),
        confidence: Number(a.confidenceScore),
      })),
    });
  } catch (error) {
    console.error("[B2B REVENUE INSIGHTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue insights" },
      { status: 500 }
    );
  }
}
