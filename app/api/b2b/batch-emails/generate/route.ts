import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTrustSignalEmailV2, validateEmailV2 } from "@/lib/trust-signal-email-engine-v2";

interface EmailPreview {
  prospectId: string;
  businessName: string;
  city: string;
  subject: string;
  body: string;
  wordCount: number;
  validationIssues?: string[];
}

export async function POST(request: Request) {
  try {
    const { prospectIds } = await request.json();

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid prospectIds array" },
        { status: 400 }
      );
    }

    // Fetch prospects with all data needed for email generation
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
      },
    });

    // Generate emails using BATCH 2 Trust Signal Email Engine (Commit 3cdb3a5)
    const emails: EmailPreview[] = [];
    const failedProspects: string[] = [];

    for (const prospect of prospects) {
      try {
        const emailResult = generateTrustSignalEmailV2({
          businessName: prospect.businessName,
          businessCategory: prospect.businessCategory || undefined,
          city: prospect.city || undefined,
        });

        if (!emailResult) {
          failedProspects.push(prospect.id);
          continue;
        }

        // Validate email against BATCH 2 standards
        const validation = validateEmailV2(emailResult);

        emails.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          city: prospect.city || "Unknown",
          subject: emailResult.subject,
          body: emailResult.body,
          wordCount: emailResult.wordCount,
          validationIssues: validation.issues.length > 0 ? validation.issues : undefined,
        });
      } catch (error) {
        console.error(`[BATCH EMAIL GENERATE] Failed for prospect ${prospect.id}:`, error);
        failedProspects.push(prospect.id);
      }
    }

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
      failedCount: failedProspects.length,
      failedProspectIds: failedProspects.length > 0 ? failedProspects : undefined,
      note: "All emails generated using BATCH 2 Trust Signal Email Engine (Commit 3cdb3a5)",
    });
  } catch (error) {
    console.error("[BATCH EMAIL GENERATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate emails" },
      { status: 500 }
    );
  }
}
