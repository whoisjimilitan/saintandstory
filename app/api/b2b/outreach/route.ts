import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { generateEmail, generatePainPointImplication } from "@/lib/b2b-email";
import { generatePhase1Intelligence } from "@/lib/engine-phase1-working";
import { analyzePsychology } from "@/lib/phase-3-psychology-engine";
import type { BusinessProfile } from "@/lib/business-relationship-engine";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];
const FROM = "Jimi at Saint & Story <hello@saintandstoryltd.co.uk>";
const BASE_URL = "https://saintandstoryltd.co.uk";

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

// Generate draft for a lead (no send) + show outreach history
// NOW USES REASONING ENGINE to inform email generation
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");
  if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM b2b_leads WHERE id = ${leadId} LIMIT 1`;
  const lead = rows[0];
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // PHASE 1 & 3: Get reasoning to inform email generation
  try {
    const businessProfile: BusinessProfile = {
      name: lead.business_name as string,
      industry: (lead.business_category as string) || "Unknown",
      location: (lead.city as string) || "Unknown",
      size: "small",
      contactName: lead.contact_name as string | undefined,
      discoveryEvidence: {
        operationalIndicators: [
          lead.delivery_type || "Unknown",
          `Frequency: ${lead.delivery_frequency || "Unknown"}`,
        ].filter(Boolean),
        growthSignals: [],
        currentSolutions: lead.courier_provider ? [lead.courier_provider as string] : [],
        painPoints: [lead.pain_point, lead.delivery_challenge]
          .filter(Boolean) as string[],
      },
    };

    // Generate intelligence and psychology
    const intelligence = generatePhase1Intelligence(leadId, businessProfile);
    const psychology = analyzePsychology(intelligence);

    // Generate email (existing system, but informed by psychology)
    const painPointImplication = generatePainPointImplication(
      lead.pain_point as string | null,
      lead.business_category as string | null
    );

    const { subject, body } = await generateEmail({
      businessName: lead.business_name as string,
      category: (lead.business_category as string) ?? "business",
      city: (lead.city as string) ?? "your area",
      painPoint: lead.pain_point as string | null,
      painPointImplication,
      landingPageUrl: (lead.landing_page_url as string) ?? `${BASE_URL}/b2b/${lead.niche ?? "retailers"}`,
    });

    // Fetch full outreach history for engagement tracking
    const outreach = await sql`
      SELECT id, subject, sent_at, email_type, replied, replied_at
      FROM b2b_outreach
      WHERE lead_id = ${leadId}
      ORDER BY sent_at DESC
    `;

    // Return email WITH reasoning metadata
    return NextResponse.json({
      subject,
      body,
      lead,
      outreach_history: outreach,
      reasoning: {
        stage: intelligence.relationshipModel.currentStage,
        trust: intelligence.relationshipModel.trustScore,
        dominantPsychology: psychology.dominantPattern,
        psychologyRecommendation: psychology.reframedStrategy,
        strategy: intelligence.strategy.strategicRationale,
        confidence: intelligence.metadata.confidenceScore,
      },
    });
  } catch (error) {
    console.error("[OUTREACH GET] Reasoning error:", error);
    // Fall back to basic email generation if reasoning fails
    const painPointImplication = generatePainPointImplication(
      lead.pain_point as string | null,
      lead.business_category as string | null
    );

    const { subject, body } = await generateEmail({
      businessName: lead.business_name as string,
      category: (lead.business_category as string) ?? "business",
      city: (lead.city as string) ?? "your area",
      painPoint: lead.pain_point as string | null,
      painPointImplication,
      landingPageUrl: (lead.landing_page_url as string) ?? `${BASE_URL}/b2b/${lead.niche ?? "retailers"}`,
    });

    const outreach = await sql`
      SELECT id, subject, sent_at, email_type, replied, replied_at
      FROM b2b_outreach
      WHERE lead_id = ${leadId}
      ORDER BY sent_at DESC
    `;

    return NextResponse.json({ subject, body, lead, outreach_history: outreach });
  }
}

// Send email
// NOW STORES REASONING METADATA with email for revenue traceability
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { leadId, subject, body, emailType, reasoning } = await request.json() as {
    leadId: string;
    subject: string;
    body: string;
    emailType?: string;
    reasoning?: {
      stage?: number;
      trust?: number;
      dominantPsychology?: string;
      strategy?: string;
    };
  };

  if (!leadId || !subject || !body) {
    return NextResponse.json({ error: "leadId, subject, body required" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM b2b_leads WHERE id = ${leadId} LIMIT 1`;
  const lead = rows[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  if (!lead.email) {
    return NextResponse.json({ error: "Lead has no email address" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "Resend not configured" }, { status: 500 });

  const resend = new Resend(resendKey);
  const followUp1At = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const followUp2At = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: lead.email as string,
    subject,
    text: body,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log outreach WITH reasoning metadata for revenue traceability
  const reasoningJson = reasoning ? JSON.stringify(reasoning) : null;

  await sql`
    INSERT INTO b2b_outreach (
      lead_id, subject, body, sent_at, follow_up_1_at, follow_up_2_at,
      email_type, resend_message_id, reasoning_metadata
    )
    VALUES (
      ${leadId}, ${subject}, ${body}, NOW(), ${followUp1At}, ${followUp2At},
      ${emailType ?? "initial"}, ${data?.id ?? null}, ${reasoningJson}
    )
  `;

  // Update lead status
  await sql`
    UPDATE b2b_leads
    SET status = 'contacted', updated_at = NOW(), email_sent_at = NOW()
    WHERE id = ${leadId}
  `;

  return NextResponse.json({
    success: true,
    messageId: data?.id,
    reasoning: reasoning,
  });
}
