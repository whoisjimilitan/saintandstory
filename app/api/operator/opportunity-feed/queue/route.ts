import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[OPPORTUNITY FEED] Fetching approval queue");

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "queued";

    // Fetch opportunities ready for approval
    const opportunities = await prisma.opportunityFeed.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    console.log("[OPPORTUNITY FEED] Queue fetched, count:", opportunities.length);

    return NextResponse.json({
      success: true,
      count: opportunities.length,
      opportunities: opportunities.map((opp) => ({
        id: opp.id,
        companyName: opp.companyName,
        website: opp.website,
        contactName: opp.contactName,
        contactEmail: opp.contactEmail,
        originalWording: opp.originalWording,
        extractedNeed: opp.extractedNeed,
        extractedUrgency: opp.extractedUrgency,
        extractedContext: opp.extractedContext,
        extractedQuote: opp.extractedQuote,
        emailSubject: opp.emailSubject,
        emailBody: opp.emailBody,
        status: opp.status,
        createdAt: opp.createdAt,
      })),
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Queue fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
