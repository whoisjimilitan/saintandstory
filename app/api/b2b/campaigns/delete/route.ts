import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  console.log("[CAMPAIGN DELETE] Starting campaign deletion");

  const { userId } = await auth();

  if (!userId) {
    console.log("[CAMPAIGN DELETE] ✗ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { campaignId } = await request.json() as { campaignId: string };

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID required" },
        { status: 400 }
      );
    }

    console.log(`[CAMPAIGN DELETE] Deleting campaign: ${campaignId}`);

    const deleted = await prisma.b2bCampaign.delete({
      where: { id: campaignId },
    });

    console.log(`[CAMPAIGN DELETE] ✓ Campaign deleted: ${deleted.campaignName}`);

    return NextResponse.json({
      success: true,
      deletedCampaignId: campaignId,
      message: `Deleted campaign: ${deleted.campaignName}`,
    });
  } catch (error) {
    console.error("[CAMPAIGN DELETE] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 500 }
    );
  }
}
