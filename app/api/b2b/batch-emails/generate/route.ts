/**
 * BATCH EMAIL GENERATION ENDPOINT - FIXED
 *
 * Integrates 3-Layer Architecture:
 * - Layer 1: PD Operating System (philosophy guard rails)
 * - Layer 2: 8-Step Reasoning Engine (generates context)
 * - Layer 3: Reasoning Engine (generates 10 formulations → ranks top 3)
 * - Layer 4: Trust Validation Engine (QA gate)
 *
 * Returns: 3 ranked email recommendations per prospect for operator choice
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateRelationshipCommunication } from "@/lib/business-relationship-engine";
import { generateCommunicationRecommendations } from "@/lib/layer2-reasoning-engine";

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

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const senderName = user?.firstName || user?.fullName || "Team Member";

    const body = await request.json();
    const { prospectIds = [], prospects: incomingProspects = [] } = body;

    let prospects: any[] = [];
    if (incomingProspects.length > 0) {
      prospects = incomingProspects;
    } else if (prospectIds.length > 0) {
      prospects = await prisma.b2bLead.findMany({
        where: { id: { in: prospectIds } },
        select: {
          id: true,
          businessName: true,
          businessCategory: true,
          city: true,
          email: true,
          website: true,
          painPoint: true,
          engagement_score: true,
        },
      });
    } else {
      prospects = await prisma.b2bLead.findMany({
        where: { email: { not: null } },
        select: {
          id: true,
          businessName: true,
          businessCategory: true,
          city: true,
          email: true,
          website: true,
          painPoint: true,
          engagement_score: true,
        },
        orderBy: { engagement_score: "desc" },
        take: 5,
      });
    }

    if (prospects.length === 0) {
      return NextResponse.json(
        { error: "No prospects found", success: false },
        { status: 404 }
      );
    }

    const results = [];

    for (const prospect of prospects) {
      try {
        // STEP 1: Generate reasoning context
        const reasoning = generateRelationshipCommunication({
          name: prospect.businessName,
          industry: prospect.businessCategory || "logistics",
          location: prospect.city || "UK",
          size: "small" as const,
          contactName: undefined,
          discoveryEvidence: {
            operationalIndicators: [],
            growthSignals: [],
            currentSolutions: [],
            painPoints: prospect.painPoint ? [prospect.painPoint] : [],
          },
        });

        // STEP 2: Generate 3 ranked recommendations
        const recommendations = generateCommunicationRecommendations(reasoning);

        // STEP 3: Format for ENRICH page with all 3 variations
        const recommendations_data = recommendations.map((rec) => {
          let emailBody = "";
          if (rec.rank === 1 && rec.email) {
            emailBody = rec.email.fullBody;
          } else if (rec.preview) {
            emailBody = rec.preview;
          }

          return {
            rank: rec.rank,
            formulation: rec.formulation.displayName,
            description: rec.formulation.description,
            fitScore: rec.formulation.fitScore,
            qualityScore: rec.formulation.qualityPercentile,
            trustScore: rec.email?.trustValidation?.trustScore || 0,
            isValid: rec.email?.trustValidation?.isValid || false,
            emailBody: emailBody,
            recommendation: rec.email?.recommendation || "review",
          };
        });

        // STEP 4: Format for ENRICH - use #1 as default, but include all 3
        const topRecommendation = recommendations_data[0];
        const emailBodyForEnrich = topRecommendation.emailBody
          .replace(/{{senderName}}/g, senderName)
          .replace(/{{businessName}}/g, prospect.businessName || "");

        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          subject: `${prospect.businessName} needs us when Thursday hits`,
          body: `Hi {{businessName}},\n\n${emailBodyForEnrich}`,
          wordCount: emailBodyForEnrich.split(/\s+/).length,
          senderName: senderName,
          relationshipStage: 1,
          status: "success",
          variations: recommendations_data, // ALL 3 variations
          topRecommendation: topRecommendation,
        });
      } catch (prospectError) {
        console.error(
          `[BATCH-EMAILS] Error processing prospect ${prospect.id}:`,
          prospectError
        );
        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          status: "error",
          error:
            prospectError instanceof Error
              ? prospectError.message
              : "Unknown error",
        });
      }
    }

    const successfulResults = results.filter((r) => r.status === "success");

    return NextResponse.json({
      success: true,
      prospectCount: prospects.length,
      successCount: successfulResults.length,
      emails: successfulResults, // For ENRICH page
      results: results, // Full details
    });
  } catch (error) {
    console.error("[BATCH-EMAILS-GENERATE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to generate batch emails",
        details: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}
