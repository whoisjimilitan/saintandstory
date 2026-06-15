/**
 * Friction Intelligence Layer
 *
 * CRITICAL: Validates whether the diagnosed friction is real.
 *
 * The Outcome Case makes a hypothesis:
 * "This business has logistics friction with key transfer"
 *
 * Friction Intelligence answers:
 * "Was that diagnosis correct? Did they engage with it? Did they confirm it?"
 *
 * This is where inference becomes validated knowledge.
 * Without it, Pattern Intelligence learns from guesses.
 * With it, the machine learns from reality.
 */

export interface FrictionSignal {
  // The friction diagnosis from Outcome Case
  diagnosed_friction: string;

  // Engagement signals
  opened_email: boolean;
  opened_count: number;
  clicked_related_content: boolean;
  clicked_count: number;
  replied_to_email: boolean;
  mentioned_friction_in_reply: boolean;
  scheduled_meeting: boolean;
  meeting_happened: boolean;
  meeting_confirmed_friction: boolean;
  became_job: boolean;

  // Temporal
  days_since_diagnosis: number;
  days_to_first_engagement: number | null;
  days_to_reply: number | null;
  days_to_meeting: number | null;
  days_to_job: number | null;
}

export interface FrictionValidation {
  // Business context
  business_id: string;
  business_name: string;
  industry: string;
  diagnosed_friction: string;

  // Validation score (0-100)
  // How confident are we this friction is real?
  friction_validation_score: number;

  // Raw signals
  is_validated: boolean; // Did they explicitly confirm this is the issue?
  engagement_score: number; // 0-100 based on opens, clicks, replies
  conversion_score: number; // 0-100 based on meeting/job outcome

  // Engagement breakdown
  opened: boolean;
  clicked: boolean;
  replied: boolean;
  meeting_scheduled: boolean;
  became_job: boolean;

  // Friction sentiment
  // Did they correct our diagnosis or confirm it?
  friction_sentiment: 'confirmed' | 'refined' | 'rejected' | 'unknown';
  friction_refinement?: string; // What they said it actually was

  // Metadata
  generated_at: string;
}

/**
 * Build friction signals from a prospect's engagement history
 */
