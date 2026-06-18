import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const metrics = await prisma.b2bBehaviorMetrics.findMany({
      orderBy: { yesRate: "desc" },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      count: metrics.length,
      metrics: metrics.map((m) => ({
        id: m.id,
        variantId: m.variantId,
        campaignId: m.campaignId,
        pressureType: m.pressureType,
        sentCount: m.sentCount,
        openCount: m.openCount,
        clickCount: m.clickCount,
        replyCount: m.replyCount,
        replyYesCount: m.replyYesCount,
        replyNoCount: m.replyNoCount,
        openRate: m.openRate,
        clickRate: m.clickRate,
        replyRate: m.replyRate,
        yesRate: m.yesRate,
      })),
    });
  } catch (error) {
    console.error("[B2B BEHAVIOR METRICS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch behavior metrics" },
      { status: 500 }
    );
  }
}
