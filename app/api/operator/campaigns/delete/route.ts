import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId required" },
        { status: 400 }
      );
    }

    // Delete all campaign emails first (foreign key constraint)
    await prisma.b2bCampaignEmail.deleteMany({
      where: { campaignId },
    });

    // Delete the campaign
    const deleted = await prisma.b2bCampaign.delete({
      where: { id: campaignId },
    });

    console.log(`[DELETE CAMPAIGN] Deleted campaign ${campaignId} and ${deleted.totalLeads || 0} emails`);

    return NextResponse.json({
      success: true,
      campaignId,
      emailsDeleted: deleted.totalLeads || 0,
    });
  } catch (error) {
    console.error("[DELETE CAMPAIGN] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
