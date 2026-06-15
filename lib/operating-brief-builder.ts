/**
 * Operating Brief Builder
 *
 * Aggregates existing intelligence outputs into the five-section operating brief.
 * No new intelligence is created—only existing objects are displayed.
 */

/**
 * SECTION 1: GOOD MORNING
 *
 * Compressed intelligence requiring immediate operator action.
 * Originates from: Outcome Cases + Conversation tracking
 */
async function buildGoodMorning(sql: any): Promise<any[]> {
  try {
    const items: any[] = [];

    // Item 1: Total leads (fallback when no specifics)
    const totalLeads = await sql`
      SELECT COUNT(*)::integer as count FROM b2b_leads
    `;

    const total = totalLeads[0]?.count || 0;

    if (total > 0) {
      items.push({
        action: `${total} prospect${total !== 1 ? 's' : ''} in pipeline ready for attention`,
        source: "outcome_cases",
        severity: "medium"
      });
    }

    // Item 2: Leads with email sent
    const withEmail = await sql`
      SELECT COUNT(*)::integer as count FROM b2b_leads
      WHERE email_sent_at IS NOT NULL
    `;

    const emailCount = withEmail[0]?.count || 0;
    if (emailCount > 0) {
      items.push({
        action: `${emailCount} active conversation${emailCount !== 1 ? 's' : ''} in progress`,
        source: "conversation_intelligence",
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
        blocked_outcome
      FROM b2b_leads
      WHERE email_sent_at IS NOT NULL
      ORDER BY email_sent_at DESC
      LIMIT 12
    `;

    return conversations.map((lead: any) => ({
      id: lead.id,
      business_name: lead.business_name || "Unknown Business",
      category: lead.business_category || "Other",
      status: lead.status || "new",
      blocked_outcome: lead.blocked_outcome || "Outcome not yet identified",
      fit_score: lead.logistics_fit_score || 0,
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
        recurring_rate
      FROM pattern_records
      WHERE job_rate > 0
      ORDER BY job_rate DESC, recurring_rate DESC
      LIMIT 3
    `;

    if (!patterns || patterns.length === 0) {
      return [];
    }

    return patterns.map((pattern: any) => ({
      pattern_id: pattern.pattern_id,
      situation: `${pattern.operational_cause || pattern.logistics_friction || "Logistical constraint"} causing ${(pattern.blocked_outcome || "business delays").toLowerCase()}`,
      observed_result: `${(pattern.job_rate || 0).toFixed(0)}% became paying jobs across ${pattern.eligible_cases || 0} validated cases`,
      guidance: `Lead with discussion about ${(pattern.logistics_friction || pattern.operational_cause || "logistics").toLowerCase()}`,
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
        logistics_fit_score,
        email_sent_at
      FROM b2b_leads
      WHERE logistics_fit_score >= 75
      ORDER BY logistics_fit_score DESC, created_at DESC
      LIMIT 5
    `;

    if (!atRisk || atRisk.length === 0) {
      return [];
    }

    return atRisk.map((lead: any) => ({
      id: lead.id,
      business_name: lead.business_name || "Unknown",
      category: lead.business_category || "Other",
      blocked_outcome: lead.blocked_outcome || "Outcome unknown",
      fit_score: lead.logistics_fit_score || 0,
      status: lead.email_sent_at ? "contacted" : "not_contacted",
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
    // Total leads
    const totalResult = await sql`
      SELECT COUNT(*)::integer as total FROM b2b_leads
    `;

    const total = totalResult[0]?.total || 0;

    // Commercial fit (high qualification)
    const commercialResult = await sql`
      SELECT COUNT(*)::integer as commercial FROM b2b_leads
      WHERE logistics_fit_score IS NOT NULL AND logistics_fit_score >= 75
    `;

    const commercial = commercialResult[0]?.commercial || 0;

    // Qualified (any score assigned)
    const qualifiedResult = await sql`
      SELECT COUNT(*)::integer as qualified FROM b2b_leads
      WHERE logistics_fit_score IS NOT NULL
    `;

    const qualified = qualifiedResult[0]?.qualified || 0;

    return {
      total_leads: total,
      qualified_for_outreach: qualified,
      commercial_fit: commercial,
      conversations_active: 0,
      jobs_created: 0,
      discovery_sources: []
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

/**
 * Build entire operating brief
 */
export async function buildOperatingBrief(sql: any) {
  const [
    good_morning,
    todays_work,
    what_we_are_learning,
    revenue_at_risk,
    system_inputs
  ] = await Promise.all([
    buildGoodMorning(sql),
    buildTodaysWork(sql),
    buildWhatWeAreLearning(sql),
    buildRevenueAtRisk(sql),
    buildSystemInputs(sql)
  ]);

  return {
    good_morning,
    todays_work,
    what_we_are_learning,
    revenue_at_risk,
    system_inputs,
    generated_at: new Date().toISOString()
  };
}
