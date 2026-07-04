import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCourierReadinessBrief } from "@/lib/opportunity-brief-generator";
import { generateOpportunityEmail } from "@/lib/opportunity-email-generator";

export async function POST(request: NextRequest) {
  console.log("[OPPORTUNITY FEED] Generation started");

  try {
    const body = await request.json();
    const { opportunityIds } = body;

    if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return NextResponse.json(
        { error: "opportunityIds array is required" },
        { status: 400 }
      );
    }

    console.log("[OPPORTUNITY FEED] Generating briefs and emails for", opportunityIds.length, "opportunities");

    // Fetch extracted opportunities
    const opportunities = await prisma.opportunityFeed.findMany({
      where: {
        id: { in: opportunityIds },
        status: "extracted",
      },
    });

    if (opportunities.length === 0) {
      return NextResponse.json(
        { error: "No extracted opportunities found with given IDs" },
        { status: 404 }
      );
    }

    const results = [];
    const failed = [];

    for (const opp of opportunities) {
      try {
        if (!opp.extractedNeed || !opp.extractedContext || !opp.extractedQuote) {
          throw new Error("Missing extracted data");
        }

        console.log("[OPPORTUNITY FEED] Generating for:", opp.companyName);

        // Generate brief
        const briefHtml = await generateCourierReadinessBrief({
          companyName: opp.companyName,
          extractedNeed: opp.extractedNeed,
          extractedContext: opp.extractedContext,
          extractedQuote: opp.extractedQuote,
          extractedUrgency: opp.extractedUrgency || "Medium",
        });

        // Generate email (brief will be hosted at a URL in production)
        const briefUrl = `/api/operator/opportunity-feed/brief/${opp.id}`;
        const email = generateOpportunityEmail({
          contactName: opp.contactName || "there",
          extractedNeed: opp.extractedNeed,
          briefUrl,
        });

        // Update database
        await prisma.opportunityFeed.update({
          where: { id: opp.id },
          data: {
            briefHtml,
            emailSubject: email.subject,
            emailBody: email.body,
            status: "queued",
          },
        });

        results.push({
          id: opp.id,
          company: opp.companyName,
          email: {
            subject: email.subject,
            body: email.body,
          },
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log("[OPPORTUNITY FEED] Generation failed for", opp.companyName, ":", errorMsg);
        failed.push({
          company: opp.companyName,
          error: errorMsg,
        });
      }
    }

    console.log("[OPPORTUNITY FEED] Generation complete. Success:", results.length, "Failed:", failed.length);

    return NextResponse.json({
      success: true,
      generated: results.length,
      failed: failed.length,
      results,
      errors: failed,
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
