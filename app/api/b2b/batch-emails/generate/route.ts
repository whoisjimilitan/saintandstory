/**
 * BATCH EMAIL GENERATION ENDPOINT
 *
 * THE PROPHECY PIPELINE:
 * 1. Identify the REAL problem (from category or inference)
 * 2. Generate detailed brief HTML (shows deep understanding)
 * 3. Fill template with specific problem + punchy line (feels prophetic)
 * 4. Return both brief (for preview) and email (for sending)
 *
 * Goal: Every prospect feels like someone read their mind.
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
          contactName: true,
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
        console.log(`[PROPHECY-PIPELINE] Starting: ${prospect.businessName}`);

        // Import all generators once per prospect (not per loop)
        const { inferProblemFromCategory } = await import("@/lib/confession-inferencer");
        const { getProblemType } = await import("@/lib/problems-map");
        const { analyzePsychology } = await import("@/lib/psychology-analyzer");
        const { generateBrief, generateEmailBody } = await import("@/lib/brief-generator");

        // ============ STEP 1: Identify Real Problem ============
        console.log(`[PROPHECY-PIPELINE] Step 1: Identifying problem...`);

        // Support both 'category' (from Discover) and 'businessCategory' (from DB)
        const category = (prospect.category || prospect.businessCategory || "").trim();
        console.log(`[PROPHECY-PIPELINE] Prospect fields:`, {
          businessName: prospect.businessName,
          category: prospect.category,
          businessCategory: prospect.businessCategory,
          extractedNeed: prospect.extractedNeed,
          finalCategory: category
        });

        const categoryInference = inferProblemFromCategory(category);
        console.log(`[PROPHECY-PIPELINE] Category inference result:`, {
          input: category,
          primary_problem: categoryInference.primary_problem,
          confidence: categoryInference.confidence
        });

        const problemType = categoryInference.primary_problem || "court_deadline_delivery";
        const problem = getProblemType(problemType);

        if (!problem) {
          throw new Error(`Invalid problem type: ${problemType}`);
        }

        console.log(`[PROPHECY-PIPELINE] Problem identified: ${problemType}`);

        // ============ STEP 2: Analyze Psychology ============
        console.log(`[PROPHECY-PIPELINE] Step 2: Analyzing psychology...`);

        // Create confession: Use pain point if available, otherwise generic
        const confession = prospect.painPoint
          ? `${prospect.businessName} said: "${prospect.painPoint}"`
          : `${prospect.businessName} in ${prospect.city || "UK"} (${prospect.businessCategory || "Business"})`;

        const psychology = analyzePsychology({
          confession_text: confession,
          problem_type: problemType,
          company_name: prospect.businessName,
          location: prospect.city
        });

        if (!psychology) {
          throw new Error("Failed to analyze psychology");
        }

        console.log(`[PROPHECY-PIPELINE] Psychology analyzed. Urgency: ${psychology.urgency_level}`);

        // ============ STEP 3: Generate Detailed Brief ============
        console.log(`[PROPHECY-PIPELINE] Step 3: Generating brief...`);

        const firstName = prospect.contactName
          ? prospect.contactName.split(" ")[0]
          : undefined;

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

        console.log(`[PROPHECY-PIPELINE] Brief generated: ${brief.opening.substring(0, 50)}...`);

        // ============ STEP 4: Generate Simple Email (Template + Specificity) ============
        console.log(`[PROPHECY-PIPELINE] Step 4: Generating email from template...`);

        const emailBody = generateEmailBody(brief, {
          confession_text: confession,
          problem_type: problemType,
          contact_name: firstName,
          company_name: prospect.businessName,
          location: prospect.city,
          psychology
        });

        console.log(`[PROPHECY-PIPELINE] Email generated. Length: ${emailBody.split("\n").length} lines`);

        // ============ STEP 5: Package Result ============
        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          subject: `Brief: ${prospect.businessName}`,
          body: emailBody,
          htmlBody: brief.html,
          wordCount: emailBody.split(/\s+/).length,
          senderName: senderName,
          relationshipStage: 1,
          status: "success",
          problemType: problemType,
          psychologyAnalysis: psychology,
          briefOpening: brief.opening,
          prePopulatedReply: brief.pre_populated_reply
        });

        console.log(`[PROPHECY-PIPELINE] ✓ Complete: ${prospect.businessName}`);
      } catch (prospectError) {
        console.error(
          `[PROPHECY-PIPELINE] ✗ Error processing ${prospect.businessName}:`,
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
    console.log(`[PROPHECY-PIPELINE] Results: ${successfulResults.length} success, ${results.length - successfulResults.length} failed`);

    return NextResponse.json({
      success: true,
      prospectCount: prospects.length,
      successCount: successfulResults.length,
      emails: successfulResults,
      results: results,
    });
  } catch (error) {
    console.error("[PROPHECY-PIPELINE] Server error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "Failed to generate emails",
        details: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}
