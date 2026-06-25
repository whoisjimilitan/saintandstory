/**
 * BATCH EMAIL GENERATION ENDPOINT
 *
 * Uses B2B Email Reasoning Engine (locked 2026-06-25)
 * Generates ONE optimized email per prospect following:
 * - Four lightbulb ideas
 * - Pain identification by category
 * - Locked email template
 * - No modifications without approval
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateB2BOutreachEmail } from "@/lib/b2b-email-reasoning-engine";

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
        // Generate email using B2B Email Reasoning Engine (locked)
        const generatedEmail = generateB2BOutreachEmail(
          {
            id: prospect.id,
            businessName: prospect.businessName,
            businessCategory: prospect.businessCategory,
            city: prospect.city,
            email: prospect.email,
          },
          senderName
        );

        results.push({
          prospectId: generatedEmail.prospectId,
          businessName: generatedEmail.businessName,
          email: generatedEmail.email,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
          wordCount: generatedEmail.wordCount,
          senderName: senderName,
          relationshipStage: 1,
          status: "success",
          painPoint: generatedEmail.painPoint,
          hasPicture: generatedEmail.hasPicture,
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
