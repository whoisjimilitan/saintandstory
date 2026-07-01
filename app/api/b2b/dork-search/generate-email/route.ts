import { NextResponse } from "next/server";
import { generateEmailV4, type EmailV4 } from "@/lib/email-engine-v4";

/**
 * EMAIL GENERATION - VERSION 5 (Production)
 *
 * Generates psychology-locked, ready-to-send cold outreach emails.
 *
 * ✅ 34+ business categories with functional problem seed plants
 * ✅ Consequence-based pain & promise mappings
 * ✅ V5 Psychology Stack: Bold recognition → Specific pain → Locked promise → Boldness frame
 * ✅ Operator preview for further personalization
 *
 * TEMPLATE (LOCKED):
 *   - Opening: "Reaching out cold—I know it's bold. But I noticed something with [functional problem]."
 *   - Pain: "You operate on [constraint]. One missed delivery = [consequence]."
 *   - Promise: "We built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost."
 *   - Closer: "Should we be talking? A reply back surely means a lot. Lasting relationships often form from these kinds of boldness :)"
 *   - Signature: "James\nSaint & Story Logistics"
 */

interface GenerateEmailRequest {
  leadId: string;
  businessName: string;
  city?: string;
  firstName?: string; // Contact first name for personalization
  senderName?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateEmailRequest;
    const { leadId, businessName, city, firstName, senderName = "James" } = body;

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
        email: undefined,
        firstName: firstName || undefined
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
