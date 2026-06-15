import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

/**
 * Operating Brief API
 *
 * Aggregates existing intelligence outputs into a single brief.
 *
 * NO new intelligence is created.
 * All data originates from existing objects:
 * - Outcome Cases
 * - Conversations
 * - Pattern Records
 * - Discovery Sources
 *
 * GET /api/b2b/operating-brief
 *
 * Response structure:
 * {
 *   good_morning: [...],           // Compressed intelligence for immediate action
 *   todays_work: [...],            // Active conversations sorted by urgency
 *   what_we_are_learning: [...],   // Pattern insights (max 3)
 *   revenue_at_risk: [...],        // Outcome Cases with fit_score >= 75
 *   system_inputs: {...}           // Discovery pipeline health
 * }
 */

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // 1. GOOD MORNING — Compressed Actionable Intelligence
    const goodMorning = await buildGoodMorning(sql);

    // 2. TODAY'S WORK — Active Conversations by Urgency
    const todaysWork = await buildTodaysWork(sql);

    // 3. WHAT WE ARE LEARNING — Pattern Intelligence (max 3)
    const whatWeAreLearning = await buildWhatWeAreLearning(sql);

    // 4. REVENUE AT RISK — Outcome Cases with Fit Score >= 75
    const revenueAtRisk = await buildRevenueAtRisk(sql);

    // 5. SYSTEM INPUTS — Discovery Pipeline Health
    const systemInputs = await buildSystemInputs(sql);

    return NextResponse.json({
      good_morning: goodMorning,
      todays_work: todaysWork,
      what_we_are_learning: whatWeAreLearning,
      revenue_at_risk: revenueAtRisk,
      system_inputs: systemInputs,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Operating Brief API]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    );
  }
}

/**
 * SECTION 1: GOOD MORNING
 *
 * Compressed intelligence requiring immediate operator action.
 * Originates from: Outcome Cases + Conversation tracking
 */
async function buildGoodMorning(sql: any): Promise<any[]> {
  try {
    const items: any[] = [];

    // Item 1: Outcome Cases needing qualification
    const needsQualification = await sql`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE logistics_fit_score IS NULL
      AND created_at > NOW() - INTERVAL '24 hours'
    `;

    if (needsQualification[0]?.count > 0) {
      items.push({
        action: `${needsQualification[0].count} new prospect${needsQualification[0].count !== 1 ? 's' : ''} require qualification`,
        source: "outcome_cases",
        severity: "medium"
      });
    }

    // Item 2: Conversations awaiting follow-up (5+ days)
    const stalled = await sql`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE email_sent_at IS NOT NULL
      AND (status = 'new' OR status = 'warm')
      AND email_sent_at < NOW() - INTERVAL '5 days'
    `;

    if (stalled[0]?.count > 0) {
      items.push({
        action: `${stalled[0].count} conversation${stalled[0].count !== 1 ? 's' : ''} stalled for 5+ days`,
        source: "conversation_intelligence",
        severity: "high"
      });
    }

    // Item 3: High-fit opportunities ready for commercial action
    const highFit = await sql`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE logistics_fit_score >= 75
      AND conversation_started = false
    `;

    if (highFit[0]?.count > 0) {
      items.push({
        action: `${highFit[0].count} validated opportunity${highFit[0].count !== 1 ? 'ies' : ''} ready for outreach`,
        source: "validation_intelligence",
        severity: "high"
      });
    }

    return items;
  } catch (error) {
    console.error("[Good Morning] Error:", error);
    return [];
  }
}

/**
 * SECTION 2: TODAY'S WORK
 *
 * Active conversations sorted by urgency.
 * Originates from: Conversation Intelligence + Outcome Cases
 */
async function buildTodaysWork(sql: any): Promise<any[]> {
  try {
    const conversations = await sql`
      SELECT
        id,
        business_name,
        business_category,
        email_sent_at,
        status,
        logistics_fit_score,
        blocked_outcome,
        relationship_state,
        days_since_contact
      FROM b2b_leads
      WHERE email_sent_at IS NOT NULL
      ORDER BY
        CASE
          WHEN status = 'engaged' THEN 1
          WHEN status = 'warm' THEN 2
          WHEN status = 'new' AND email_sent_at < NOW() - INTERVAL '3 days' THEN 3
          ELSE 4
        END,
        email_sent_at DESC
      LIMIT 12
    `;

    return conversations.map((lead: any) => ({
      id: lead.id,
      business_name: lead.business_name,
      category: lead.business_category,
      status: lead.status,
      blocked_outcome: lead.blocked_outcome,
      fit_score: lead.logistics_fit_score,
      urgency: calculateUrgency(lead.status, lead.email_sent_at),
      source: "conversation_intelligence"
    }));
  } catch (error) {
    console.error("[Today's Work] Error:", error);
    return [];
  }
}

