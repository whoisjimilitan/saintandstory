/**
 * BATCH EMAIL GENERATION ENDPOINT
 *
 * Uses Problem-Centric Brief Generator
 * Generates ONE personalized brief per prospect following:
 * - Problem type inference from business category
 * - Psychology analysis (inverse incentives, loss aversion)
 * - Problem-specific language with embedded psychology
 * - Professional, human tone
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

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
          contactName: true,
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
        // Extract first name from contact name for mail merge
        const firstName = prospect.contactName
          ? prospect.contactName.split(" ")[0]
          : undefined;

        // Generate email using problem-centric brief generator
        // First, infer problem type from business category
        const { inferProblemFromCategory } = await import("@/lib/confession-inferencer");
        const { getProblemType } = await import("@/lib/problems-map");
        const { analyzePsychology } = await import("@/lib/psychology-analyzer");
        const { generateBrief, generateEmailBody } = await import("@/lib/brief-generator");

        const categoryInference = inferProblemFromCategory(prospect.businessCategory || "");
        const problemType = categoryInference.primary_problem || "court_deadline_delivery";
        const problem = getProblemType(problemType);

        if (!problem) {
          throw new Error(`Invalid problem type: ${problemType}`);
        }

        // Analyze psychology
        const confession = `${prospect.businessName} in ${prospect.city || "UK"} (${prospect.businessCategory || "Business"})`;
        const psychology = analyzePsychology({
          confession_text: confession,
          problem_type: problemType,
          company_name: prospect.businessName,
          location: prospect.city
        });

        if (!psychology) {
          throw new Error("Failed to analyze psychology");
        }

        // Generate brief using problem-centric system
        const brief = generateBrief({
          confession_text: confession,
          problem_type: problemType,
          contact_name: firstName,
          company_name: prospect.businessName,
          location: prospect.city,
          psychology
        });

        if (!brief) {
          throw new Error("Failed to generate brief");
        }

        const emailV4 = {
          subjectLine: brief.subject,
          bodyText: generateEmailBody(brief),
          specificPain: psychology.inverse_incentive,
          specificPromise: psychology.loss_aversion_frame,
          consequenceTier: 1,
          senderVoice: "Professional"
        };

        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          subject: emailV4.subjectLine,
          body: emailV4.bodyText,
          htmlBody: brief.html, // Use problem-centric brief HTML
          wordCount: emailV4.bodyText.split(/\s+/).length,
          senderName: senderName,
          relationshipStage: 1,
          status: "success",
          pain: emailV4.specificPain,
          promise: emailV4.specificPromise,
          consequenceTier: emailV4.consequenceTier,
          senderVoice: emailV4.senderVoice,
          problemType: problemType,
          psychologyAnalysis: psychology
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
