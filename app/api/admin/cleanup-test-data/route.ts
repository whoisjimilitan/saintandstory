import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * ADMIN ONLY: Delete all test leads and campaigns
 * Used to reset database to clean state before going live
 *
 * Hard deletes:
 * - All B2bCampaign records (cascades to emails/whatsapp)
 * - All B2bLead records
 */

export async function POST(request: NextRequest) {
  console.log("[CLEANUP] Starting database cleanup");

  try {
    // Verify admin token in header (basic protection)
    const adminToken = request.headers.get("x-admin-token");
    if (adminToken !== process.env.ADMIN_TOKEN) {
      console.log("[CLEANUP] ✗ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts before deletion
    const campaignCount = await prisma.b2bCampaign.count();
    const leadCount = await prisma.b2bLead.count();

    console.log(`[CLEANUP] Found ${campaignCount} campaigns, ${leadCount} leads`);

    // Delete all campaigns (cascades to emails via Prisma)
    const deletedCampaigns = await prisma.b2bCampaign.deleteMany({});
    console.log(`[CLEANUP] ✓ Deleted ${deletedCampaigns.count} campaigns`);

    // Delete all leads
    const deletedLeads = await prisma.b2bLead.deleteMany({});
    console.log(`[CLEANUP] ✓ Deleted ${deletedLeads.count} leads`);

    console.log("[CLEANUP] ✓ Database reset complete");

    return NextResponse.json({
      success: true,
      message: "Database cleaned",
      deletedCampaigns: deletedCampaigns.count,
      deletedLeads: deletedLeads.count,
    });
  } catch (error) {
    console.error("[CLEANUP] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
