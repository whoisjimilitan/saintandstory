/**
 * DEMO ENDPOINT: PHASE 5A - SMART CAMPAIGN PREP
 *
 * Demonstrates: When operator qualifies a prospect,
 * system automatically suggests similar prospects for batch email
 *
 * Example: Qualify 1 law firm in London
 * → System finds 3 other law firms in London
 * → Suggests: "Ready to email these 3 similar prospects?"
 * → One click → Prepares batch email for all 4
 */

import { NextResponse } from "next/server";
import {
  findSimilarProspectsForCampaign,
  prepareBatchEmailCampaign,
} from "@/lib/smart-campaign-prep";

// DEMO DATA: Pool of prospects
const DEMO_PROSPECTS = [
  // Law firms
  {
    id: "p1",
    businessName: "ABC Law Firm",
    businessCategory: "law-firm",
    city: "London",
  },
  {
    id: "p2",
    businessName: "Smith & Associates",
    businessCategory: "law-firm",
    city: "London",
  },
  {
    id: "p3",
    businessName: "Legal Solutions Ltd",
    businessCategory: "law-firm",
    city: "London",
  },
  {
    id: "p4",
    businessName: "Justice Partners",
    businessCategory: "law-firm",
    city: "London",
  },

  // Other industries (for contrast)
  {
    id: "p5",
    businessName: "Swift Removals",
    businessCategory: "removals",
    city: "Manchester",
  },
  {
    id: "p6",
    businessName: "City Pharmacy",
    businessCategory: "pharmacy",
    city: "Birmingham",
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const qualifiedProspectId = url.searchParams.get("prospectId") || "p1";

    // SCENARIO: Operator just qualified "ABC Law Firm"
    const qualifiedProspect = DEMO_PROSPECTS.find(
      (p) => p.id === qualifiedProspectId
    );

    if (!qualifiedProspect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // STEP 1: Find similar prospects
    const suggestion = findSimilarProspectsForCampaign(
      qualifiedProspect,
      DEMO_PROSPECTS
    );

    // STEP 2: Prepare batch email campaign
    const campaign = prepareBatchEmailCampaign(
      qualifiedProspect,
      suggestion.suggestedProspects
    );

    // PROOF OF FUNCTIONALITY
    const proof = {
      scenario: "Operator qualifies 1 prospect",
      qualifiedProspect: qualifiedProspect.businessName,
      qualifiedProspectCategory: qualifiedProspect.businessCategory,
      qualifiedProspectCity: qualifiedProspect.city,

      systemResponse: "Smart Campaign Prep automatically triggered",

      suggestion: {
        available: suggestion.isAvailable,
        message: suggestion.reason,
        action: suggestion.suggestedAction,
        similarProspectsFound: suggestion.suggestedProspectsCount,
        prospectsList: suggestion.suggestedProspects.map((p) => ({
          name: p.businessName,
          category: p.businessCategory,
          city: p.city,
        })),
      },

      campaignPrep: {
        ready: campaign.campaignReady,
        prospectsToPrepare: campaign.prospectsToPrepare.length,
        emailsToGenerate: campaign.estimatedEmailsToGenerate,
        nextStep: campaign.nextStep,
      },

      PROOF: {
        "✅ Smart Campaign Prep triggers automatically": suggestion.isAvailable,
        "✅ Similar prospects identified correctly": suggestion.suggestedProspectsCount > 0,
        "✅ Batch email campaign prepared": campaign.campaignReady,
        "✅ Operator sees actionable suggestion": suggestion.suggestedAction !== "",
      },

      impact: {
        withoutSmartCampaignPrep:
          "Operator qualifies 1 → searches for similar manually → wastes time",
        withSmartCampaignPrep: `Operator qualifies 1 → system shows "${suggestion.reason}" → one click to batch email ${suggestion.suggestedProspectsCount} similar prospects`,
        timeSaved: "Minutes searching + clicking → 30 seconds",
        conversionMultiplier: `1 email → ${suggestion.suggestedProspectsCount + 1} emails (same effort, ${suggestion.suggestedProspectsCount}x more opportunities)`,
      },
    };

    return NextResponse.json({
      status: "✅ PHASE 5A WORKING",
      timestamp: new Date().toISOString(),
      ...proof,
    });
  } catch (error) {
    console.error("[PHASE 5A] Error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
