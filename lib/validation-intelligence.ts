/**
 * Validation Intelligence
 *
 * ONE unified scoring system:
 * LOGISTICS FIT SCORE (0–100)
 *
 * CRITICAL NON-NEGOTIABLE
 * ═════════════════════════
 *
 * This score is NOT:
 * ❌ Predictive (does not estimate conversion probability)
 * ❌ Revenue-focused (does not estimate deal value)
 * ❌ Engagement-focused (does not measure response likelihood)
 * ❌ A lead scoring model (not a CRM propensity score)
 *
 * This score IS:
 * ✅ An operator prioritization tool
 * ✅ A "Can we genuinely help?" score
 * ✅ A decision filter: "Should we spend time on this?"
 *
 * WHAT IT MEASURES
 * ═════════════════
 *
 * Primary drivers (outcome-focused):
 * 1. Blocked business outcome plausibility
 * 2. Likelihood logistics contributes to the blockage
 * 3. Likelihood Saint & Story can realistically remove the blockage
 *
 * Supporting evidence (engagement signals):
 * - Opens, clicks, replies, meetings, customer conversion
 *
 * CRITICAL: The score is NOT an engagement score.
 * Heavy engagement with a non-logistics-solvable problem = low score.
 * Weak engagement with clear logistics friction = meaningful score.
 *
 * WHAT COMES NEXT
 * ═════════════════
 *
 * Pattern Intelligence does the learning, not this score.
 * Pattern Intelligence learns:
 * - Which blocked outcomes create conversations
 * - Which operational causes matter
 * - Which logistics frictions repeat
 *
 * This score is the INPUT to Pattern Intelligence.
 * Not the output.
 *
 * Only cases with score ≥ 60 enter Pattern Intelligence.
 * Only cases with score ≥ 75 enter Commercial Intelligence.
 */

export type FitLevel = 'low-fit' | 'validated-fit' | 'commercial-fit';

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

  // Fit level based on thresholds
  fit_level: FitLevel;
  // 0-59: low-fit
  // 60-74: validated-fit
  // 75-100: commercial-fit

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
 * Determine fit level from score
 *
 * 0-59: Low fit
 * 60-74: Validated fit (eligible for Pattern Intelligence)
 * 75-100: Commercial fit (eligible for Commercial Intelligence)
 */
export function getFitLevel(score: number): FitLevel {
  if (score < 60) return 'low-fit';
  if (score < 75) return 'validated-fit';
  return 'commercial-fit';
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

    const fit_level = getFitLevel(logistics_fit_score);

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
      fit_level,
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
    return 'Monitor. Insufficient logistics fit.';
  }
  if (score < 75) {
    return 'Learn. Case has validated logistics fit.';
  }
  return 'Prioritise. Case has commercial logistics fit.';
}
