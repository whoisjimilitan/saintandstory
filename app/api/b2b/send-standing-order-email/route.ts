import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { generateStandingOrderEmail } from "@/lib/b2b-standing-order-email";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  if (!userId || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { lead_id, stage, prospect_brief_url } = await request.json() as {
    lead_id?: string;
    stage?: "post-brief" | "missing-info" | "confidence" | "confirmation";
    prospect_brief_url?: string;
  };

  if (!lead_id || !stage) {
    return NextResponse.json(
      { error: "lead_id and stage required" },
      { status: 400 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get lead data
    const leadResult = await sql`
      SELECT
        id, business_name, email, contact_name, business_category, city
      FROM b2b_leads
      WHERE id = ${lead_id}
    `;

    if (!leadResult || leadResult.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leadResult[0] as Record<string, unknown>;

    // Generate email content
    const emailContent = generateStandingOrderEmail(
      {
        businessName: (lead.business_name as string) || "there",
        contactName: (lead.contact_name as string) || undefined,
        category: (lead.business_category as string) || "business",
        city: (lead.city as string) || "your area",
        prospectBriefUrl: prospect_brief_url,
      },
      stage
    );

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && lead.email) {
      const resend = new Resend(resendKey);

      // Generate tracking pixel for email opens
      const emailTrackingId = `email_${Date.now()}`;

      await resend.emails.send({
        from: "Saint & Story <hello@saintandstoryltd.co.uk>",
        to: (lead.email as string),
        subject: emailContent.subject,
        html: `${emailContent.body}<img src="${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://saintandstoryltd.co.uk"}/api/b2b/track/email-open?id=${emailTrackingId}&lead_id=${lead_id}" width="1" height="1" style="display:none;" alt="" />`,
      });

      // Log email send as observation
      await sql`
        UPDATE b2b_leads
        SET human_observations = COALESCE(human_observations, '[]'::jsonb) ||
          jsonb_build_array(
            jsonb_build_object(
              'id', 'obs_' || (floor(extract(epoch from now()) * 1000))::text,
              'observation', 'Email sent: ' || ${stage} || ' stage',
              'context', 'email_sent',
              'confidence', 100,
              'recorded_at', now()::text
            )
          )
        WHERE id = ${lead_id}
      `;

      return NextResponse.json({
        success: true,
        message: `${stage} email sent to ${lead.email}`,
        trackingId: emailTrackingId,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Email service not configured or lead has no email",
    });
  } catch (error) {
    console.error("[Standing Order Email] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
