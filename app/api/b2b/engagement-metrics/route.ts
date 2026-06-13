import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  getEngagementMetrics,
  timeSinceLastEngagement,
} from "@/lib/engagement-tracking";

/**
 * Get engagement metrics for a lead
 * Shows: opens, clicks, engagement score, last activity
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");

  if (!leadId) {
    return NextResponse.json(
      { error: "lead_id required" },
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const metrics = await getEngagementMetrics(sql, leadId);

    return NextResponse.json({
      lead_id: leadId,
      engagement: {
        opens: metrics.opens,
        first_open: metrics.firstOpenAt
          ? new Date(metrics.firstOpenAt).toLocaleString()
          : null,
        last_open: metrics.lastOpenAt
          ? new Date(metrics.lastOpenAt).toLocaleString()
          : null,
        clicks: metrics.clicks,
        clicked_links: metrics.clickedLinks,
        last_click: metrics.lastClickAt
          ? new Date(metrics.lastClickAt).toLocaleString()
          : null,
        bounced: metrics.bounced,
        complained: metrics.complained,
        last_activity: metrics.lastActivity
          ? new Date(metrics.lastActivity).toLocaleString()
          : null,
        time_since_activity: timeSinceLastEngagement(
          metrics.lastActivity
        ),
      },
      engagement_score: metrics.engagementScore,
      status:
        metrics.complained || metrics.bounced
          ? "disqualified"
          : metrics.engagementScore > 50
            ? "hot"
            : metrics.engagementScore > 20
              ? "warm"
              : "cold",
    });
  } catch (error) {
    console.error("[ENGAGEMENT METRICS] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch engagement metrics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
