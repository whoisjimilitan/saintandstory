/**
 * Validation Intelligence
 *
 * ONE unified scoring system:
 * LOGISTICS FIT SCORE (0–100)
 *
 * Measures: How strongly this case indicates a real, logistics-solvable
 * blocked outcome that Saint & Story can fix.
 *
 * All signals feed into ONE score.
 * No sub-layers. No problem/solution split.
 *
 * Only cases with score ≥ 60 enter Pattern/Commercial/Learning Intelligence.
 */

export type ActionTier = 'ignore' | 'monitor' | 'learn' | 'act';

export interface ValidationIntelligence {
  // Outcome Case reference
  lead_id: string;
  business_name: string;
  industry: string;
  desired_outcome: string;
  blocked_outcome: string;
  operational_cause?: string;

  // THE ONLY SCORE
  logistics_fit_score: number; // 0-100

  // Action tier based on thresholds
  action_tier: ActionTier;
  // 0-59: ignore/monitor
  // 60-74: learn
  // 75-100: act

  // Recommended action (single only)
  recommended_action: string;

  // Metadata
  generated_at: string;
}

/**
 * Calculate Logistics Fit Score (0-100)
 *
 * Scoring rules:
 * 0–20   = No meaningful engagement (ignore)
 * 21–40  = Weak interest (uncertain relevance)
 * 41–60  = Possible logistics relevance
 * 61–80  = Strong logistics relevance (engage)
 * 81–100 = Confirmed logistics opportunity (prioritise)
 *
 * All signals combine into one score.
 */
export function calculateLogisticsFitScore(signals: {
  opened_count: number;
  clicked_count: number;
  replied: boolean;
  confirmed_issue: boolean;
  booked_call: boolean;
  became_customer: boolean;
}): number {
  let score = 0;

  // No opens = no signal
  if (signals.opened_count === 0) {
    return 0;
  }

  // Base: They read it
  score = 20;

  // Clicks: Showed specific interest
  if (signals.clicked_count > 0) {
    score = 40;
  }

  // Multiple clicks: Strong engagement
  if (signals.clicked_count >= 2) {
    score = 50;
  }

  // Reply: Serious engagement
  if (signals.replied) {
    score = 65;
  }

  // Confirmed in reply: They validated the issue
  if (signals.confirmed_issue) {
    score = 80;
  }

  // Call booked: Ready to discuss
  if (signals.booked_call) {
    score = Math.max(score, 70);
  }

  // Became customer: Proved it works
  if (signals.became_customer) {
    score = 100;
  }

  return Math.min(score, 100);
}

/**
 * Determine action tier from score
 *
 * 0-59: Ignore or monitor
 * 60-74: Learn from (eligible for Pattern Intelligence)
 * 75-100: Act on commercially
 */
export function getActionTier(score: number): ActionTier {
  if (score < 60) return 'ignore';
  if (score < 75) return 'learn';
  return 'act';
}

/**
 * Generate Validation Intelligence for an Outcome Case
 */
export async function generateValidationIntelligence(
  sql: any,
  leadId: string,
  businessName: string,
  industry: string,
  desiredOutcome: string,
  blockedOutcome: string,
  operationalCause?: string
): Promise<ValidationIntelligence | null> {
  try {
    // Get lead data
    const leadResult = (await sql`
      SELECT
        id,
        email_opened_count,
        email_clicked_count,
        replied
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `) as Array<any>;

    if (leadResult.length === 0) {
      return null;
    }

    const lead = leadResult[0];

    // Calculate score from available signals
    const logistics_fit_score = calculateLogisticsFitScore({
      opened_count: lead.email_opened_count || 0,
      clicked_count: lead.email_clicked_count || 0,
      replied: lead.replied || false,
      confirmed_issue: false, // TODO: NLP on reply text
      booked_call: false, // TODO: query calendar
      became_customer: false // TODO: query jobs
    });

    const action_tier = getActionTier(logistics_fit_score);

    // Recommended action based on score
    const recommended_action = getRecommendedAction(logistics_fit_score);

    return {
      lead_id: leadId,
      business_name: businessName,
      industry,
      desired_outcome: desiredOutcome,
      blocked_outcome: blockedOutcome,
      operational_cause: operationalCause,
      logistics_fit_score,
      action_tier,
      recommended_action,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("[Validation Intelligence] Error:", error);
    return null;
  }
}

/**
 * Get recommended action based on Logistics Fit Score
 */
function getRecommendedAction(score: number): string {
  if (score < 60) {
    return 'Monitor. Not yet actionable.';
  }
  if (score < 75) {
    return 'Learn from this case. Eligible for pattern analysis.';
  }
  return 'Act commercially. Engage and propose solution.';
}
