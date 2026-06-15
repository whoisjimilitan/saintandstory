/**
 * Pattern Intelligence
 *
 * Learns which logistics-solvable blocked outcomes repeatedly create commercial movement.
 *
 * NOT: Industries, demographics, engagement rates, predictions
 * YES: Situations (blocked outcome + cause + friction) and their conversion rates
 */

export interface PatternRecord {
  // Pattern identification
  id: string;
  pattern_id: string;

  // Pattern components (from Outcome Case)
  blocked_outcome: string;
  operational_cause: string;
  logistics_friction: string;

  // Case counts
  eligible_cases: number;

  // Conversion metrics (absolute counts)
  conversation_count: number;
  meeting_count: number;
  job_count: number;
  recurring_count: number;

  // Calculated rates (0-100)
  conversation_rate: number;
  meeting_rate: number;
  job_rate: number;
  recurring_rate: number;

  // Timestamps
  first_seen: string;
  last_seen: string;
  last_updated: string;

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Storage operations for PatternRecords
 */
export async function getOrCreatePattern(
  sql: any,
  blockedOutcome: string,
  operationalCause: string,
  logisticsFriction: string
): Promise<PatternRecord> {
  // Create pattern ID from components
  const patternId = `${blockedOutcome}|${operationalCause}|${logisticsFriction}`;

  // Try to find existing pattern
  const existing = (await sql`
    SELECT * FROM pattern_records
    WHERE pattern_id = ${patternId}
    LIMIT 1
  `) as PatternRecord[];

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new pattern
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
  `) as PatternRecord[];

  return created[0];
}

/**
 * Update pattern with new conversion data
 */
export async function updatePatternMetrics(
  sql: any,
  patternId: string,
  conversationOccurred: boolean,
  meetingOccurred: boolean,
  jobCreated: boolean,
  recurringWork: boolean
): Promise<PatternRecord> {
  // Get current pattern
  const pattern = (await sql`
    SELECT * FROM pattern_records
    WHERE pattern_id = ${patternId}
    LIMIT 1
  `) as PatternRecord[];

  if (pattern.length === 0) {
    throw new Error(`Pattern not found: ${patternId}`);
  }

  const current = pattern[0];

  // Update counts
  const newEligibleCases = current.eligible_cases + 1;
  const newConversationCount = conversationOccurred ? current.conversation_count + 1 : current.conversation_count;
  const newMeetingCount = meetingOccurred ? current.meeting_count + 1 : current.meeting_count;
  const newJobCount = jobCreated ? current.job_count + 1 : current.job_count;
  const newRecurringCount = recurringWork ? current.recurring_count + 1 : current.recurring_count;

  // Calculate rates
  const conversationRate = newEligibleCases > 0 ? (newConversationCount / newEligibleCases) * 100 : 0;
  const meetingRate = newEligibleCases > 0 ? (newMeetingCount / newEligibleCases) * 100 : 0;
  const jobRate = newEligibleCases > 0 ? (newJobCount / newEligibleCases) * 100 : 0;
  const recurringRate = newEligibleCases > 0 ? (newRecurringCount / newEligibleCases) * 100 : 0;

  // Update pattern
  const updated = (await sql`
    UPDATE pattern_records
    SET
      eligible_cases = ${newEligibleCases},
      conversation_count = ${newConversationCount},
      meeting_count = ${newMeetingCount},
      job_count = ${newJobCount},
      recurring_count = ${newRecurringCount},
      conversation_rate = ${conversationRate},
      meeting_rate = ${meetingRate},
      job_rate = ${jobRate},
      recurring_rate = ${recurringRate},
      last_seen = NOW(),
      last_updated = NOW(),
      updated_at = NOW()
    WHERE pattern_id = ${patternId}
    RETURNING *
  `) as PatternRecord[];

  return updated[0];
}

/**
 * Get all patterns sorted by job conversion rate
 */
export async function getAllPatterns(sql: any): Promise<PatternRecord[]> {
  return (await sql`
    SELECT * FROM pattern_records
    WHERE eligible_cases > 0
    ORDER BY job_rate DESC, recurring_rate DESC, last_updated DESC
  `) as PatternRecord[];
}

/**
 * Get pattern by ID
 */
export async function getPatternById(sql: any, patternId: string): Promise<PatternRecord | null> {
  const result = (await sql`
    SELECT * FROM pattern_records
    WHERE pattern_id = ${patternId}
    LIMIT 1
  `) as PatternRecord[];

  return result.length > 0 ? result[0] : null;
}

/**
 * Get top N patterns by job conversion rate
 */
export async function getTopPatterns(sql: any, limit: number = 10): Promise<PatternRecord[]> {
  return (await sql`
    SELECT * FROM pattern_records
    WHERE eligible_cases > 0
    ORDER BY job_rate DESC, recurring_rate DESC
    LIMIT ${limit}
  `) as PatternRecord[];
}
