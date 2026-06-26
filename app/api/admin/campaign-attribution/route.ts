import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Campaign Attribution & Performance
 * Compare Email vs Phone outreach effectiveness
 * Tracks conversions, engagement, and ROI by channel
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // EMAIL CHANNEL: facility_managers with outreach
    const emailChannel = await sql`
      SELECT
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT o.id) as emails_sent,
        COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN l.id END) as with_responses,
        COUNT(DISTINCT CASE WHEN r.response_type = 'YES' THEN l.id END) as yes_responses,
        COUNT(DISTINCT CASE WHEN r.response_type = 'MAYBE' THEN l.id END) as maybe_responses,
        COUNT(DISTINCT so.id) as standing_orders
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id AND o.sent_at IS NOT NULL
      LEFT JOIN b2b_responses r ON o.id = r.outreach_id
      LEFT JOIN b2b_standing_orders so ON l.id = so.lead_id
      WHERE l.niche = 'facility_managers' AND o.id IS NOT NULL
    `;

    // PHONE CHANNEL: facility_managers with phone calls
    const phoneChannel = await sql`
      SELECT
        COUNT(DISTINCT po.lead_id) as total_leads_called,
        COUNT(po.id) as total_calls,
        COUNT(CASE WHEN po.call_outcome = 'reached' THEN 1 END) as calls_reached,
        COUNT(CASE WHEN po.email_captured_from_call IS NOT NULL THEN 1 END) as emails_captured,
        COUNT(DISTINCT CASE WHEN po.email_captured_from_call IS NOT NULL THEN po.lead_id END) as leads_with_emails,
        COUNT(DISTINCT so.id) as standing_orders
      FROM phone_outreach po
      LEFT JOIN b2b_leads l ON po.lead_id = l.id
      LEFT JOIN b2b_standing_orders so ON l.id = so.lead_id
      WHERE l.niche = 'facility_managers'
    `.catch(() => ({
      total_leads_called: 0,
      total_calls: 0,
      calls_reached: 0,
      emails_captured: 0,
      leads_with_emails: 0,
      standing_orders: 0,
    }));

    // TOTAL FACILITY MANAGERS
    const total = await sql`
      SELECT COUNT(*) as total
      FROM b2b_leads
      WHERE niche = 'facility_managers'
    `;

    const emailData = Array.isArray(emailChannel) ? emailChannel[0] : emailChannel;
    const phoneData = Array.isArray(phoneChannel) ? phoneChannel[0] : phoneChannel;
    const totalData = Array.isArray(total) ? total[0] : total;

    // Calculate metrics
    const emailResponseRate = emailData.emails_sent > 0
      ? ((emailData.with_responses / emailData.emails_sent) * 100).toFixed(1)
      : "0";

    const emailConversionRate = emailData.emails_sent > 0
      ? ((emailData.standing_orders / emailData.emails_sent) * 100).toFixed(1)
      : "0";

    const phoneReachRate = phoneData.total_calls > 0
      ? ((phoneData.calls_reached / phoneData.total_calls) * 100).toFixed(1)
      : "0";

    const phoneEmailCaptureRate = phoneData.total_calls > 0
      ? ((phoneData.emails_captured / phoneData.total_calls) * 100).toFixed(1)
      : "0";

    return NextResponse.json({
      campaign_overview: {
        total_facility_managers_discovered: totalData.total,
        email_channel: emailData.total_leads,
        phone_channel: phoneData.total_leads_called,
        combined_outreach: (parseInt(emailData.total_leads) || 0) + (phoneData.total_leads_called || 0),
      },
      email_channel: {
        leads_targeted: emailData.total_leads || 0,
        emails_sent: emailData.emails_sent || 0,
        response_rate_percent: emailResponseRate,
        yes_responses: emailData.yes_responses || 0,
        maybe_responses: emailData.maybe_responses || 0,
        standing_orders: emailData.standing_orders || 0,
        conversion_rate_percent: emailConversionRate,
      },
      phone_channel: {
        leads_called: phoneData.total_leads_called || 0,
        total_call_attempts: phoneData.total_calls || 0,
        calls_reached: phoneData.calls_reached || 0,
        reach_rate_percent: phoneReachRate,
        emails_captured: phoneData.emails_captured || 0,
        email_capture_rate_percent: phoneEmailCaptureRate,
        leads_with_emails_to_follow_up: phoneData.leads_with_emails || 0,
        standing_orders: phoneData.standing_orders || 0,
      },
      effectiveness_comparison: {
        email_best_for: "Scale (reach 200+ in hours)",
        phone_best_for: "Quality (reach decision maker, capture email)",
        recommendation: "Hybrid: Phone first for key prospects, email for volume follow-up",
      },
      dashboard_visibility: {
        email_metrics: "Shows in /operator TODAY (emails sent)",
        phone_metrics: "Track via GET /api/admin/phone-outreach",
        attribution: "Each channel tracked separately for accurate ROI",
      },
    });
  } catch (error) {
    console.error("[campaign-attribution] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
