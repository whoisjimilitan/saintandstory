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

export type ValidationStatus = 'ignore' | 'emerging' | 'strong' | 'confirmed';

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

  // Status based on score
  validation_status: ValidationStatus;

  // Decision gate
  ready_for_learning: boolean; // logistics_fit_score >= 60

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
 * Determine validation status from score
 */
export function getValidationStatus(score: number): ValidationStatus {
  if (score < 21) return 'ignore';
  if (score < 61) return 'emerging';
  if (score < 81) return 'strong';
  return 'confirmed';
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

    const validation_status = getValidationStatus(logistics_fit_score);
    const ready_for_learning = logistics_fit_score >= 60;

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
      validation_status,
      ready_for_learning,
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
  if (score < 21) {
    return 'Ignore. No engagement signal.';
  }
  if (score < 41) {
    return 'Monitor. Weak signal. Ask clarifying questions.';
  }
  if (score < 61) {
    return 'Investigate. May be logistics relevant. Confirm on call.';
  }
  if (score < 81) {
    return 'Engage. Clear logistics relevance. Propose solution.';
  }
  return 'Prioritise. Strong opportunity. Fast-track.';
}

/**
 * Check if ready for learning systems
 */
export function isReadyForLearning(validation: ValidationIntelligence): boolean {
  return validation.ready_for_learning;
}
