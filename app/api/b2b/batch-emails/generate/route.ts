/**
 * BATCH EMAIL GENERATION ENDPOINT
 *
 * Uses Email Engine v4 (Psychology-Locked)
 * Generates ONE optimized email per prospect following:
 * - Consequence-tier hierarchy (Tier 1/2/3)
 * - Dynamic pain/promise injection per business type
 * - Locked sender voice profiles
 * - Psychology-locked template
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateEmailV4 } from "@/lib/email-engine-v4";
import { detectBusinessType } from "@/lib/business-pain-promise-map";
import { buildEmailHtml } from "@/lib/email-html-builder";

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

        // Generate email using Email Engine v4 (psychology-locked)
        const emailV4 = generateEmailV4(
          {
            id: prospect.id,
            businessName: prospect.businessName,
            city: prospect.city,
            email: prospect.email,
            firstName: firstName,
          },
          senderName
        );

        // Get sender role from business type if available
        const businessType = detectBusinessType(prospect.businessName);
        const senderRole = businessType.identity?.senderRole;

        // Generate HTML preview for the enrich page
        const htmlPreview = buildEmailHtml(
          {
            prospectName: firstName || "[Name]",
            body: emailV4.bodyText,
          },
          {
            name: senderName,
            email: prospect.email || "contact@saintandstoryltd.co.uk",
            role: senderRole
          }
        );

        results.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          email: prospect.email,
          subject: emailV4.subjectLine,
          body: emailV4.bodyText,
          htmlBody: htmlPreview,
          wordCount: emailV4.bodyText.split(/\s+/).length,
          senderName: senderName,
          relationshipStage: 1,
          status: "success",
          pain: emailV4.specificPain,
          promise: emailV4.specificPromise,
          consequenceTier: emailV4.consequenceTier,
          senderVoice: emailV4.senderVoice,
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
