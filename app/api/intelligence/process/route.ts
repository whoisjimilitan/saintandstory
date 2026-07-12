import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  intelligentlyProcessOpportunity,
  generateBriefHTML,
} from "@/lib/opportunity-intelligence";

export async function POST(request: NextRequest) {
  console.log("[INTELLIGENCE API] Processing opportunity");

  try {
    const body = await request.json();
    const { searchResultId } = body;

    if (!searchResultId) {
      return NextResponse.json(
        { error: "searchResultId is required" },
        { status: 400 }
      );
    }

    // Get the search result
    const searchResult = await prisma.searchResult.findUnique({
      where: { id: searchResultId },
    });

    if (!searchResult) {
      return NextResponse.json(
        { error: "SearchResult not found" },
        { status: 404 }
      );
    }

    console.log("[INTELLIGENCE API] Processing:", searchResult.businessName);

    // Run intelligence processing
    const intelligence = await intelligentlyProcessOpportunity({
      businessName: searchResult.businessName,
      originalStatement: searchResult.originalStatement,
      opportunityType: searchResult.opportunityType as any,
      sourcePlatform: searchResult.sourcePlatform,
      website: searchResult.website || undefined,
      industry: searchResult.industry || undefined,
    });

    // Generate custom brief
    const briefHTML = await generateBriefHTML(
      intelligence.recommendedBrief,
      searchResult.businessName,
      intelligence.deducedNeed
    );

    // Store brief
    const brief = await prisma.generatedBrief.create({
      data: {
        processedOpportunityId: "temp", // Will be updated after ProcessedOpportunity is created
        briefType: intelligence.recommendedBrief,
        businessName: searchResult.businessName,
        specificNeed: intelligence.deducedNeed,
        htmlContent: briefHTML,
        publicUrl: `/api/intelligence/brief/${searchResultId}`, // URL pattern
      },
    });

    // Create processed opportunity
    const processed = await prisma.processedOpportunity.create({
      data: {
        searchResultId,
        businessName: searchResult.businessName,
        website: searchResult.website,
        originalStatement: searchResult.originalStatement,
        opportunityType: searchResult.opportunityType,
        confidence: intelligence.confidence,
        deducedNeed: intelligence.deducedNeed,
        recommendedBrief: intelligence.recommendedBrief,
        whyTheyNeedIt: intelligence.whyTheyNeedIt,
        emailSubject: intelligence.emailSubject,
        emailBody: intelligence.emailBody,
        briefUrl: brief.publicUrl,
        briefTitle: intelligence.briefTitle,
        status: "processed",
      },
    });

    // Update brief with correct processedOpportunityId
    await prisma.generatedBrief.update({
      where: { id: brief.id },
      data: { processedOpportunityId: processed.id },
    });

    // Create approval queue entry
    const queueEntry = await prisma.approvalQueue.create({
      data: {
        processedOpportunityId: processed.id,
        businessName: searchResult.businessName,
        originalStatement: searchResult.originalStatement,
        deducedNeed: intelligence.deducedNeed,
        emailPreview: intelligence.emailBody,
        briefUrl: brief.publicUrl,
        confidence: intelligence.confidence,
        status: "pending",
      },
    });

    // Update search result status
    await prisma.searchResult.update({
      where: { id: searchResultId },
      data: { status: "processed", processedAt: new Date() },
    });

    console.log("[INTELLIGENCE API] ✓ Opportunity processed and queued:", {
      business: searchResult.businessName,
      queueId: queueEntry.id,
      confidence: intelligence.confidence,
    });

    return NextResponse.json({
      success: true,
      processedOpportunity: processed,
      approvalQueueEntry: queueEntry,
    });
  } catch (error) {
    console.error("[INTELLIGENCE API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
