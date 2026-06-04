import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { generateEmail } from "@/lib/b2b-email";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];
const FROM = "Jimi at Saint & Story <hello@saintandstoryltd.co.uk>";
const BASE_URL = "https://saintandstoryltd.co.uk";

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

// Generate draft for a lead (no send)
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");
  if (!leadId) return NextResponse.json({ error: "lead_id required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT * FROM b2b_leads WHERE id = ${leadId} LIMIT 1`;
  const lead = rows[0];
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { subject, body } = await generateEmail({
    businessName: lead.business_name as string,
    category: (lead.business_category as string) ?? "business",
    city: (lead.city as string) ?? "your area",
    painPoint: lead.pain_point as string | null,
    landingPageUrl: (lead.landing_page_url as string) ?? `${BASE_URL}/b2b/${lead.niche ?? "retailers"}`,
  });

  return NextResponse.json({ subject, body, lead });
}

// Send email
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { leadId, subject, body, emailType } = await request.json() as {
    leadId: string;
    subject: string;
    body: string;
    emailType?: string;
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

  // Log outreach
  await sql`
    INSERT INTO b2b_outreach (lead_id, subject, body, sent_at, follow_up_1_at, follow_up_2_at, email_type, resend_message_id)
    VALUES (${leadId}, ${subject}, ${body}, NOW(), ${followUp1At}, ${followUp2At}, ${emailType ?? "initial"}, ${data?.id ?? null})
  `;

  // Update lead status
  await sql`
    UPDATE b2b_leads SET status = 'contacted', updated_at = NOW() WHERE id = ${leadId}
  `;

  return NextResponse.json({ success: true, messageId: data?.id });
}
