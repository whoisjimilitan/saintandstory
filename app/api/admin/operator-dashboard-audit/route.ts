import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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

    // 1. TODAY screen data: leads created today
    const todayLeads = await sql`
      SELECT COUNT(*) as count, niche
      FROM b2b_leads
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY niche
      ORDER BY count DESC
    `;

    // 2. PIPELINE screen data: all leads ordered by recency
    const pipelineLeads = await sql`
      SELECT
        id, business_name, niche, status, created_at,
        email_sent_at, lead_tier
      FROM b2b_leads
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // 3. Check what statuses exist
    const statuses = await sql`
      SELECT DISTINCT status, COUNT(*) as count
      FROM b2b_leads
      GROUP BY status
    `;

    // 4. Check outreach/email tracking
    const emailStats = await sql`
      SELECT
        COUNT(DISTINCT l.id) as leads_total,
        COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN l.id END) as leads_contacted,
        COUNT(o.id) as emails_sent,
        COUNT(DISTINCT CASE WHEN o.replied = true THEN l.id END) as leads_replied
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
    `;

    // 5. Check standing orders (conversions)
    const conversions = await sql`
      SELECT COUNT(*) as standing_orders
      FROM b2b_standing_orders
    `;

    // 6. Discovery source breakdown
    const sources = await sql`
      SELECT source, COUNT(*) as count
      FROM b2b_leads
      GROUP BY source
      ORDER BY count DESC
    `;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      operator_dashboard_status: {
        today_screen: {
          leads_created_today: todayLeads.reduce((sum: number, row: any) => sum + parseInt(row.count), 0),
          by_niche: todayLeads,
        },
        pipeline_screen: {
          recent_20_leads: pipelineLeads,
          total_by_status: statuses,
        },
        email_tracking: emailStats[0],
        conversions: conversions[0],
        discovery_sources: sources,
        is_alive: todayLeads.length > 0,
        issues: [
          todayLeads.length === 0 ? "⚠️ No leads created today - pipeline empty" : "✅ Leads flowing into pipeline",
          emailStats[0].leads_contacted === 0 ? "⚠️ No outreach emails sent - dashboard inactive" : "✅ Email outreach active",
          conversions[0].standing_orders === 0 ? "⚠️ No conversions yet" : "✅ Standing orders created",
        ].filter(i => i.includes("⚠️")),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
