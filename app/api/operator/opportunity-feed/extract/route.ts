import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractOpportunityData } from "@/lib/opportunity-extraction";

export async function POST(request: NextRequest) {
  console.log("[OPPORTUNITY FEED] Extraction started");

  try {
    const body = await request.json();
    const { opportunityIds } = body;

    if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return NextResponse.json(
        { error: "opportunityIds array is required" },
        { status: 400 }
      );
    }

    console.log("[OPPORTUNITY FEED] Extracting from", opportunityIds.length, "opportunities");

    // Fetch opportunities from database
    const opportunities = await prisma.opportunityFeed.findMany({
      where: {
        id: { in: opportunityIds },
        status: "imported",
      },
    });

    if (opportunities.length === 0) {
      return NextResponse.json(
        { error: "No imported opportunities found with given IDs" },
        { status: 404 }
      );
    }

    const results = [];
    const failed = [];

    for (const opp of opportunities) {
      try {
        console.log("[OPPORTUNITY FEED] Extracting:", opp.companyName);

        const extraction = await extractOpportunityData(opp.companyName, opp.originalWording);

        // Update database
        await prisma.opportunityFeed.update({
          where: { id: opp.id },
          data: {
            extractedNeed: extraction.need,
            extractedUrgency: extraction.urgency,
            extractedContext: extraction.context,
            extractedQuote: extraction.quote,
            status: "extracted",
          },
        });

        results.push({
          id: opp.id,
          company: opp.companyName,
          extraction,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log("[OPPORTUNITY FEED] Extraction failed for", opp.companyName, ":", errorMsg);
        failed.push({
          company: opp.companyName,
          error: errorMsg,
        });
      }
    }

    console.log("[OPPORTUNITY FEED] Extraction complete. Success:", results.length, "Failed:", failed.length);

    return NextResponse.json({
      success: true,
      extracted: results.length,
      failed: failed.length,
      results,
      errors: failed,
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Extraction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
