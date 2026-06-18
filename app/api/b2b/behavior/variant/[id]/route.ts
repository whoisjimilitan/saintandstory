import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: variantId } = await params;

    const metric = await prisma.b2bBehaviorMetrics.findFirst({
      where: { variantId },
    });

    if (!metric) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      variantId,
      metric: {
        campaignId: metric.campaignId,
        pressureType: metric.pressureType,
        sentCount: metric.sentCount,
        openCount: metric.openCount,
        clickCount: metric.clickCount,
        replyCount: metric.replyCount,
        replyYesCount: metric.replyYesCount,
        replyNoCount: metric.replyNoCount,
        openRate: metric.openRate,
        clickRate: metric.clickRate,
        replyRate: metric.replyRate,
        yesRate: metric.yesRate,
        dateRangeStart: metric.dateRangeStart,
        dateRangeEnd: metric.dateRangeEnd,
      },
    });
  } catch (error) {
    console.error("[B2B BEHAVIOR VARIANT] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant metrics" },
      { status: 500 }
    );
  }
}
