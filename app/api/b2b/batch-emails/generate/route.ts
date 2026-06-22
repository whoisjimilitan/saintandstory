import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateReasonedEmailBatch,
  validateReasoningApplied,
  type ProspectData
} from "@/lib/v3-email-reasoning-engine";

interface EmailPreview {
  prospectId: string;
  prospectName: string;
  businessName: string;
  subject: string;
  body: string;
  wordCount: number;
  isValid: boolean;
  validationIssues?: string[];
  reasoning: {
    moment: string;
    insight: string;
    pressurePoint: string;
    service: string;
  };
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

    // Fetch prospects with data needed for reasoning
    const prospects = await prisma.b2bLead.findMany({
      where: {
        id: { in: prospectIds },
      },
      select: {
        id: true,
        businessName: true,
        city: true,
        businessCategory: true,
        country: true,
        email: true,
      },
    });

    // Extract person name from email if available (fallback to generic)
    const prospectDataForReasoning: ProspectData[] = prospects.map((p) => ({
      name: p.email?.split("@")[0]?.replace(/[._]/g, " ") || "There",
      businessName: p.businessName,
      businessCategory: p.businessCategory || "unknown",
      city: p.city || "your area",
      country: p.country,
    }));

    // Generate emails using V3 reasoning engine (NOT templated)
    const reasonedEmails = generateReasonedEmailBatch(prospectDataForReasoning);

    // Build response previews
    const emails: EmailPreview[] = [];
    const failedProspects: string[] = [];

    for (let i = 0; i < prospects.length; i++) {
      const prospect = prospects[i];
      const reasonedEmail = reasonedEmails[i];

      if (!reasonedEmail) {
        failedProspects.push(prospect.id);
        continue;
      }

      // Validate that reasoning was applied (not templating)
      const validation = validateReasoningApplied(reasonedEmail);

      emails.push({
        prospectId: prospect.id,
        prospectName: prospectDataForReasoning[i].name,
        businessName: prospect.businessName,
        subject: reasonedEmail.subject,
        body: reasonedEmail.body,
        wordCount: reasonedEmail.wordCount,
        isValid: validation.isValid,
        validationIssues: validation.issues.length > 0 ? validation.issues : undefined,
        reasoning: reasonedEmail.reasoning,
      });
    }

    // Calculate metrics
    const validEmails = emails.filter((e) => e.isValid).length;
    const totalGenerated = emails.length;

    return NextResponse.json({
      success: true,
      emails,
      count: totalGenerated,
      validCount: validEmails,
      failedCount: failedProspects.length,
      failedProspectIds: failedProspects.length > 0 ? failedProspects : undefined,
      metrics: {
        validationRate: `${totalGenerated > 0 ? Math.round((validEmails / totalGenerated) * 100) : 0}%`,
        averageWordCount:
          totalGenerated > 0
            ? Math.round(
                emails.reduce((sum, e) => sum + e.wordCount, 0) / totalGenerated
              )
            : 0,
        allFollowPattern: validEmails === totalGenerated,
      },
      engine: "V3_EMAIL_REASONING_ENGINE (Personalised, not templated)",
      note: "Each email is generated through REASONING of their specific moment, insight, and service. Hand-written feeling. Unique per prospect. Never templated.",
    });
  } catch (error) {
    console.error("[BATCH EMAIL GENERATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate emails" },
      { status: 500 }
    );
  }
}
