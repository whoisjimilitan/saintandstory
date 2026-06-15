/**
 * Pattern Insights
 *
 * Transforms VERIFIED patterns into actionable operator guidance.
 *
 * CRITICAL RULE:
 * Only VERIFIED patterns generate insights.
 * Rejected patterns generate nothing.
 * Unverified patterns generate nothing.
 *
 * Insight Structure:
 * - Situation: What's happening
 * - Observed Result: What we learned (job rate, etc.)
 * - Operator Guidance: What to do
 */

export interface PatternInsight {
  pattern_id: string;
  situation: string;
  observed_result: string;
  operator_guidance: string;
  generated_at: string;
}

/**
 * Generate insight from a verified pattern
 *
 * Input: Verified PatternRecord
 * Output: Actionable PatternInsight
 */
export function generateInsightFromPattern(pattern: any): PatternInsight | null {
  // Only generate insights from VERIFIED patterns
  if (pattern.status !== 'verified') {
    return null;
  }

  // Build situation description
  const situation = buildSituation(
    pattern.blocked_outcome,
    pattern.operational_cause,
    pattern.logistics_friction
  );

  // Build observed result
  const observed_result = buildObservedResult(pattern);

  // Build operator guidance
  const operator_guidance = buildOperatorGuidance(
    pattern.blocked_outcome,
    pattern.operational_cause,
    pattern.logistics_friction,
    pattern.job_rate,
    pattern.recurring_rate
  );

  return {
    pattern_id: pattern.pattern_id,
    situation,
    observed_result,
    operator_guidance,
    generated_at: new Date().toISOString()
  };
}

/**
 * Build situation description from pattern components
 */
function buildSituation(
  blockedOutcome: string,
  operationalCause: string,
  logisticsFriction: string
): string {
  if (operationalCause) {
    return `${operationalCause} causing ${blockedOutcome.toLowerCase()}`;
  }
  return `${logisticsFriction} causing ${blockedOutcome.toLowerCase()}`;
}

/**
 * Build observed result from pattern metrics
 */
function buildObservedResult(pattern: any): string {
  // Use job rate as primary metric, with supporting metrics
  const jobRate = pattern.job_rate || 0;
  const recurringRate = pattern.recurring_rate || 0;
  const conversationRate = pattern.conversation_rate || 0;
  const cases = pattern.eligible_cases || 0;

  if (jobRate >= 15) {
    const recurringNote = recurringRate >= 5 ? ` with ${recurringRate.toFixed(0)}% becoming recurring work` : '';
    return `${jobRate.toFixed(0)}% became paying jobs across ${cases} validated cases${recurringNote}`;
  }

  if (conversationRate >= 40) {
    return `${conversationRate.toFixed(0)}% started conversations and ${jobRate.toFixed(0)}% became jobs across ${cases} validated cases`;
  }

  return `${conversationRate.toFixed(0)}% initiated conversations across ${cases} validated cases`;
}

/**
 * Build operator guidance based on pattern performance
 */
function buildOperatorGuidance(
  blockedOutcome: string,
  operationalCause: string,
  logisticsFriction: string,
  jobRate: number,
  recurringRate: number
): string {
  const friction = logisticsFriction || operationalCause || blockedOutcome;

  // High job conversion = strong signal
  if (jobRate >= 15) {
    return `Lead with discussion about ${friction.toLowerCase()}. This friction repeatedly converts to paying work.`;
  }

  // Moderate conversion = worth exploring
  if (jobRate >= 5) {
    return `Probe for ${friction.toLowerCase()} issues. When present, these convert at meaningful rates.`;
  }

  // Lower conversion but strong conversation rate = validation signal
  return `Acknowledge ${friction.toLowerCase()} when discovered. This resonates with prospects.`;
}

/**
 * Get insights for a specific situation (for Conversation Intelligence)
 *
 * Finds verified patterns that match the outcome case
 */
export async function getInsightsForOutcomeCase(
  sql: any,
  blockedOutcome: string,
  operationalCause?: string,
  logisticsFriction?: string
): Promise<PatternInsight[]> {
  try {
    // Find matching VERIFIED patterns
    let query = sql`
      SELECT * FROM pattern_records
      WHERE status = 'verified'
      AND blocked_outcome = ${blockedOutcome}
    `;

    if (operationalCause) {
      query = sql`
        SELECT * FROM pattern_records
        WHERE status = 'verified'
        AND blocked_outcome = ${blockedOutcome}
        AND operational_cause = ${operationalCause}
      `;
    }

    if (logisticsFriction) {
      query = sql`
        SELECT * FROM pattern_records
        WHERE status = 'verified'
        AND blocked_outcome = ${blockedOutcome}
        AND logistics_friction = ${logisticsFriction}
      `;
    }

    const patterns = (await query) as Array<any>;

    // Convert to insights
    const insights = patterns
      .map(p => generateInsightFromPattern(p))
      .filter(i => i !== null) as PatternInsight[];

    // Return top 3 by relevance
    return insights.slice(0, 3);
  } catch (error) {
    console.error("[Pattern Insights] Error fetching insights:", error);
    return [];
  }
}

/**
 * Get learning insights for Morning Brief
 *
 * Only VERIFIED patterns
 * Maximum 3 items
 */
export async function getLearningInsightsForBrief(sql: any): Promise<PatternInsight[]> {
  try {
    // Get top performing VERIFIED patterns
    const patterns = (await sql`
      SELECT * FROM pattern_records
      WHERE status = 'verified'
      ORDER BY job_rate DESC, recurring_rate DESC
      LIMIT 3
    `) as Array<any>;

    // Convert to insights
    return patterns
      .map(p => generateInsightFromPattern(p))
      .filter(i => i !== null) as PatternInsight[];
  } catch (error) {
    console.error("[Pattern Insights] Error fetching brief insights:", error);
    return [];
  }
}

/**
 * Check if outcome case matches any verified pattern
 */
export async function findMatchingVerifiedPattern(
  sql: any,
  blockedOutcome: string,
  operationalCause?: string,
  logisticsFriction?: string
): Promise<PatternInsight | null> {
  try {
    // Find EXACT match VERIFIED pattern
    const patterns = (await sql`
      SELECT * FROM pattern_records
      WHERE status = 'verified'
      AND blocked_outcome = ${blockedOutcome}
      AND operational_cause = ${operationalCause || ''}
      AND logistics_friction = ${logisticsFriction || ''}
      LIMIT 1
    `) as Array<any>;

    if (patterns.length === 0) {
      return null;
    }

    return generateInsightFromPattern(patterns[0]);
  } catch (error) {
    console.error("[Pattern Insights] Error finding matching pattern:", error);
    return null;
  }
}
