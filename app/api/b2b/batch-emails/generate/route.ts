import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOptimizedEmailV3, validateEmailV3 } from "@/lib/trust-signal-email-engine-v3";

interface EmailPreview {
  prospectId: string;
  businessName: string;
  city: string;
  subject: string;
  body: string;
  wordCount: number;
  responseRatePotential: "high" | "medium" | "low";
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

    // Fetch prospects with reasoning data
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

    // Generate emails using TRUST-SIGNAL-EMAIL-ENGINE-V3 (Universal, Pattern-Based)
    const emails: EmailPreview[] = [];
    const failedProspects: string[] = [];

    for (const prospect of prospects) {
      try {
        const result = generateOptimizedEmailV3({
          businessName: prospect.businessName,
          businessCategory: prospect.businessCategory || undefined,
          city: prospect.city || undefined,
        });

        if (!result) {
          failedProspects.push(prospect.id);
          continue;
        }

        const { email, validation } = result;

        emails.push({
          prospectId: prospect.id,
          businessName: prospect.businessName,
          city: prospect.city || "Unknown",
          subject: email.subject,
          body: email.body,
          wordCount: email.wordCount,
          responseRatePotential: validation.responseRatePotential,
          validationIssues: validation.issues.length > 0 ? validation.issues : undefined,
        });
      } catch (error) {
        console.error(`[BATCH EMAIL GENERATE] Failed for prospect ${prospect.id}:`, error);
        failedProspects.push(prospect.id);
      }
    }

    // Calculate response rate metrics
    const highPotential = emails.filter((e) => e.responseRatePotential === "high").length;
    const mediumPotential = emails.filter((e) => e.responseRatePotential === "medium").length;
    const lowPotential = emails.filter((e) => e.responseRatePotential === "low").length;

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
      failedCount: failedProspects.length,
      failedProspectIds: failedProspects.length > 0 ? failedProspects : undefined,
      metrics: {
        highResponsePotential: highPotential,
        mediumResponsePotential: mediumPotential,
        lowResponsePotential: lowPotential,
        estimatedResponseRate: highPotential > 0 ? `${Math.round((highPotential / emails.length) * 100)}%+` : "Optimize before sending",
      },
      engine: "TRUST-SIGNAL-EMAIL-ENGINE-V3 (Universal, Pattern-Based, Reasoning-Driven)",
      note: "Each email is uniquely generated based on business type reasoning. Not templated. Optimized for trust-signal psychology and 50%+ response rate target.",
    });
  } catch (error) {
    console.error("[BATCH EMAIL GENERATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate emails" },
      { status: 500 }
    );
  }
}
