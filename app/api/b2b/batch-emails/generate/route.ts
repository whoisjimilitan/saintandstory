import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateRelationshipCommunication,
  type BusinessProfile,
  type RelationshipStage,
} from "@/lib/business-relationship-engine";

interface EmailPreview {
  prospectId: string;
  prospectName: string;
  businessName: string;
  city: string;
  subject: string;
  body: string;
  wordCount: number;

  // NEW: Relationship reasoning
  relationshipStage: RelationshipStage;
  stageObjective: string;
  reasoning: {
    businessAnalysis: {
      industry: string;
      location: string;
    };
    trustStrategy: string;
    inverseIncentive: string;
    mentalSimulation: string;
    microCommitment: {
      ask: string;
      responseOptions: string[];
    };
  };
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { prospects: prospectData, prospectIds } = body;

    // Accept either full prospect data OR just IDs (for backwards compatibility)
    let prospects: any[] = [];

    // If prospect data is provided directly, use it
    if (prospectData && Array.isArray(prospectData)) {
      console.log("[RELATIONSHIP ENGINE] Received prospect data directly:", prospectData.length, "prospects");
      prospects = prospectData;
    }
    // Otherwise try to fetch by IDs from database (legacy path)
    else if (prospectIds && Array.isArray(prospectIds)) {
      console.log("[RELATIONSHIP ENGINE] Received prospectIds, fetching from database:", prospectIds);

      if (prospectIds.length === 0) {
        console.error("[RELATIONSHIP ENGINE] prospectIds array is empty");
        return NextResponse.json(
          { error: "prospectIds array cannot be empty", success: false, emails: [] },
          { status: 400 }
        );
      }

      try {
        prospects = await prisma.b2bLead.findMany({
          where: {
            id: { in: prospectIds },
          },
          select: {
            id: true,
            businessName: true,
            city: true,
            businessCategory: true,
            email: true,
            contactName: true,
          },
        });
      } catch (dbErr) {
        console.error("[RELATIONSHIP ENGINE] Database error fetching prospects:", dbErr);
        return NextResponse.json(
          { error: "Database error fetching prospects", success: false, emails: [] },
          { status: 500 }
        );
      }

      console.log("[RELATIONSHIP ENGINE] ✅ Found", prospects.length, "out of", prospectIds.length, "prospects");
    }
    // Neither provided
    else {
      console.error("[RELATIONSHIP ENGINE] Neither prospects nor prospectIds provided");
      return NextResponse.json(
        { error: "Either 'prospects' or 'prospectIds' parameter is required", success: false, emails: [] },
        { status: 400 }
      );
    }

    if (prospects.length === 0) {
      console.error("[RELATIONSHIP ENGINE] No prospects available");
      return NextResponse.json(
        { error: "No prospects found", success: false, emails: [], failedIds: prospectIds || [] },
        { status: 400 }
      );
    }

    // Build business profiles for reasoning engine
    const emails: EmailPreview[] = [];
    const failedProspects: { id: string; reason: string }[] = [];

    for (const prospect of prospects) {
      try {
        // Validate prospect data before processing
        if (!prospect || !prospect.id) {
          failedProspects.push({ id: prospect?.id || "unknown", reason: "Invalid prospect object" });
          continue;
        }

        if (!prospect.businessName || typeof prospect.businessName !== "string") {
          failedProspects.push({ id: prospect.id, reason: "Missing or invalid businessName" });
          continue;
        }

        const businessProfile: BusinessProfile = {
          name: prospect.businessName,
          industry: (prospect.businessCategory && typeof prospect.businessCategory === "string")
            ? prospect.businessCategory
            : "unknown",
          location: (prospect.city && typeof prospect.city === "string")
            ? prospect.city
            : "UK",
          size: "small",
          contactName: prospect.contactName || undefined,
          discoveryEvidence: {
            operationalIndicators: [
              prospect.businessCategory ? `Industry: ${prospect.businessCategory}` : "Industry: unknown",
              prospect.city ? `Location: ${prospect.city}` : "Location: UK"
            ].filter(Boolean),
            growthSignals: ["Active prospect"],
            currentSolutions: [],
            painPoints: [],
          },
        };

        // Generate relationship communication (all 8 steps)
        let communication;
        try {
          communication = generateRelationshipCommunication(businessProfile, undefined);
        } catch (commErr) {
          const msg = commErr instanceof Error ? commErr.message : String(commErr);
          console.error(`[RELATIONSHIP ENGINE] Communication generation failed for ${prospect.businessName}:`, msg);
          failedProspects.push({ id: prospect.id, reason: `Communication failed: ${msg.substring(0, 50)}` });
          continue;
        }

        // Safely extract communication data
        if (!communication || !communication.email) {
          failedProspects.push({ id: prospect.id, reason: "Communication generated but no email output" });
          continue;
        }

        emails.push({
          prospectId: prospect.id,
          prospectName: prospect.contactName || prospect.businessName,
          businessName: prospect.businessName,
          city: prospect.city || "UK",
          subject: communication.email.subject || "No subject",
          body: communication.email.body || "No body",
          wordCount: communication.email.wordCount || 0,

          relationshipStage: communication.stageProgression?.currentStage || 1,
          stageObjective: communication.reasoning?.relationshipStage?.stageObjective || "Unknown",
          reasoning: {
            businessAnalysis: {
              industry: communication.reasoning?.businessAnalysis?.industry || "unknown",
              location: communication.reasoning?.businessAnalysis?.location || "unknown",
            },
            trustStrategy: communication.reasoning?.trustStrategy?.trustSignal || "Unknown",
            inverseIncentive: communication.reasoning?.inverseIncentive?.statement || "Unknown",
            mentalSimulation: communication.reasoning?.mentalSimulation?.scenario || "Unknown",
            microCommitment: {
              ask: communication.reasoning?.microCommitment?.ask || "Unknown",
              responseOptions: communication.reasoning?.microCommitment?.responseOptions || [],
            },
          },
        });

        console.log(`[RELATIONSHIP ENGINE] ✅ Generated communication for ${prospect.businessName}`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`[RELATIONSHIP ENGINE] ❌ Unexpected error for prospect ${prospect?.id}:`, msg);
        failedProspects.push({ id: prospect?.id || "unknown", reason: msg.substring(0, 50) });
      }
    }

    // Calculate metrics
    const stageDistribution = {
      stage1: emails.filter((e) => e.relationshipStage === 1).length,
      stage2: emails.filter((e) => e.relationshipStage === 2).length,
      stage3plus: emails.filter((e) => e.relationshipStage >= 3).length,
    };

    // Return both successful emails and detailed failure info
    return NextResponse.json({
      success: emails.length > 0,
      emails,
      count: emails.length,
      failedCount: failedProspects.length,
      failed: failedProspects.length > 0 ? failedProspects : undefined,
      metrics: {
        successRate: prospects.length > 0 ? Math.round((emails.length / prospects.length) * 100) : 0,
        stageDistribution,
        averageWordCount:
          emails.length > 0
            ? Math.round(emails.reduce((sum, e) => sum + e.wordCount, 0) / emails.length)
            : 0,
        stageBreakdown: `${stageDistribution.stage1} earning reply, ${stageDistribution.stage2} backup positioning, ${stageDistribution.stage3plus} advanced relationships`,
      },
      note: emails.length > 0 ? "Generated successfully" : "No emails generated - see failed array for details",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[RELATIONSHIP ENGINE] Uncaught error:", {
      message: msg,
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate communications",
        details: msg,
        emails: [],
        count: 0
      },
      { status: 500 }
    );
  }
}
