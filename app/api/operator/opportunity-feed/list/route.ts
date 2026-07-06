import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * List opportunities by IDs
 *
 * Used by Enrich page to load pre-generated briefs and metadata
 * from OpportunityFeed records created via unified discovery flow.
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "ids parameter required" },
        { status: 400 }
      );
    }

    const ids = idsParam.split(",").filter(id => id.trim());

    console.log(`[OPPORTUNITY-FEED-LIST] Loading ${ids.length} opportunities`);

    const opportunities = await prisma.opportunityFeed.findMany({
      where: {
        id: { in: ids }
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        location: true,
        postcode: true,
        problemType: true,
        extractedNeed: true,
        extractedUrgency: true,
        emailSubject: true,
        emailBody: true,
        briefHtml: true,
        psychologyAnalysis: true,
        confidenceScore: true,
        routingTier: true,
        approvalStatus: true,
        createdAt: true
      }
    });

    console.log(`[OPPORTUNITY-FEED-LIST] Found ${opportunities.length} opportunities`);

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (error) {
    console.error("[OPPORTUNITY-FEED-LIST] Error:", error);
    return NextResponse.json(
      { error: "Failed to load opportunities", details: String(error) },
      { status: 500 }
    );
  }
}
