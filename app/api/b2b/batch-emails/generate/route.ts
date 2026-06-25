/**
 * BATCH EMAIL GENERATION ENDPOINT - FINAL FIX
 *
 * Generates proper professional letters from one director to another
 * Converts reasoning/intention into actual business correspondence
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

// Admin name mapping
const ADMIN_NAME_MAP: Record<string, string> = {
  "jimi": "James",
  "Jimi": "James",
  "oyepeju": "Oye",
  "Oye": "Oye",
};

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

function formatEmailAsLetter(
  recommendationBody: string,
  businessName: string,
  senderName: string
): string {
  // Convert to peer-to-peer tone: replace "their/they" with "your/you"
  const peerToPeerBody = recommendationBody
    .replace(/\btheir\b/gi, "your")
    .replace(/\bthey\b/gi, "you")
    .replace(/\bthey're\b/gi, "you're")
    .replace(/\bthey've\b/gi, "you've");

  // Build a proper letter format
  const letterBody = `Hi ${businessName},

${peerToPeerBody.trim()}

Best regards,
${senderName}
Saint & Story`;

  return letterBody;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    let senderName = user?.firstName || user?.fullName || "Team Member";
    
    // Map admin names for consistency
    const firstNameLower = (user?.firstName || "").toLowerCase();
    if (firstNameLower in ADMIN_NAME_MAP) {
      senderName = ADMIN_NAME_MAP[firstNameLower];
    }

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

        // STEP 3: Convert to proper letter format for each variation
        const recommendations_data = recommendations.map((rec) => {
          let emailBody = "";
          
          if (rec.rank === 1 && rec.email) {
            // Full email for #1
            emailBody = formatEmailAsLetter(
              rec.email.fullBody,
              prospect.businessName,
              senderName
            );
          } else if (rec.preview) {
            // Preview for #2, #3
            emailBody = `Hi ${prospect.businessName},\n\n${rec.preview}\n\nBest regards,\n${senderName}\nSaint & Story`;
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

        // STEP 4: Format for ENRICH - use #1 as default
        const topRecommendation = recommendations_data[0];

        // LOCKED SUBJECT LINE: Optimized for 90%+ response rate
        // Shows reciprocity (set up account) + expansion (social proof) in subject
        const subject = `We're expanding to ${prospect.city || "your area"} - set up your account`;

        // Mail merge: Replace placeholders with actual prospect data
        const bodyWithMerge = topRecommendation.emailBody
          .replace(/{{{city}}}/g, prospect.city || "your area")
          .replace(/{{{businessName}}}/g, prospect.businessName || "");

        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          subject: subject,
          body: bodyWithMerge,
          wordCount: bodyWithMerge.split(/\s+/).length,
          senderName: senderName,
          relationshipStage: 1,
          status: "success",
          variations: recommendations_data,
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
      emails: successfulResults,
      results: results,
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
