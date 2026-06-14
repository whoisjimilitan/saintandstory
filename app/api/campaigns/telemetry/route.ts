/**
 * Campaign Telemetry Endpoint
 *
 * Real-time status of all campaign stages:
 * - Discovery progress
 * - Lead generation
 * - Email sending
 * - Engagement metrics
 * - Qualification status
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const maxDuration = 30;
export const revalidate = 0; // No caching - always fresh

export async function GET(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get time window (last 24 hours by default)
    const searchParams = req.nextUrl.searchParams;
    const hours = parseInt(searchParams.get("hours") || "24", 10);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // DISCOVERY STATS
    const discoveryStats = await sql`
      SELECT COUNT(*) as discovered_count
      FROM discovered_businesses
      WHERE created_at > ${since}::timestamp
    `;

    const discoveryLeads = await sql`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE created_at > ${since}::timestamp
    `;

    // CAMPAIGN STATS (Phase 3)
    const campaignStats = await sql`
      SELECT
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful_sends,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_sends,
        COUNT(DISTINCT lead_id) as unique_leads
      FROM phase3_campaign
      WHERE created_at > ${since}::timestamp
    `;

    // ENGAGEMENT STATS
    const engagementStats = await sql`
      SELECT
        COUNT(CASE WHEN event_type = 'opened' THEN 1 END) as opens,
        COUNT(CASE WHEN event_type = 'clicked' THEN 1 END) as clicks,
        COUNT(CASE WHEN event_type = 'bounced' THEN 1 END) as bounces,
        COUNT(CASE WHEN event_type = 'complained' THEN 1 END) as complaints,
        COUNT(DISTINCT lead_id) as engaged_leads
      FROM b2b_email_events
      WHERE created_at > ${since}::timestamp
    `;

    // LEAD QUALIFICATION STATS
    const tierStats = await sql`
      SELECT
        SUM(CASE WHEN lead_tier = 'A' THEN 1 ELSE 0 END) as tier_a,
        SUM(CASE WHEN lead_tier = 'B' THEN 1 ELSE 0 END) as tier_b,
        SUM(CASE WHEN lead_tier = 'C' THEN 1 ELSE 0 END) as tier_c
      FROM b2b_leads
      WHERE created_at > ${since}::timestamp
    `;

    // LANDING PAGE STATS
    const pageStats = await sql`
      SELECT
        COUNT(*) as total_visits,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(DISTINCT lead_id) as leads_who_visited
      FROM page_engagement_log
      WHERE visited_at > ${since}::timestamp
    `;

    // ORCHESTRATION STATUS
    const orchStatus = await sql`
      SELECT
        COUNT(*) as total_runs,
        MAX(created_at) as last_run,
        status,
        execution_details
      FROM b2b_orchestration_logs
      WHERE created_at > ${since}::timestamp
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      window_hours: hours,
      discovery: {
        businesses_found: discoveryStats[0]?.discovered_count || 0,
        new_leads: discoveryLeads[0]?.count || 0,
      },
      campaign: {
        emails_sent: campaignStats[0]?.total_sent || 0,
        successful: campaignStats[0]?.successful_sends || 0,
        failed: campaignStats[0]?.failed_sends || 0,
        unique_leads_targeted: campaignStats[0]?.unique_leads || 0,
      },
      engagement: {
        opens: engagementStats[0]?.opens || 0,
        clicks: engagementStats[0]?.clicks || 0,
        bounces: engagementStats[0]?.bounces || 0,
        complaints: engagementStats[0]?.complaints || 0,
        engaged_leads: engagementStats[0]?.engaged_leads || 0,
        open_rate: campaignStats[0]?.total_sent
          ? ((engagementStats[0]?.opens || 0) / campaignStats[0].total_sent * 100).toFixed(1)
          : "0.0",
        click_rate: engagementStats[0]?.opens
          ? ((engagementStats[0]?.clicks || 0) / engagementStats[0].opens * 100).toFixed(1)
          : "0.0",
      },
      qualification: {
        tier_a: tierStats[0]?.tier_a || 0,
        tier_b: tierStats[0]?.tier_b || 0,
        tier_c: tierStats[0]?.tier_c || 0,
      },
      page_engagement: {
        total_visits: pageStats[0]?.total_visits || 0,
        unique_sessions: pageStats[0]?.unique_sessions || 0,
        leads_who_visited: pageStats[0]?.leads_who_visited || 0,
      },
      orchestration: {
        last_run: orchStatus[0]?.last_run,
        status: orchStatus[0]?.status,
      },
    });
  } catch (error) {
    console.error("[Campaign Telemetry] Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
