import { neon } from "@neondatabase/serverless";
import { getLeadsByHeatScore } from "@/lib/heat-score";
import { getLeadsNeedingFollowUp } from "@/lib/adaptive-followup";
import { getCategoryPerformanceInsights } from "@/lib/category-analytics";
import { getHighPerformingMissions, getUnderperformingMissions } from "@/lib/mission-roi";

/**
 * Dashboard Intelligence System
 *
 * Aggregates all intelligence into operator recommendations:
 * - Hottest prospects to contact today
 * - Engagement activity summary
 * - Revenue progress
 * - AI recommendations for next actions
 *
 * This is the "operator command center" - the system tells you what to do.
 * DORMANT: Data collection + display only. No automated actions.
 */

export interface DashboardIntelligence {
  hottest_prospects: Array<{
    rank: number;
    lead_id: string;
    business_name: string;
    heat_score: number;
    engagement_score: number;
    last_activity: string;
  }>;

  pending_followups: Array<{
    lead_id: string;
    business_name: string;
    followup_type: string;
    reasoning: string;
    days_since_contact: number;
  }>;

  recent_engagement: Array<{
    business_name: string;
    event_type: string;
    timestamp: string;
  }>;

  revenue_metrics: {
    total_revenue: number;
    standing_orders_active: number;
    conversion_rate: number;
    average_deal_value: number;
  };

  category_insights: {
    top_category: string | null;
    top_category_conversion_rate: number;
    recommendation: string;
  };

  mission_insights: {
    best_performing_mission: string | null;
    worst_performing_mission: string | null;
    recommendation: string;
  };

  ai_recommendations: {
    action_items: string[];
    watch_list: string[];
    opportunities: string[];
  };

  status: "ready" | "loading_data" | "insufficient_data";
  generated_at: string;
}

/**
 * Generate complete dashboard intelligence
 */
