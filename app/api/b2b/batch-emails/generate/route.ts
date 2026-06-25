/**
 * BATCH EMAIL GENERATION ENDPOINT
 *
 * Integrates 3-Layer Architecture:
 * - Layer 1: PD Operating System (immutable philosophy)
 * - Layer 2: Reasoning Engine (generate 10 formulations, score, rank top 3)
 * - Layer 3: Trust Validation Engine (QA before output)
 *
 * Takes REAL prospects from QUALIFY queue
 * Returns three ranked recommendations per prospect
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateRelationshipCommunication } from "@/lib/business-relationship-engine";
import { generateCommunicationRecommendations, formatRecommendationsForOperator } from "@/lib/layer2-reasoning-engine";

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

    const body = await request.json();
    const { prospectIds = [] } = body;

    // If no prospects specified, fetch top 5 from QUALIFY queue
    let prospects;
    if (prospectIds.length === 0) {
      prospects = await prisma.b2bLead.findMany({
        where: {
          pipeline_stage: "QUALIFY",
          leadState: "qualified",
          email: {
            not: null,
          },
        },
        select: {
          id: true,
          businessName: true,
          businessCategory: true,
          city: true,
          email: true,
          website: true,
          painPoint: true,
          reviewRating: true,
          engagement_score: true,
        },
        orderBy: {
          engagement_score: "desc",
        },
        take: 5,
      });
    } else {
      prospects = await prisma.b2bLead.findMany({
        where: {
          id: {
            in: prospectIds,
          },
        },
        select: {
          id: true,
          businessName: true,
          businessCategory: true,
          city: true,
          email: true,
          website: true,
          painPoint: true,
          reviewRating: true,
          engagement_score: true,
        },
      });
    }

    if (prospects.length === 0) {
      return NextResponse.json(
        { error: "No prospects found", success: false },
        { status: 404 }
      );
    }

    // Generate recommendations for each prospect
    const results = [];

    for (const prospect of prospects) {
      try {
        // STEP 1: Generate reasoning context using 8-step engine
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

        // STEP 2: Generate 3 ranked recommendations using Layer 2
        const recommendations = generateCommunicationRecommendations(reasoning);

        // STEP 3: Format for operator display
        const formatted = formatRecommendationsForOperator(recommendations);

        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          status: "success",
          recommendations: recommendations.map((rec) => ({
            rank: rec.rank,
            formulation: {
              name: rec.formulation.name,
              displayName: rec.formulation.displayName,
              description: rec.formulation.description,
              fitScore: rec.formulation.fitScore,
              qualityPercentile: rec.formulation.qualityPercentile,
            },
            ...(rec.rank === 1 && rec.email
              ? {
                  email: {
                    fullBody: rec.email.fullBody,
                    trustValidation: {
                      trustScore: rec.email.trustValidation.trustScore,
                      isValid: rec.email.trustValidation.isValid,
                      criticalIssues: rec.email.trustValidation.criticalIssues,
                    },
                    recommendation: rec.email.recommendation,
                  },
                }
              : { preview: rec.preview }),
          })),
          formattedOutput: formatted,
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

    return NextResponse.json({
      success: true,
      prospectCount: prospects.length,
      successCount: results.filter((r) => r.status === "success").length,
      results,
    });
  } catch (error) {
    console.error("[BATCH-EMAILS-GENERATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate batch emails", success: false },
      { status: 500 }
    );
  }
}
