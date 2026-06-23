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
    const { prospectIds } = await request.json();

    console.log("[RELATIONSHIP ENGINE] Received prospectIds:", prospectIds);

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      console.error("[RELATIONSHIP ENGINE] Invalid prospectIds");
      return NextResponse.json(
        { error: "Invalid prospectIds array" },
        { status: 400 }
      );
    }

    console.log("[RELATIONSHIP ENGINE] Looking for", prospectIds.length, "prospects in database...");

    // Fetch prospects from database
    const prospects = await prisma.b2bLead.findMany({
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

    console.log("[RELATIONSHIP ENGINE] ✅ Found", prospects.length, "out of", prospectIds.length, "requested prospects");

    if (prospects.length === 0) {
      console.error("[RELATIONSHIP ENGINE] No prospects found in database for IDs:", prospectIds);
      return NextResponse.json(
        { error: "No prospects found in database" },
        { status: 400 }
      );
    }

    // Build business profiles for reasoning engine
    const emails: EmailPreview[] = [];
    const failedProspects: string[] = [];

    for (const prospect of prospects) {
      try {
        const businessProfile: BusinessProfile = {
          name: prospect.businessName,
          industry: prospect.businessCategory || "unknown",
          location: prospect.city || "UK",
          size: "small", // Infer from available data
          contactName: prospect.contactName || undefined,
          discoveryEvidence: {
            operationalIndicators: [`Industry: ${prospect.businessCategory}`, `Location: ${prospect.city}`],
            growthSignals: ["Active prospect"],
            currentSolutions: [],
            painPoints: [],
          },
        };

        // Generate relationship communication (all 8 steps)
        const communication = generateRelationshipCommunication(businessProfile, undefined);

        emails.push({
          prospectId: prospect.id,
          prospectName: prospect.contactName || prospect.businessName,
          businessName: prospect.businessName,
          city: prospect.city || "UK",
          subject: communication.email.subject,
          body: communication.email.body,
          wordCount: communication.email.wordCount,

          // NEW: Relationship stage and reasoning
          relationshipStage: communication.stageProgression.currentStage,
          stageObjective: communication.reasoning.relationshipStage.stageObjective,
          reasoning: {
            businessAnalysis: {
              industry: communication.reasoning.businessAnalysis.industry,
              location: communication.reasoning.businessAnalysis.location,
            },
            trustStrategy: communication.reasoning.trustStrategy.trustSignal,
            inverseIncentive: communication.reasoning.inverseIncentive.statement,
            mentalSimulation: communication.reasoning.mentalSimulation.scenario,
            microCommitment: {
              ask: communication.reasoning.microCommitment.ask,
              responseOptions: communication.reasoning.microCommitment.responseOptions,
            },
          },
        });

        console.log(`[RELATIONSHIP ENGINE] ✅ Generated relationship communication for ${prospect.businessName} (Stage ${communication.stageProgression.currentStage})`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[RELATIONSHIP ENGINE] ❌ Error generating communication:", msg);
        failedProspects.push(prospect.id);
      }
    }

    // Calculate metrics
    const stageDistribution = {
      stage1: emails.filter((e) => e.relationshipStage === 1).length,
      stage2: emails.filter((e) => e.relationshipStage === 2).length,
      stage3plus: emails.filter((e) => e.relationshipStage >= 3).length,
    };

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
      failedCount: failedProspects.length,
      failedProspectIds: failedProspects.length > 0 ? failedProspects : undefined,
      metrics: {
        stageDistribution,
        averageWordCount:
          emails.length > 0
            ? Math.round(emails.reduce((sum, e) => sum + e.wordCount, 0) / emails.length)
            : 0,
        stageBreakdown: `${stageDistribution.stage1} earning reply, ${stageDistribution.stage2} backup positioning, ${stageDistribution.stage3plus} advanced relationships`,
      },
      engine: "BUSINESS_RELATIONSHIP_ENGINE (8-step reasoning pipeline)",
      note: "Each communication is generated through strategic relationship reasoning: Who are they? Why would they need us? What stage are they at? What trust strategy works? What inverse incentive? What mental simulation? What micro-commitment? Only THEN is the email generated.",
      pipeline: [
        "Step 1: Business Analysis",
        "Step 2: Delivery Needs Inference",
        "Step 3: Relationship Stage Assessment",
        "Step 4: Trust Strategy",
        "Step 5: Inverse Incentive",
        "Step 6: Mental Simulation",
        "Step 7: Micro Commitment",
        "Step 8: Email Generation",
      ],
    });
  } catch (error) {
    console.error("[RELATIONSHIP ENGINE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate relationship communications" },
      { status: 500 }
    );
  }
}