export async function generateDashboardIntelligence(
  sql: any
): Promise<DashboardIntelligence> {
  try {
    const [
      hotProspects,
      pendingFollowups,
      categoryInsights,
      highPerformers,
      underperformers,
    ] = await Promise.all([
      getLeadsByHeatScore(sql, 5), // Top 5 hottest
      getLeadsNeedingFollowUp(sql),
      getCategoryPerformanceInsights(sql),
      getHighPerformingMissions(sql),
      getUnderperformingMissions(sql),
    ]);

    // Get recent engagement
    const recentEvents = await sql`
      SELECT l.business_name, ee.event_type, ee.timestamp
      FROM b2b_email_events ee
      JOIN b2b_leads l ON ee.lead_id = l.id
      ORDER BY ee.timestamp DESC
      LIMIT 10
    `;

    // Get revenue metrics
    const revenueSummary = await sql`
      SELECT
        COUNT(*) as standing_orders,
        COALESCE(SUM(price), 0) as total_revenue,
        COALESCE(AVG(price), 0) as avg_price
      FROM b2b_standing_orders
      WHERE active = true
    `;

    // Get conversion rate
    const conversionMetrics = await sql`
      SELECT
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT so.lead_id) as converted_count
      FROM b2b_leads l
      LEFT JOIN b2b_standing_orders so ON l.id = so.lead_id
      WHERE l.status NOT IN ('dead')
    `;

    // Build hottest prospects list
    const hottestProspects = await Promise.all(
      hotProspects.map(async (item: any, index: number) => {
        const lead = await sql`
          SELECT business_name, engagement_score, last_engagement_at
          FROM b2b_leads
          WHERE id = ${item.lead_id}
          LIMIT 1
        `;

        if (lead.length === 0) return null;

        return {
          rank: index + 1,
          lead_id: item.lead_id,
          business_name: lead[0].business_name,
          heat_score: item.heat_score_breakdown.heat_score,
          engagement_score: lead[0].engagement_score || 0,
          last_activity: lead[0].last_engagement_at
            ? new Date(lead[0].last_engagement_at).toLocaleDateString()
            : "Never",
        };
      })
    );

    // Build pending followups list
    const followupsList = await Promise.all(
      pendingFollowups.slice(0, 5).map(async (item: any) => {
        const lead = await sql`
          SELECT business_name
          FROM b2b_leads
          WHERE id = ${item.lead_id}
          LIMIT 1
        `;

        if (lead.length === 0) return null;

        return {
          lead_id: item.lead_id,
          business_name: lead[0].business_name,
          followup_type: item.recommendation.followup_type || "standard",
          reasoning: item.recommendation.reasoning,
          days_since_contact: item.recommendation.days_since_last_email,
        };
      })
    );

    // Build AI recommendations
    const recommendations: string[] = [];
    const watchList: string[] = [];
    const opportunities: string[] = [];

    // Hot prospects
    if (hottestProspects.filter((p: any) => p).length > 0) {
      recommendations.push(
        `Contact ${hottestProspects.filter((p: any) => p)[0].business_name} today (heat score: ${hottestProspects.filter((p: any) => p)[0].heat_score})`
      );
    }

    // Follow-ups
    if (followupsList.filter((f: any) => f).length > 0) {
      recommendations.push(
        `${followupsList.filter((f: any) => f).length} prospects need follow-ups`
      );
    }

    // Category insights
    if (categoryInsights.summary.highest_converting_category) {
      opportunities.push(
        `Expand ${categoryInsights.summary.highest_converting_category} missions (${(categoryInsights.summary.overall_conversion_rate * 100).toFixed(1)}% conversion)`
      );
    }

    // Mission insights
    if (underperformers.length > 0) {
      watchList.push(
        `Monitor ${underperformers[0].niche} mission (ROI: ${underperformers[0].roi_percent.toFixed(0)}%)`
      );
    }

    if (highPerformers.length > 0) {
      opportunities.push(
        `Scale ${highPerformers[0].niche} mission (ROI: ${highPerformers[0].roi_percent.toFixed(0)}%)`
      );
    }

    // Revenue calculation
    const revData = revenueSummary[0] as any;
    const convData = conversionMetrics[0] as any;
    const conversionRate =
      convData.total_leads > 0
        ? convData.converted_count / convData.total_leads
        : 0;

    return {
      hottest_prospects: hottestProspects.filter((p: any) => p !== null),
      pending_followups: followupsList.filter((f: any) => f !== null),
      recent_engagement: recentEvents.map((e: any) => ({
        business_name: e.business_name,
        event_type: e.event_type,
        timestamp: new Date(e.timestamp).toLocaleString(),
      })),
      revenue_metrics: {
        total_revenue: parseFloat(revData.total_revenue || 0),
        standing_orders_active: revData.standing_orders || 0,
        conversion_rate: conversionRate,
        average_deal_value: parseFloat(revData.avg_price || 0),
      },
      category_insights: {
        top_category:
          categoryInsights.summary.highest_converting_category,
        top_category_conversion_rate:
          categoryInsights.summary.overall_conversion_rate,
        recommendation: categoryInsights.summary.recommendation,
      },
      mission_insights: {
        best_performing_mission: highPerformers[0]?.niche || null,
        worst_performing_mission: underperformers[0]?.niche || null,
        recommendation:
          highPerformers.length > 0 || underperformers.length > 0
            ? "Review mission performance analytics"
            : "Insufficient mission data yet",
      },
      ai_recommendations: {
        action_items: recommendations,
        watch_list: watchList,
        opportunities: opportunities,
      },
      status:
        hottestProspects.length > 0 ? "ready" : "insufficient_data",
      generated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[DASHBOARD-INTELLIGENCE] Error generating intelligence:", error);
    return {
      hottest_prospects: [],
      pending_followups: [],
      recent_engagement: [],
      revenue_metrics: {
        total_revenue: 0,
        standing_orders_active: 0,
        conversion_rate: 0,
        average_deal_value: 0,
      },
      category_insights: {
        top_category: null,
        top_category_conversion_rate: 0,
        recommendation: "Error loading insights",
      },
      mission_insights: {
        best_performing_mission: null,
        worst_performing_mission: null,
        recommendation: "Error loading insights",
      },
      ai_recommendations: {
        action_items: [],
        watch_list: [],
        opportunities: [],
      },
      status: "loading_data",
      generated_at: new Date().toISOString(),
    };
  }
}
