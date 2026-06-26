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

    const emailsWithStatus = await sql`
      SELECT
        o.id,
        o.resend_message_id,
        l.id as lead_id,
        l.business_name,
        l.email,
        o.subject,
        o.body,
        o.sent_at,
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
      ORDER BY o.sent_at DESC
    `;

    return NextResponse.json({
      success: true,
      emails: emailsWithStatus.map((email: any) => ({
        id: email.id,
        leadId: email.lead_id,
        businessName: email.business_name,
        email: email.email,
        subject: email.subject,
        body: email.body,
        sentAt: email.sent_at,
        resendMessageId: email.resend_message_id,
        status: email.actual_status || "pending",
        opens: email.open_count || 0,
        clicks: email.click_count || 0,
        lastOpenedAt: email.last_opened_at,
      })),
      count: emailsWithStatus.length,
    });
  } catch (error) {
    console.error("[EMAIL-STATUS-TODAY] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch email status", success: false },
      { status: 500 }
    );
  }
}
