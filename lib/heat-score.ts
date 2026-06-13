import { neon } from "@neondatabase/serverless";

/**
 * Prospect Heat Score System
 *
 * Combines:
 * - Business Fit Score (from qualification, 0-40)
 * - Engagement Score (from email interactions, 0-40)
 * - Intent Signals (from behavior patterns, 0-20)
 * = Heat Score (0-100)
 *
 * Used for: Ranking prospects, deciding follow-up strategy
 * NOT USED YET: Behind feature flag
 */

export interface HeatScoreBreakdown {
  business_fit_score: number;
  engagement_score: number;
  intent_signals_score: number;
  heat_score: number;
  heat_level: "hot" | "warm" | "cool" | "cold";
  priority_rank: number;
}

/**
 * Get business fit score from qualification
 * Uses: opportunity_score from qualified_businesses table
 * Range: 0-40
 */
export async function getBusinessFitScore(
  sql: any,
  leadId: string
): Promise<number> {
  try {
    const lead = await sql`
      SELECT opportunity_score
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `;

    if (!lead || lead.length === 0) return 0;

    const opportunityScore = lead[0].opportunity_score as number | null;
    if (!opportunityScore) return 0;

    // Map 0-100 opportunity score to 0-40 business fit score
    return Math.min(40, Math.round(opportunityScore * 0.4));
  } catch (error) {
    console.error("[HEAT-SCORE] Error calculating business fit:", error);
    return 0;
  }
}

/**
 * Get engagement score
 * Uses: engagement_score from b2b_leads (already calculated by engagement tracking)
 * Range: 0-40
 */
export async function getEngagementScore(
  sql: any,
  leadId: string
): Promise<number> {
  try {
    const lead = await sql`
      SELECT engagement_score
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `;

    if (!lead || lead.length === 0) return 0;

    const engagementScore = lead[0].engagement_score as number | null;
    if (!engagementScore) return 0;

    // Map 0-100 engagement score to 0-40 heat score range
    return Math.min(40, Math.round(engagementScore * 0.4));
  } catch (error) {
    console.error("[HEAT-SCORE] Error getting engagement score:", error);
    return 0;
  }
}

/**
 * Calculate intent signals
 * Based on: Opens count, clicks count, reply status, time patterns
 * Range: 0-20
 */
export async function getIntentSignalsScore(
  sql: any,
  leadId: string
): Promise<number> {
  try {
    const events = await sql`
      SELECT event_type, timestamp
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    const outreach = await sql`
      SELECT replied, replied_at, sent_at
      FROM b2b_outreach
      WHERE lead_id = ${leadId}
      ORDER BY sent_at DESC
      LIMIT 1
    `;

    let intentScore = 0;

    // Count opens in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOpens = events.filter(
      (e: any) => e.event_type === "opened" && new Date(e.timestamp) > sevenDaysAgo
    ).length;

    // Multiple opens = high intent (+10)
    if (recentOpens >= 3) intentScore += 10;
    else if (recentOpens >= 1) intentScore += 5;

    // Click = strong intent (+5)
    const hasClick = events.some((e: any) => e.event_type === "clicked");
    if (hasClick) intentScore += 5;

    // Reply = confirmed intent (+5)
    if (outreach.length > 0 && outreach[0].replied) intentScore += 5;

    // Quick reply (within 24 hours) = high urgency (+5)
    if (outreach.length > 0 && outreach[0].replied_at) {
      const sentAt = new Date(outreach[0].sent_at).getTime();
      const repliedAt = new Date(outreach[0].replied_at).getTime();
      const replyTimeMs = repliedAt - sentAt;
      const replyTimeHours = replyTimeMs / (1000 * 60 * 60);

      if (replyTimeHours < 24) intentScore += 5;
    }

    return Math.min(20, intentScore);
  } catch (error) {
    console.error("[HEAT-SCORE] Error calculating intent signals:", error);
    return 0;
  }
}

/**
 * Calculate complete heat score
 */
export async function calculateHeatScore(
  sql: any,
  leadId: string
): Promise<HeatScoreBreakdown> {
  try {
    const businessFit = await getBusinessFitScore(sql, leadId);
    const engagement = await getEngagementScore(sql, leadId);
    const intent = await getIntentSignalsScore(sql, leadId);

    const heatScore = businessFit + engagement + intent;

    const heatLevel: "hot" | "warm" | "cool" | "cold" =
      heatScore >= 75
        ? "hot"
        : heatScore >= 50
          ? "warm"
          : heatScore >= 25
            ? "cool"
            : "cold";

    return {
      business_fit_score: businessFit,
      engagement_score: engagement,
      intent_signals_score: intent,
      heat_score: heatScore,
      heat_level: heatLevel,
      priority_rank: 0, // Set by query ranking
    };
  } catch (error) {
    console.error("[HEAT-SCORE] Error calculating heat score:", error);
    return {
      business_fit_score: 0,
      engagement_score: 0,
      intent_signals_score: 0,
      heat_score: 0,
      heat_level: "cold",
      priority_rank: 0,
    };
  }
}

/**
 * Get leads ranked by heat score
 * Used for: Dashboard "hottest prospects" display
 */
export async function getLeadsByHeatScore(
  sql: any,
  limit: number = 10
): Promise<Array<{ lead_id: string; heat_score_breakdown: HeatScoreBreakdown }>> {
  try {
    // Get all active leads
    const leads = await sql`
      SELECT id
      FROM b2b_leads
      WHERE status NOT IN ('closed', 'dead')
      LIMIT 100
    `;

    // Calculate heat score for each
    const leadsWithScores = await Promise.all(
      leads.map(async (lead: any) => ({
        lead_id: lead.id,
        heat_score_breakdown: await calculateHeatScore(sql, lead.id),
      }))
    );

    // Sort by heat score, return top N
    return leadsWithScores
      .sort((a, b) => b.heat_score_breakdown.heat_score - a.heat_score_breakdown.heat_score)
      .slice(0, limit);
  } catch (error) {
    console.error("[HEAT-SCORE] Error ranking leads by heat score:", error);
    return [];
  }
}
