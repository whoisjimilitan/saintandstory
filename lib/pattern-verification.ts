/**
 * Pattern Verification Layer
 *
 * CRITICAL RULE:
 * Pattern Intelligence learns ONLY from VERIFIED patterns.
 *
 * Operator actions:
 * 1. VERIFY — Pattern is accurate business reality
 * 2. REJECT — Pattern is not meaningful or accurate
 * 3. MERGE — Pattern is duplicate of existing verified pattern
 *
 * Verification prevents:
 * - False correlations
 * - Accidental pattern drift
 * - Learning from bad diagnoses
 * - Garbage-in-garbage-out intelligence
 */

export type PatternStatus = 'unverified' | 'verified' | 'rejected' | 'merged';

export interface PatternVerificationAction {
  pattern_id: string;
  action: PatternStatus;
  operator_id?: string;
  reason?: string;
  merge_into_pattern_id?: string;
}

/**
 * Verify a pattern as accurate business reality
 */
export async function verifyPattern(
  sql: any,
  patternId: string,
  operatorId: string
): Promise<boolean> {
  try {
    // Update pattern status
    const updated = (await sql`
      UPDATE pattern_records
      SET
        status = 'verified',
        verified_by_operator = ${operatorId},
        verified_at = NOW(),
        updated_at = NOW()
      WHERE pattern_id = ${patternId}
      RETURNING id
    `) as Array<any>;

    if (updated.length === 0) {
      return false;
    }

    // Log action
    await sql`
      INSERT INTO pattern_verification_log (pattern_id, action, operator_id)
      VALUES (${patternId}, 'verified', ${operatorId})
    `;

    return true;
  } catch (error) {
    console.error("[Pattern Verification] Error verifying pattern:", error);
    return false;
  }
}

/**
 * Reject a pattern as inaccurate or not meaningful
 */
export async function rejectPattern(
  sql: any,
  patternId: string,
  operatorId: string,
  reason?: string
): Promise<boolean> {
  try {
    // Update pattern status
    const updated = (await sql`
      UPDATE pattern_records
      SET
        status = 'rejected',
        verified_by_operator = ${operatorId},
        verified_at = NOW(),
        rejection_reason = ${reason || 'No reason provided'},
        updated_at = NOW()
      WHERE pattern_id = ${patternId}
      RETURNING id
    `) as Array<any>;

    if (updated.length === 0) {
      return false;
    }

    // Log action
    await sql`
      INSERT INTO pattern_verification_log (pattern_id, action, operator_id, reason)
      VALUES (${patternId}, 'rejected', ${operatorId}, ${reason || null})
    `;

    return true;
  } catch (error) {
    console.error("[Pattern Verification] Error rejecting pattern:", error);
    return false;
  }
}

/**
 * Merge a pattern into an existing verified pattern
 */
export async function mergePattern(
  sql: any,
  patternId: string,
  mergeIntoPatternId: string,
  operatorId: string
): Promise<boolean> {
  try {
    // Get both patterns
    const sourcePattern = (await sql`
      SELECT * FROM pattern_records WHERE pattern_id = ${patternId} LIMIT 1
    `) as Array<any>;

    const targetPattern = (await sql`
      SELECT * FROM pattern_records WHERE pattern_id = ${mergeIntoPatternId} LIMIT 1
    `) as Array<any>;

    if (sourcePattern.length === 0 || targetPattern.length === 0) {
      return false;
    }

    const source = sourcePattern[0];
    const target = targetPattern[0];

    // Merge counts into target
    const newEligibleCases = target.eligible_cases + source.eligible_cases;
    const newConversationCount = target.conversation_count + source.conversation_count;
    const newMeetingCount = target.meeting_count + source.meeting_count;
    const newJobCount = target.job_count + source.job_count;
    const newRecurringCount = target.recurring_count + source.recurring_count;

    // Recalculate rates for merged total
    const conversationRate = newEligibleCases > 0 ? (newConversationCount / newEligibleCases) * 100 : 0;
    const meetingRate = newEligibleCases > 0 ? (newMeetingCount / newEligibleCases) * 100 : 0;
    const jobRate = newEligibleCases > 0 ? (newJobCount / newEligibleCases) * 100 : 0;
    const recurringRate = newEligibleCases > 0 ? (newRecurringCount / newEligibleCases) * 100 : 0;

    // Update target pattern with merged data
    await sql`
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
      WHERE pattern_id = ${mergeIntoPatternId}
    `;

    // Mark source as merged
    await sql`
      UPDATE pattern_records
      SET
        status = 'merged',
        verified_by_operator = ${operatorId},
        verified_at = NOW(),
        merged_into_pattern_id = ${mergeIntoPatternId},
        updated_at = NOW()
      WHERE pattern_id = ${patternId}
    `;

    // Log action
    await sql`
      INSERT INTO pattern_verification_log (pattern_id, action, operator_id, reason)
      VALUES (${patternId}, 'merged', ${operatorId}, ${`Merged into ${mergeIntoPatternId}`})
    `;

    return true;
  } catch (error) {
    console.error("[Pattern Verification] Error merging patterns:", error);
    return false;
  }
}

/**
 * Get all unverified patterns (review queue)
 */
export async function getUnverifiedPatterns(sql: any): Promise<Array<any>> {
  return (await sql`
    SELECT * FROM pattern_records
    WHERE status = 'unverified'
    ORDER BY eligible_cases DESC, last_updated DESC
  `) as Array<any>;
}

/**
 * Get verified patterns only (learning queue)
 */
export async function getVerifiedPatterns(sql: any): Promise<Array<any>> {
  return (await sql`
    SELECT * FROM pattern_records
    WHERE status = 'verified'
    ORDER BY job_rate DESC, recurring_rate DESC, last_updated DESC
  `) as Array<any>;
}

/**
 * Get pattern verification stats
 */
export async function getVerificationStats(sql: any): Promise<{
  total: number;
  unverified: number;
  verified: number;
  rejected: number;
  merged: number;
}> {
  const stats = (await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'unverified' THEN 1 END) as unverified,
      COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
      COUNT(CASE WHEN status = 'merged' THEN 1 END) as merged
    FROM pattern_records
  `) as Array<any>;

  return stats[0];
}
