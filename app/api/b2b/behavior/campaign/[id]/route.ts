import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    const variants = await prisma.b2bBehaviorMetrics.findMany({
      where: { campaignId },
      orderBy: { yesRate: "desc" },
    });

    if (variants.length === 0) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Calculate campaign aggregate
    const avgYesRateValue =
      variants.length > 0
        ? variants.reduce((sum, v) => sum + Number(v.yesRate), 0) /
          variants.length
        : 0;

    const aggregate = {
      totalSent: variants.reduce((sum, v) => sum + v.sentCount, 0),
      totalYes: variants.reduce((sum, v) => sum + v.replyYesCount, 0),
      avgYesRate: Math.round(avgYesRateValue * 100) / 100,
    };

    return NextResponse.json({
      success: true,
      campaignId,
      aggregate,
      variants: variants.map((v) => ({
        variantId: v.variantId,
        pressureType: v.pressureType,
        sentCount: v.sentCount,
        openCount: v.openCount,
        clickCount: v.clickCount,
        replyYesCount: v.replyYesCount,
        replyNoCount: v.replyNoCount,
        openRate: v.openRate,
        clickRate: v.clickRate,
        replyRate: v.replyRate,
        yesRate: v.yesRate,
      })),
    });
  } catch (error) {
    console.error("[B2B BEHAVIOR CAMPAIGN] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign metrics" },
      { status: 500 }
    );
  }
}
