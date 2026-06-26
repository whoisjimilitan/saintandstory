import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { generateB2BOutreachEmail } from "@/lib/b2b-email-reasoning-engine";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get all facility_managers leads with status "new" (no emails sent yet)
    const leads = await sql`
      SELECT
        id, business_name, email, city, niche, created_at
      FROM b2b_leads
      WHERE niche = 'facility_managers'
        AND status = 'new'
        AND email IS NOT NULL
      ORDER BY created_at DESC
    `;

    // Generate email content for each lead using the reasoning engine
    const emailsToSend = leads.map((lead: any) => {
      const email = generateB2BOutreachEmail(
        {
          id: lead.id,
          businessName: lead.business_name,
          email: lead.email,
          city: lead.city,
        },
        "James"
      );

      return {
        prospectId: lead.id,
        businessName: lead.business_name,
        email: lead.email,
        city: lead.city,
        subject: email.subject,
        body: email.body,
        wordCount: email.wordCount,
      };
    });

    return NextResponse.json({
      status: "ready",
      emails_prepared: emailsToSend.length,
      sample: emailsToSend.slice(0, 3),
      all_emails: emailsToSend,
      next_action: "POST to /api/admin/send-facility-emails?confirm=true to send all",
      breakdown: {
        total_ready: emailsToSend.length,
        by_city: emailsToSend.reduce((acc: any, e: any) => {
          acc[e.city] = (acc[e.city] || 0) + 1;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("[prepare-facility-emails] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { confirm } = Object.fromEntries(new URL(request.url).searchParams);

    if (confirm !== "true") {
      return NextResponse.json(
        { error: "Must pass ?confirm=true to actually send emails" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const Resend = require("resend").Resend;
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get all facility_managers leads with status "new"
    const leads = await sql`
      SELECT
        id, business_name, email, city, niche
      FROM b2b_leads
      WHERE niche = 'facility_managers'
        AND status = 'new'
        AND email IS NOT NULL
      ORDER BY created_at DESC
    `;

    console.log(`[send-facility-emails] Sending emails to ${leads.length} prospects...`);

    const sent: any[] = [];
    const failed: any[] = [];

    // Send each email
    for (const lead of leads) {
      try {
        const email = generateB2BOutreachEmail(
          {
            id: lead.id,
            businessName: lead.business_name,
            email: lead.email,
            city: lead.city,
          },
          "James"
        );

        const result = await resend.emails.send({
          from: "James <james@saintandstoryltd.co.uk>",
          to: lead.email,
          subject: email.subject,
          text: email.body,
        });

        if (result.error) {
          failed.push({ id: lead.id, email: lead.email, error: result.error });
        } else {
          sent.push({ id: lead.id, email: lead.email, messageId: result.id });

          // Record in b2b_outreach
          await sql`
            INSERT INTO b2b_outreach (
              lead_id, subject, body, sent_at, email_type, resend_message_id
            ) VALUES (
              ${lead.id}, ${email.subject}, ${email.body}, NOW(), 'initial', ${result.id}
            )
          `;

          // Update lead status
          await sql`
            UPDATE b2b_leads
            SET status = 'contacted', email_sent_at = NOW()
            WHERE id = ${lead.id}
          `;
        }
      } catch (err) {
        console.error(`[send-facility-emails] Failed to send to ${lead.email}:`, err);
        failed.push({ id: lead.id, email: lead.email, error: String(err) });
      }
    }

    return NextResponse.json({
      status: "complete",
      emails_sent: sent.length,
      emails_failed: failed.length,
      sent_emails: sent.slice(0, 10),
      failed_emails: failed,
      summary: `Successfully sent ${sent.length} emails. ${failed.length} failed.`,
      dashboard_impact: {
        leads_now_contacted: sent.length,
        status_changed: "new → contacted",
        next_metrics: "Watch /operator for open rates, replies, conversions",
      },
    });
  } catch (error) {
    console.error("[send-facility-emails] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
