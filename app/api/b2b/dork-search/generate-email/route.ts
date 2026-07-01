import { NextResponse } from "next/server";
import { generateEmailV4, type EmailV4 } from "@/lib/email-engine-v4";

/**
 * EMAIL GENERATION - VERSION 5 (Production)
 *
 * Generates psychology-locked, ready-to-send cold outreach emails
 * using EMAIL ENGINE V5 (refined post-V4):
 *
 * ✅ 40+ business categories with dynamic seed plants
 * ✅ Consequence-based pain & promise mappings
 * ✅ V5 Psychology Stack: Honest opening → Seed Plant → Pain → Promise → Humanized Closer
 * ✅ Operator preview for further personalization
 *
 * SUBJECT: Benefit-focused, category-specific, optimized for opens
 * BODY: V5 Version with improved grammar and humanized closer
 *   - Opening: "Some people I know well, others I've barely talked with."
 *   - Closer: "Just curious if you'd reply. It means a lot. Real conversation starts there."
 */

interface GenerateEmailRequest {
  leadId: string;
  businessName: string;
  city?: string;
  senderName?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateEmailRequest;
    const { leadId, businessName, city, senderName = "James" } = body;

    if (!leadId || !businessName) {
      return NextResponse.json(
        { error: "leadId and businessName are required" },
        { status: 400 }
      );
    }

    // Generate V5 email using V4 engine (already contains V5 text)
    const emailV5: EmailV4 = generateEmailV4(
      {
        id: leadId,
        businessName,
        city: city || "your area",
        email: undefined
      },
      senderName
    );

    if (!emailV5) {
      return NextResponse.json(
        {
          error: "Unable to generate email for this business",
          businessName
        },
        { status: 400 }
      );
    }

    console.log("[GENERATE-EMAIL-V5] Generated for:", {
      businessName,
      consequenceTier: emailV5.consequenceTier,
      senderVoice: emailV5.senderVoice
    });

    // Return email with full metadata
    return NextResponse.json({
      success: true,
      phase: "EMAIL ENGINE V5 (Production)",
      email: {
        leadId,
        businessName,
        city: city || "your area",

        // Email content (V5)
        subject: emailV5.subjectLine,
        body: emailV5.bodyText,

        // Psychology metadata
        pain: emailV5.specificPain,
        promise: emailV5.specificPromise,
        tier: emailV5.consequenceTier,
        senderVoice: emailV5.senderVoice,

        // System info
        engine: "email-engine-v4 (contains V5 text)",
        readyForPreview: true,
        readyForSend: true,
        operatorCanEdit: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[GENERATE-EMAIL-V5] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
