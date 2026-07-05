import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * Fix #1: Email Status - Get actual delivery status from Resend webhooks
 * Not just checking if resendMessageId exists, but actual delivery status
 */

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get all emails sent today with their actual delivery status from webhooks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query 1: Email campaigns from b2b_outreach
    const campaignEmails = await sql`
      SELECT
        o.id,
        o.resend_message_id,
        l.id as lead_id,
        l.business_name,
        l.email,
        o.subject,
        o.body,
        o.sent_at,
        'campaign' as source,
        COALESCE(
          (SELECT event_type FROM b2b_email_events WHERE outreach_id = o.id ORDER BY created_at DESC LIMIT 1),
          CASE WHEN o.resend_message_id IS NOT NULL THEN 'sent' ELSE 'pending' END
        ) as actual_status,
        (SELECT COUNT(*) FROM b2b_email_events WHERE outreach_id = o.id AND event_type = 'opened') as open_count,
        (SELECT COUNT(*) FROM b2b_email_events WHERE outreach_id = o.id AND event_type = 'clicked') as click_count,
        (SELECT MAX(created_at) FROM b2b_email_events WHERE outreach_id = o.id AND event_type = 'opened') as last_opened_at
      FROM b2b_outreach o
      JOIN b2b_leads l ON o.lead_id = l.id
      WHERE DATE(o.sent_at) = CURRENT_DATE
    `;

    // Query 2: Opportunity feed emails
    const feedEmails = await sql`
      SELECT
        CONCAT('feed-', f.id) as id,
        NULL as resend_message_id,
        NULL as lead_id,
        f.company_name as business_name,
        f.contact_email as email,
        f.email_subject as subject,
        f.email_body as body,
        f.sent_at,
        'feed' as source,
        CASE WHEN f.status = 'sent' THEN 'sent' ELSE 'pending' END as actual_status,
        (CASE WHEN f.opened_at IS NOT NULL THEN 1 ELSE 0 END)::int as open_count,
        0::int as click_count,
        f.opened_at as last_opened_at
      FROM "OpportunityFeed" f
      WHERE f.status = 'sent' AND DATE(f.sent_at) = CURRENT_DATE
    `;

    // Combine and sort by sent_at descending
    const allEmails = [...campaignEmails, ...feedEmails];
    allEmails.sort((a: any, b: any) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());

    return NextResponse.json({
      success: true,
      emails: allEmails.map((email: any) => ({
        id: email.id,
        leadId: email.lead_id,
        businessName: email.business_name,
        email: email.email,
        subject: email.subject,
        body: email.body,
        sentAt: email.sent_at,
        resendMessageId: email.resend_message_id,
        status: email.actual_status || "pending",
        opens: Number(email.open_count || 0),
        clicks: Number(email.click_count || 0),
        lastOpenedAt: email.last_opened_at,
        source: email.source,
      })),
      count: allEmails.length,
    });
  } catch (error) {
    console.error("[EMAIL-STATUS-TODAY] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email status", success: false },
      { status: 500 }
    );
  }
}
