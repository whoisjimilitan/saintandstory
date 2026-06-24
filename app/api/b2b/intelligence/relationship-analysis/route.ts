import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { generatePhase1Intelligence } from "@/lib/engine-phase1-working";
import { analyzePsychology } from "@/lib/phase-3-psychology-engine";
import type { BusinessProfile } from "@/lib/business-relationship-engine";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

/**
 * GET /api/b2b/intelligence/relationship-analysis?prospect_id=X
 *
 * Wire reasoning engine into operator workflow.
 * Returns full 8-layer relationship intelligence for a prospect.
 *
 * Used by: /operator/understand page
 * Shows operator: Why should we contact this prospect? What's the strategy?
 */
export async function GET(request: NextRequest) {
  // Auth check
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const prospectId = searchParams.get("prospect_id");

  if (!prospectId) {
    return NextResponse.json(
      { error: "prospect_id parameter required" },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Fetch prospect from database
    const prospect = await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        contact_name,
        phone,
        city,
        postcode,
        delivery_type,
        delivery_frequency,
        average_deliveries,
        courier_provider,
        delivery_challenge,
        pain_point,
        pain_point_review,
        review_rating,
        website,
        niche,
        notes
      FROM b2b_leads
      WHERE id = ${prospectId}
      LIMIT 1
    `;

    if (!prospect || prospect.length === 0) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    const lead = prospect[0];

    // Convert database record to BusinessProfile
    const businessProfile: BusinessProfile = {
      name: lead.business_name,
      industry: lead.business_category || "Unknown",
      location: lead.city || "Unknown",
      size: "small", // Default - could be enhanced with actual size
      contactName: lead.contact_name,
      discoveryEvidence: {
        operationalIndicators: [
          lead.delivery_type || "Unknown delivery type",
          `Frequency: ${lead.delivery_frequency || "Unknown"}`,
          lead.average_deliveries ? `${lead.average_deliveries} deliveries` : "Unknown volume",
        ].filter(Boolean),
        growthSignals: [],
        currentSolutions: lead.courier_provider ? [lead.courier_provider] : [],
        painPoints: [
          lead.pain_point,
          lead.delivery_challenge,
          lead.pain_point_review,
        ].filter(Boolean) as string[],
      },
    };

    // PHASE 1: Generate core intelligence
    const intelligence = generatePhase1Intelligence(prospectId, businessProfile);

    // PHASE 3: Detect psychology patterns
    const psychology = analyzePsychology(intelligence);

    // Combine layers for operator view
    const operatorBrief = {
      prospect: {
        id: prospectId,
        name: lead.business_name,
        contact: lead.contact_name,
        email: lead.email,
        city: lead.city,
      },
      intelligence: {
        facts: intelligence.facts,
        evidence: intelligence.evidence,
        reasoning: intelligence.reasoning,
        relationshipModel: intelligence.relationshipModel,
        strategy: intelligence.strategy,
        communications: intelligence.communications,
        timeline: intelligence.timeline,
        operatorGuidance: intelligence.operatorGuidance,
      },
      psychology: {
        patterns: psychology.patterns,
        dominantPattern: psychology.dominantPattern,
        psychologicalProfile: psychology.psychologicalProfile,
        reframedStrategy: psychology.reframedStrategy,
        recommendations: psychology.psychologicalRecommendations,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        confidence: intelligence.metadata.confidenceScore,
        recommendAction: "Contact this prospect",
      },
    };

    return NextResponse.json(operatorBrief);
  } catch (error) {
    console.error("[RELATIONSHIP-ANALYSIS API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate analysis",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
