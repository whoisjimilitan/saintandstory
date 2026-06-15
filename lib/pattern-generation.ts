/**
 * Pattern Generation Engine
 *
 * Transforms validated Outcome Cases into PatternRecords.
 *
 * CRITICAL RULE:
 * Only processes Outcome Cases with Logistics Fit Score >= 60
 *
 * Groups by:
 * - blocked_outcome
 * - operational_cause
 * - logistics_friction
 *
 * Calculates:
 * - Conversation rate
 * - Meeting rate
 * - Job rate
 * - Recurring revenue rate
 *
 * Does NOT:
 * - Predict
 * - Estimate confidence
 * - Calculate propensity
 * - Create new scores
 */

export interface OutcomeCaseWithResults {
  id: string;
  business_name: string;
  industry: string;
  desired_outcome: string;
  blocked_outcome: string;
  operational_cause?: string;
  logistics_friction: string;
  logistics_fit_score: number;
  fit_level: string;

  // Results (what actually happened)
  conversation_started: boolean;
  meeting_booked: boolean;
  job_created: boolean;
  recurring_work: boolean;
}

/**
 * Generate patterns from validated Outcome Cases
 *
 * Process:
 * 1. Query all Outcome Cases with Logistics Fit Score >= 60
 * 2. Group by (blocked_outcome, operational_cause, logistics_friction)
 * 3. For each group, calculate metrics
 * 4. Update or create PatternRecords
 */
export async function generatePatternsFromOutcomeCases(
  sql: any
): Promise<{ patterns_generated: number; patterns_updated: number }> {
  // Step 1: Get all validated outcome cases (Logistics Fit Score >= 60)
  const validatedCases = (await sql`
    SELECT
      lead_id as id,
      business_name,
      business_category as industry,
      desired_outcome,
      blocked_outcome,
      operational_cause,
      logistics_friction,
      logistics_fit_score,
      fit_level,
      COALESCE(conversation_started, false) as conversation_started,
      COALESCE(meeting_booked, false) as meeting_booked,
      COALESCE(job_created, false) as job_created,
      COALESCE(recurring_work, false) as recurring_work
    FROM b2b_leads
    WHERE logistics_fit_score >= 60
    AND outcome_case_id IS NOT NULL
  `) as OutcomeCaseWithResults[];

  if (validatedCases.length === 0) {
    return { patterns_generated: 0, patterns_updated: 0 };
  }

  // Step 2: Group by pattern key
  const patternGroups = new Map<string, OutcomeCaseWithResults[]>();

  for (const outcomeCase of validatedCases) {
    // Only group if we have all three components
    if (!outcomeCase.blocked_outcome || !outcomeCase.logistics_friction) {
      continue;
    }

    const patternKey = createPatternKey(
      outcomeCase.blocked_outcome,
      outcomeCase.operational_cause || '',
      outcomeCase.logistics_friction
    );

    if (!patternGroups.has(patternKey)) {
      patternGroups.set(patternKey, []);
    }

    patternGroups.get(patternKey)!.push(outcomeCase);
  }

  // Step 3: Create or update PatternRecords
  let patternsGenerated = 0;
  let patternsUpdated = 0;

  for (const [patternKey, cases] of patternGroups) {
    const { blockedOutcome, operationalCause, logisticsFriction } = parsePatternKey(patternKey);

    // Get or create pattern
    const pattern = await getOrCreatePattern(
      sql,
      blockedOutcome,
      operationalCause,
      logisticsFriction
    );

    // Reset and recalculate from all cases in this group
    const metrics = calculateMetrics(cases);

    // Update pattern with new metrics
    const updated = (await sql`
      UPDATE pattern_records
      SET
        eligible_cases = ${metrics.eligible_cases},
        conversation_count = ${metrics.conversation_count},
        meeting_count = ${metrics.meeting_count},
        job_count = ${metrics.job_count},
        recurring_count = ${metrics.recurring_count},
        conversation_rate = ${metrics.conversation_rate},
        meeting_rate = ${metrics.meeting_rate},
        job_rate = ${metrics.job_rate},
        recurring_rate = ${metrics.recurring_rate},
        last_seen = NOW(),
        last_updated = NOW(),
        updated_at = NOW()
      WHERE pattern_id = ${pattern.pattern_id}
      RETURNING id
    `) as Array<{ id: string }>;

    if (updated.length > 0) {
      patternsUpdated += 1;
    }

    // If this is a new pattern with cases, count as generated
    if (pattern.eligible_cases === 0 && metrics.eligible_cases > 0) {
      patternsGenerated += 1;
    }
  }

  return {
    patterns_generated: patternsGenerated,
    patterns_updated: patternsUpdated
  };
}

/**
 * Calculate metrics for a group of outcome cases
 */
function calculateMetrics(cases: OutcomeCaseWithResults[]) {
  const eligible_cases = cases.length;

  let conversation_count = 0;
  let meeting_count = 0;
  let job_count = 0;
  let recurring_count = 0;

  for (const outcomeCase of cases) {
    if (outcomeCase.conversation_started) conversation_count += 1;
    if (outcomeCase.meeting_booked) meeting_count += 1;
    if (outcomeCase.job_created) job_count += 1;
    if (outcomeCase.recurring_work) recurring_count += 1;
  }

  // Calculate rates (0-100)
  const conversation_rate = eligible_cases > 0 ? (conversation_count / eligible_cases) * 100 : 0;
  const meeting_rate = eligible_cases > 0 ? (meeting_count / eligible_cases) * 100 : 0;
  const job_rate = eligible_cases > 0 ? (job_count / eligible_cases) * 100 : 0;
  const recurring_rate = eligible_cases > 0 ? (recurring_count / eligible_cases) * 100 : 0;

  return {
    eligible_cases,
    conversation_count,
    meeting_count,
    job_count,
    recurring_count,
    conversation_rate: parseFloat(conversation_rate.toFixed(2)),
    meeting_rate: parseFloat(meeting_rate.toFixed(2)),
    job_rate: parseFloat(job_rate.toFixed(2)),
    recurring_rate: parseFloat(recurring_rate.toFixed(2))
  };
}

/**
 * Create pattern key from components
 */
function createPatternKey(blockedOutcome: string, operationalCause: string, logisticsFriction: string): string {
  return `${blockedOutcome}|${operationalCause}|${logisticsFriction}`;
}

/**
 * Parse pattern key back into components
 */
function parsePatternKey(key: string): {
  blockedOutcome: string;
  operationalCause: string;
  logisticsFriction: string;
} {
  const parts = key.split('|');
  return {
    blockedOutcome: parts[0],
    operationalCause: parts[1],
    logisticsFriction: parts[2]
  };
}

/**
 * Get or create pattern (copied from pattern-intelligence.ts)
 */
async function getOrCreatePattern(
  sql: any,
  blockedOutcome: string,
  operationalCause: string,
  logisticsFriction: string
) {
  const patternId = `${blockedOutcome}|${operationalCause}|${logisticsFriction}`;

  const existing = (await sql`
    SELECT * FROM pattern_records
    WHERE pattern_id = ${patternId}
    LIMIT 1
  `) as Array<any>;

  if (existing.length > 0) {
    return existing[0];
  }

  const created = (await sql`
    INSERT INTO pattern_records (
      pattern_id,
      blocked_outcome,
      operational_cause,
      logistics_friction,
      eligible_cases,
      first_seen,
      last_seen,
      last_updated
    ) VALUES (
      ${patternId},
      ${blockedOutcome},
      ${operationalCause},
      ${logisticsFriction},
      0,
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING *
  `) as Array<any>;

  return created[0];
}
