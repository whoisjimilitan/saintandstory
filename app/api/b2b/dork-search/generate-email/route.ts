import { NextResponse } from "next/server";
import { generateTrustSignalEmail, validateTrustSignals } from "@/lib/trust-signal-email-engine";
import { getIndustryProfile, getBlockerForIndustry } from "@/lib/industry-blocker-mapper";

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

    // Get industry profile and blocker
    const industry = getIndustryProfile(businessCategory);
    const blocker = getBlockerForIndustry(businessCategory);

    if (!industry || !blocker) {
      return NextResponse.json(
        {
          error: "Unable to determine industry or blocker for this business",
          category: businessCategory
        },
        { status: 400 }
      );
    }

    // Generate trust-signal email
    const emailResult = generateTrustSignalEmail({
      businessName,
      businessCategory,
      industry,
      blocker
    });

    if (!emailResult) {
      return NextResponse.json(
        { error: "Failed to generate email for this industry" },
        { status: 500 }
      );
    }

    // Validate trust signals
    const validation = validateTrustSignals(emailResult);

    if (!validation.isValid) {
      console.warn("[EMAIL-VALIDATION] Trust signal validation failed:", validation.issues);
    }

    // Return email with metadata
    return NextResponse.json({
      success: true,
      phase: "BATCH 2 REBOOT - Trust Signal Email",
      email: {
        leadId,
        businessName,
        industry: industry.industry,
        blocker: blocker.name,

        // Email content
        subject: emailResult.subject,
        body: emailResult.body,

        // Metadata
        framework: emailResult.framework,
        pattern: emailResult.pattern,
        humanAnchors: emailResult.humanAnchors,
        blockerReference: emailResult.blockerReference,
        confidence: emailResult.confidence,
        blockerUrgency: blocker.urgency,
        blockerTimeWindow: blocker.timeWindow,

        // Validation
        trustSignalsValid: validation.isValid,
        validationIssues: validation.issues,

        // Ready?
        readyForPreview: emailResult.readyForPreview && validation.isValid
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