/**
 * SECTION 3: WHAT WE ARE LEARNING
 *
 * Pattern Intelligence — top performing patterns.
 * Originates from: Pattern Records
 * Maximum 3 items.
 */
async function buildWhatWeAreLearning(sql: any): Promise<any[]> {
  try {
    const patterns = await sql`
      SELECT
        pattern_id,
        blocked_outcome,
        operational_cause,
        logistics_friction,
        eligible_cases,
        job_rate,
        recurring_rate,
        conversation_rate
      FROM pattern_records
      ORDER BY job_rate DESC, recurring_rate DESC
      LIMIT 3
    `;

    return patterns.map((pattern: any) => ({
      pattern_id: pattern.pattern_id,
      situation: `${pattern.operational_cause || pattern.logistics_friction} causing ${pattern.blocked_outcome.toLowerCase()}`,
      observed_result: `${pattern.job_rate.toFixed(0)}% became paying jobs across ${pattern.eligible_cases} validated cases`,
      guidance: `Lead with discussion about ${(pattern.logistics_friction || pattern.operational_cause).toLowerCase()}`,
      source: "pattern_records"
    }));
  } catch (error) {
    console.error("[What We Are Learning] Error:", error);
    return [];
  }
}

/**
 * SECTION 4: REVENUE AT RISK
 *
 * Outcome Cases with Logistics Fit Score >= 75 (Commercial Fit threshold).
 * Not yet converted to revenue.
 * Originates from: Outcome Cases
 * Maximum 5 items.
 */
async function buildRevenueAtRisk(sql: any): Promise<any[]> {
  try {
    const atRisk = await sql`
      SELECT
        id,
        business_name,
        business_category,
        blocked_outcome,
        operational_cause,
        logistics_friction,
        logistics_fit_score,
        email_sent_at,
        conversation_started,
        job_created
      FROM b2b_leads
      WHERE logistics_fit_score >= 75
      AND job_created = false
      ORDER BY logistics_fit_score DESC, created_at DESC
      LIMIT 5
    `;

    return atRisk.map((lead: any) => ({
      id: lead.id,
      business_name: lead.business_name,
      category: lead.business_category,
      blocked_outcome: lead.blocked_outcome,
      fit_score: lead.logistics_fit_score,
      status: !lead.conversation_started ? "not_contacted" : "contacted",
      source: "outcome_cases"
    }));
  } catch (error) {
    console.error("[Revenue At Risk] Error:", error);
    return [];
  }
}

/**
 * SECTION 5: SYSTEM INPUTS
 *
 * Discovery pipeline health metrics.
 * Originates from: Discovery Sources + Lead counts
 */
async function buildSystemInputs(sql: any): Promise<any> {
  try {
    // Total leads by status
    const statusCounts = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE logistics_fit_score IS NULL) as unqualified,
        COUNT(*) FILTER (WHERE logistics_fit_score >= 60 AND logistics_fit_score < 75) as validated,
        COUNT(*) FILTER (WHERE logistics_fit_score >= 75) as commercial,
        COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL) as contacted,
        COUNT(*) FILTER (WHERE conversation_started = true) as conversations,
        COUNT(*) FILTER (WHERE job_created = true) as jobs
      FROM b2b_leads
    `;

    // Discovery sources activity
    const sources = await sql`
      SELECT
        source_type,
        COUNT(*) as count
      FROM b2b_leads
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY source_type
      ORDER BY count DESC
    `;

    const status = statusCounts[0] || {
      total: 0,
      unqualified: 0,
      validated: 0,
      commercial: 0,
      contacted: 0,
      conversations: 0,
      jobs: 0
    };

    return {
      total_leads: status.total,
      qualified_for_outreach: status.validated + status.commercial,
      commercial_fit: status.commercial,
      conversations_active: status.conversations,
      jobs_created: status.jobs,
      discovery_sources: sources.map((s: any) => ({
        type: s.source_type,
        count_7_days: s.count
      }))
    };
  } catch (error) {
    console.error("[System Inputs] Error:", error);
    return {
      total_leads: 0,
      qualified_for_outreach: 0,
      commercial_fit: 0,
      conversations_active: 0,
      jobs_created: 0,
      discovery_sources: []
    };
  }
}

/**
 * Helper: Calculate urgency from conversation state
 */
function calculateUrgency(status: string, emailSentAt: string | null): string {
  if (status === "engaged") return "high";
  if (status === "warm" && emailSentAt) {
    const daysSinceSent = Math.floor((Date.now() - new Date(emailSentAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceSent >= 3) return "high";
    if (daysSinceSent >= 1) return "medium";
  }
  return "low";
}
