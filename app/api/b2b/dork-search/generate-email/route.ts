import { NextResponse } from "next/server";

/**
 * BATCH 2 - PHASE 1: Sample Email Generation
 *
 * Takes a discovered lead and generates a trust-native email based on:
 * - Pressure group (from dork search parsing)
 * - RRTA Framework (Recognition → Relief → Trust → Action)
 * - Inverse incentive pattern ("You may not need this")
 */

type PressureGroup =
  | "Time-Critical Movement"
  | "Capacity Overflow"
  | "Appointment Scheduling Friction"
  | "Customer Acquisition Friction";

// Email templates by pressure group
const EMAIL_TEMPLATES: Record<PressureGroup, { subject: string; body: string }> = {
  "Time-Critical Movement": {
    subject: "Furniture orders backing up? Quick question.",
    body: `Hi,

I noticed you're taking custom furniture orders on Instagram.

You may not need this, but we've helped similar stores cut their order-to-delivery timeline by 3-4 weeks just by systematizing how they handle incoming requests.

Most find they're losing 15-20% of orders to slow response times alone.

Quick question: are orders ever backing up on your end?

If not, no worries—ignore this.

Best,
Saint & Story`
  },

  "Capacity Overflow": {
    subject: "Quick question about your team capacity",
    body: `Hi,

I saw you're growing your business on Instagram.

You may not need this, but we've helped businesses like yours free up 10+ hours per week just by handling their lead follow-up automatically.

Most were surprised how much time that created for actual work.

Question: are you ever overwhelmed by incoming inquiries?

If not, disregard this.

Best,
Saint & Story`
  },

  "Appointment Scheduling Friction": {
    subject: "Appointment no-shows killing your schedule?",
    body: `Hi,

I noticed you're booking appointments on Instagram.

You may not need this, but we've worked with similar practices and reduced no-shows by 40% just by sending intelligent reminders at the right moment.

Most found that single change freed up 5-8 hours per week.

Quick question: are no-shows a real problem for you?

If not, ignore this.

Best,
Saint & Story`
  },

  "Customer Acquisition Friction": {
    subject: "Question about your lead quality",
    body: `Hi,

I see you're looking for clients on Instagram.

You may not need this, but we've helped similar businesses double their qualified lead flow just by systemizing how they identify and reach out to prospects.

Most found the increase cut their cost per acquisition by 40%.

Quick question: are most of your leads low-quality or unresponsive?

If not, disregard.

Best,
Saint & Story`
  }
};

interface GenerateEmailRequest {
  leadId: string;
  businessName: string;
  pressureGroup: PressureGroup;
  businessType?: string;
  source?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateEmailRequest;

    const { leadId, businessName, pressureGroup, businessType, source } = body;

    if (!leadId || !businessName || !pressureGroup) {
      return NextResponse.json(
        { error: "leadId, businessName, and pressureGroup are required" },
        { status: 400 }
      );
    }

    // Get template for this pressure group
    const template = EMAIL_TEMPLATES[pressureGroup as PressureGroup];
    if (!template) {
      return NextResponse.json(
        { error: `Unknown pressure group: ${pressureGroup}` },
        { status: 400 }
      );
    }

    // Build email with lead-specific context
    const email = {
      leadId,
      businessName,
      pressureGroup,
      source: source || "unknown",
      businessType: businessType || "business",

      // Email fields
      subject: template.subject,
      body: template.body,

      // Metadata
      framework: "RRTA",
      pattern: "Inverse Incentive",
      readyForPreview: true,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      phase: "PHASE 1 - Email Generation",
      email
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
