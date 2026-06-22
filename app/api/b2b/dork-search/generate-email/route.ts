import { NextResponse } from "next/server";
import { generateTrustSignalEmailV2, validateEmailV2 } from "@/lib/trust-signal-email-engine-v2";
import { getIndustryProfile } from "@/lib/industry-blocker-mapper";

/**
 * BATCH 2 REBOOT - Email Generation with Trust Signals
 *
 * Generates industry-specific, trust-signal-first emails
 * that reference the specific blocker this business likely faces.
 *
 * Not generic pressure templates.
 * Not salesy.
 * Sound like a peer who understands their world.
 */

interface GenerateEmailRequest {
  leadId: string;
  businessName: string;
  businessCategory?: string;
  pressureGroup?: string; // Legacy, ignored - we use blocker instead
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateEmailRequest;
    const { leadId, businessName, businessCategory } = body;

    if (!leadId || !businessName) {
      return NextResponse.json(
        { error: "leadId and businessName are required" },
        { status: 400 }
      );
    }

    // Generate V2 email (concise, psychologically dense, intelligent YES/MAYBE/NO)
    const emailResult = generateTrustSignalEmailV2({
      businessName,
      businessCategory,
      city: "London" // TODO: Extract from lead data when available
    });

    if (!emailResult) {
      return NextResponse.json(
        {
          error: "Unable to determine industry for this business",
          category: businessCategory
        },
        { status: 400 }
      );
    }

    // Validate for authenticity (conciseness, density, no salesy language)
    const validation = validateEmailV2(emailResult);

    if (!validation.isValid) {
      console.warn("[EMAIL-VALIDATION] Email validation issues:", validation.issues);
    }

    // Return email with metadata
    return NextResponse.json({
      success: true,
      phase: "BATCH 2 REBOOT V2 - Concise Trust Signal Email",
      email: {
        leadId,
        businessName,
        businessCategory,

        // Email content
        subject: emailResult.subject,
        body: emailResult.body,

        // Metadata
        wordCount: emailResult.wordCount,
        humanAnchors: emailResult.humanAnchors,

        // Validation
        authenticityValid: validation.isValid,
        validationIssues: validation.issues,

        // Ready?
        readyForPreview: validation.isValid
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[GENERATE-EMAIL] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
