import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log("[OPPORTUNITY FEED] Fetching approval queue");

  try {
    const { searchParams } = new URL(request.url);
    const approvalStatus = searchParams.get("approvalStatus") || "pending";
    const problemType = searchParams.get("problemType");

    // Build filter
    const where: Record<string, unknown> = { approvalStatus };
    if (problemType) {
      where.problemType = problemType;
    }

    // Fetch opportunities pending approval
    const opportunities = await prisma.opportunityFeed.findMany({
      where: where as Parameters<typeof prisma.opportunityFeed.findMany>[0]["where"],
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    console.log(
      `[OPPORTUNITY FEED] Queue fetched: ${opportunities.length} opportunities (status=${approvalStatus})`
    );

    // Group by problem type and tier
    const grouped: Record<string, Record<number, typeof opportunities>> = {};
    for (const opp of opportunities) {
      const problem = opp.problemType || "unknown";
      const tier = opp.routingTier || 3;

      if (!grouped[problem]) {
        grouped[problem] = {};
      }
      if (!grouped[problem][tier]) {
        grouped[problem][tier] = [];
      }
      grouped[problem][tier].push(opp);
    }

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      grouped_by_problem: Object.entries(grouped).map(([problem, byTier]) => ({
        problem_type: problem,
        count: Object.values(byTier).reduce((sum, items) => sum + items.length, 0),
        by_tier: Object.entries(byTier).map(([tier, items]) => ({
          tier: parseInt(tier),
          count: items.length,
          opportunities: items.map((opp) => ({
            id: opp.id,
            companyName: opp.companyName,
            contactName: opp.contactName,
            contactEmail: opp.contactEmail,
            originalWording: opp.originalWording.substring(0, 300),
            problemType: opp.problemType,
            routingTier: opp.routingTier,
            confidenceScore: opp.confidenceScore,
            emailSubject: opp.emailSubject,
            emailBody: opp.emailBody?.substring(0, 300),
            prePopulatedReply: opp.prePopulatedReply,
            createdAt: opp.createdAt,
          }))
        }))
      })),
      all_opportunities: opportunities.map((opp) => ({
        id: opp.id,
        companyName: opp.companyName,
        contactName: opp.contactName,
        contactEmail: opp.contactEmail,
        originalWording: opp.originalWording.substring(0, 300),
        problemType: opp.problemType,
        routingTier: opp.routingTier,
        confidenceScore: opp.confidenceScore,
        emailSubject: opp.emailSubject,
        prePopulatedReply: opp.prePopulatedReply,
        createdAt: opp.createdAt,
      }))
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Queue fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