export async function buildFrictionSignals(
  sql: any,
  leadId: string,
  diagnosedFriction: string
): Promise<FrictionSignal | null> {
  try {
    // Get lead data
    const leadResult = (await sql`
      SELECT
        id,
        business_name,
        email_sent_at,
        replied,
        replied_at,
        email_opened_count,
        email_clicked_count
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `) as Array<any>;

    if (leadResult.length === 0) {
      return null;
    }

    const lead = leadResult[0];

    // Get email events to check for engagement
    const openEvents = (await sql`
      SELECT COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId} AND event_type = 'opened'
    `) as Array<any>;

    const clickEvents = (await sql`
      SELECT COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId} AND event_type = 'clicked'
    `) as Array<any>;

    const opened_count = openEvents[0]?.count || 0;
    const clicked_count = clickEvents[0]?.count || 0;

    // Check if they mentioned the friction in their reply
    const replyAnalysis = await analyzeReplyForFriction(sql, leadId, diagnosedFriction);

    // Calculate days since diagnosis
    const sentDate = new Date(lead.email_sent_at);
    const now = new Date();
    const days_since_diagnosis = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate days to first engagement
    let days_to_first_engagement: number | null = null;
    if (opened_count > 0) {
      const firstEvent = (await sql`
        SELECT timestamp
        FROM b2b_email_events
        WHERE lead_id = ${leadId}
        ORDER BY timestamp ASC
        LIMIT 1
      `) as Array<any>;

      if (firstEvent.length > 0) {
        const eventDate = new Date(firstEvent[0].timestamp);
        days_to_first_engagement = Math.floor((eventDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    // Calculate days to reply
    let days_to_reply: number | null = null;
    if (lead.replied && lead.replied_at) {
      const replyDate = new Date(lead.replied_at);
      days_to_reply = Math.floor((replyDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      diagnosed_friction: diagnosedFriction,
      opened_email: opened_count > 0,
      opened_count,
      clicked_related_content: clicked_count > 0,
      clicked_count,
      replied_to_email: lead.replied,
      mentioned_friction_in_reply: replyAnalysis.mentioned,
      scheduled_meeting: false, // TODO: integrate with meeting scheduling
      meeting_happened: false, // TODO: integrate with CRM
      meeting_confirmed_friction: false, // TODO: integrate with call notes
      became_job: false, // TODO: integrate with job generation
      days_since_diagnosis,
      days_to_first_engagement,
      days_to_reply,
      days_to_meeting: null,
      days_to_job: null
    };
  } catch (error) {
    console.error("[Friction Signals] Error:", error);
    return null;
  }
}

/**
 * Analyze reply text to see if they mentioned/confirmed the friction
 */
async function analyzeReplyForFriction(
  sql: any,
  leadId: string,
  diagnosedFriction: string
): Promise<{ mentioned: boolean; refined: string | null }> {
  try {
    // Get reply content (if implemented)
    // For now, return false since we don't store reply text yet
    return { mentioned: false, refined: null };
  } catch (error) {
    return { mentioned: false, refined: null };
  }
}

/**
 * Calculate friction validation score
 *
 * This score reflects: "Is this friction diagnosis real?"
 *
 * 0-20: No engagement, friction is likely wrong
 * 21-40: Some opens, friction might be relevant but not urgent
 * 41-60: Opens + clicks, friction is plausibly real
 * 61-80: Opens + clicks + reply, friction is probably real
 * 81-100: Confirmed in reply/meeting, friction is definitely real
 */
export function calculateFrictionValidationScore(signals: FrictionSignal): number {
  let score = 0;

  // Base score: if they engaged at all
  if (!signals.opened_email) {
    return 0; // No engagement = no validation
  }

  score = 20; // They opened = friction worth reading (20 pts)

  // Clicks indicate specific interest in the friction
  if (signals.clicked_count >= 1) {
    score += 15; // One click (35 total)
  }
  if (signals.clicked_count >= 2) {
    score += 10; // Multiple clicks (45 total)
  }

  // Reply = serious engagement
  if (signals.replied_to_email) {
    score += 20; // Reply (65 total)
  }

  // They explicitly mentioned the friction = confirmed
  if (signals.mentioned_friction_in_reply) {
    score += 25; // Confirmation (90 total)
  }

  // Meeting = they want to talk about it
  if (signals.scheduled_meeting) {
    score += 10; // Meeting scheduled (varies based on above)
  }

  // They confirmed in meeting = 100% validated
  if (signals.meeting_confirmed_friction) {
    score = 100;
  }

  // Became a job = friction was real and we solved it
  if (signals.became_job) {
    score = 100;
  }

  return Math.min(score, 100);
}

/**
 * Calculate engagement score (separate from validation)
 *
 * Engagement = how much did they interact with the message?
 * Validation = how much did that interaction confirm the friction?
 */
export function calculateEngagementScore(signals: FrictionSignal): number {
  let score = 0;

  if (signals.opened_email) score += 25;
  if (signals.clicked_count >= 1) score += 25;
  if (signals.clicked_count >= 2) score += 15;
  if (signals.replied_to_email) score += 35;

  return Math.min(score, 100);
}

/**
 * Determine friction sentiment
 * Did they confirm, refine, or reject the diagnosis?
 */
function determineFrictionSentiment(
  mentioned: boolean,
  refinement: string | null
): 'confirmed' | 'refined' | 'rejected' | 'unknown' {
  if (!mentioned && !refinement) {
    return 'unknown';
  }

  if (refinement) {
    return 'refined'; // They corrected us
  }

  if (mentioned) {
    return 'confirmed'; // They confirmed
  }

  return 'unknown';
}

/**
 * Generate Friction Validation for a lead
 *
 * This is what we store: validated reality about the friction
 */
export async function generateFrictionValidation(
  sql: any,
  leadId: string,
  businessName: string,
  industry: string,
  diagnosedFriction: string
): Promise<FrictionValidation | null> {
  try {
    const signals = await buildFrictionSignals(sql, leadId, diagnosedFriction);

    if (!signals) {
      return null;
    }

    const validation_score = calculateFrictionValidationScore(signals);
    const engagement_score = calculateEngagementScore(signals);

    // Conversion score = did it lead to business outcome?
    const conversion_score = signals.became_job ? 100 : (signals.meeting_happened ? 60 : 0);

    // Determine if validated
    const is_validated = validation_score >= 60; // 60+ = probably real

    // Determine sentiment
    const sentiment = determineFrictionSentiment(
      signals.mentioned_friction_in_reply,
      null // TODO: extract refinement from reply text
    );

    return {
      business_id: leadId,
      business_name: businessName,
      industry,
      diagnosed_friction: diagnosedFriction,
      friction_validation_score: validation_score,
      is_validated,
      engagement_score,
      conversion_score,
      opened: signals.opened_email,
      clicked: signals.clicked_related_content,
      replied: signals.replied_to_email,
      meeting_scheduled: signals.scheduled_meeting,
      became_job: signals.became_job,
      friction_sentiment: sentiment,
      friction_refinement: undefined,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("[Friction Validation] Error:", error);
    return null;
  }
}

/**
 * Query: Which frictions get engagement?
 *
 * Returns frictions ranked by engagement rate
 */
export async function getFrictionsWithEngagement(sql: any, industryFilter?: string) {
  try {
    // This query would aggregate friction validations
    // For now, return structure
    const query = industryFilter
      ? `SELECT diagnosed_friction, COUNT(*) as count, AVG(engagement_score) as avg_engagement
         FROM friction_validations
         WHERE industry = $1
         GROUP BY diagnosed_friction
         ORDER BY avg_engagement DESC`
      : `SELECT diagnosed_friction, COUNT(*) as count, AVG(engagement_score) as avg_engagement
         FROM friction_validations
         GROUP BY diagnosed_friction
         ORDER BY avg_engagement DESC`;

    // Would need table implementation
    return [];
  } catch (error) {
    console.error("[Friction Engagement Query] Error:", error);
    return [];
  }
}

/**
 * Query: Which frictions lead to jobs?
 *
 * Returns frictions ranked by conversion rate
 */
export async function getFrictionsWithConversion(sql: any, industryFilter?: string) {
  try {
    // This query would aggregate friction validations
    // For now, return structure
    return [];
  } catch (error) {
    console.error("[Friction Conversion Query] Error:", error);
    return [];
  }
}
