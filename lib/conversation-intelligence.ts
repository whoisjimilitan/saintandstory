/**
 * Conversation Intelligence Layer
 *
 * Transforms raw conversation data into relationship insights.
 * Makes conversations the primary object, not prospects.
 *
 * Answers:
 * - What did we send?
 * - What did they do?
 * - What state is this relationship in?
 * - What should happen next?
 */

export interface ConversationIntelligence {
  lead_id: string;
  business_name: string;

  // Message Sent
  email_subject: string;
  email_body: string;
  email_sent_at: string;
  recipient_email: string;

  // Prospect Behavior
  opened_count: number;
  clicked_count: number;
  replied: boolean;
  replied_at: string | null;
  last_activity_at: string | null;

  // Derived State
  relationship_state: "cold" | "warm" | "hot" | "stalled" | "replied" | "meeting" | "won" | "lost";
  days_since_sent: number;
  days_since_last_activity: number;

  // System Interpretation
  assessment: string;

  // Recommended Action
  recommended_action: string;
}

/**
 * Determine relationship state based on behavior
 */
export function deriveRelationshipState(
  opened_count: number,
  clicked_count: number,
  replied: boolean,
  days_since_sent: number,
  days_since_activity: number
): "cold" | "warm" | "hot" | "stalled" | "replied" | "meeting" | "won" | "lost" {
  // If replied, they're engaged
  if (replied) {
    return "replied";
  }

  // If clicked, they're interested (hot)
  if (clicked_count > 0) {
    return "hot";
  }

  // If opened but no click/reply and been 7+ days: STALLED
  // This is the most critical B2B state - where conversations die
  if (opened_count > 0 && clicked_count === 0 && !replied && days_since_activity > 7) {
    return "stalled";
  }

  // If opened (but less than 7 days of inactivity), they've seen it
  if (opened_count > 0) {
    return "warm";
  }

  // If nothing in 14+ days, definitely cold (lost interest)
  if (days_since_activity > 14) {
    return "cold";
  }

  // Default cold if nothing happened yet
  return "cold";
}

/**
 * Generate assessment based on behavior
 * DETERMINISTIC: Rule-based logic, not AI-generated
 */
export function generateAssessment(
  opened_count: number,
  clicked_count: number,
  replied: boolean,
  days_since_sent: number,
  days_since_activity: number
): string {
  // REPLIED: Most engaged state
  if (replied) {
    return "REPLIED: Prospect is actively engaged and responded. Ready for conversation.";
  }

  // HOT: Clicked link (showed specific interest)
  if (clicked_count > 0 && !replied) {
    return `HOT: Clicked link ${clicked_count} time${clicked_count > 1 ? "s" : ""}. Shows specific interest. No reply suggests they're evaluating or need human confirmation.`;
  }

  // STALLED: Opened but inactive 7+ days (most dangerous state)
  if (opened_count > 0 && clicked_count === 0 && !replied && days_since_activity > 7) {
    return `STALLED: Opened email ${opened_count} time${opened_count > 1 ? "s" : ""} but inactive for ${days_since_activity} days. Interest is cooling. Action required to revive.`;
  }

  // WARM: Opened but recently (less than 7 days since activity)
  if (opened_count > 0 && !replied && days_since_activity <= 7) {
    return `WARM: Opened email ${opened_count} time${opened_count > 1 ? "s" : ""}. Interest confirmed. Still evaluating or processing. Wait or follow up with additional value.`;
  }

  // COLD: No opens in 7+ days
  if (opened_count === 0 && days_since_sent > 7) {
    return `COLD: Email sent ${days_since_sent} days ago with no opens. Likely not seen or deprioritized. Requires different approach or timing.`;
  }

  // CONTACTED: Recently sent, awaiting response
  return `CONTACTED: Email sent ${days_since_sent} day${days_since_sent > 1 ? "s" : ""} ago. Awaiting prospect response.`;
}

/**
 * Generate recommended action based on state
 */
export function generateRecommendedAction(
  state: string,
  days_since_sent: number,
  opened_count: number,
  clicked_count: number,
  replied: boolean,
  days_since_activity: number
): string {
  if (replied) {
    return "Schedule 15-minute call to understand needs and qualify opportunity.";
  }

  if (clicked_count > 0 && !replied) {
    return "Call within 24 hours. Reference their click on the solution link. Clarify next steps.";
  }

  if (opened_count > 2 && clicked_count === 0) {
    return "Send case study or social proof via email. Follow up with call in 2 days.";
  }

  if (opened_count > 0 && !replied && days_since_sent > 3) {
    return "Send alternative sequence or personalized message. Avoid generic follow-up.";
  }

  if (days_since_sent > 7 && opened_count === 0) {
    return "Try different subject line or timing. Consider postcode search for alternate contact.";
  }

  if (days_since_sent < 3) {
    return "Wait for prospect response. Monitor for opens/clicks.";
  }

  return "Follow up with personalized message based on their engagement level.";
}

/**
 * Build Conversation Intelligence for a prospect
 */
export async function buildConversationIntelligence(
  sql: any,
  leadId: string
): Promise<ConversationIntelligence | null> {
  try {
    // Get lead with email data
    const leadResult = (await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        subject,
        body,
        email_sent_at,
        replied,
        replied_at
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `) as Array<any>;

    if (leadResult.length === 0) {
      return null;
    }

    const lead = leadResult[0];

    // If no email sent, can't build conversation intelligence
    if (!lead.email_sent_at || !lead.body) {
      return null;
    }

    // Get email open events
    const openEvents = (await sql`
      SELECT COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId} AND event_type = 'opened'
    `) as Array<any>;

    const opened_count = openEvents[0]?.count || 0;

    // Get email click events
    const clickEvents = (await sql`
      SELECT COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId} AND event_type = 'clicked'
    `) as Array<any>;

    const clicked_count = clickEvents[0]?.count || 0;

    // Get last activity timestamp
    const lastActivity = (await sql`
      SELECT timestamp
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      ORDER BY timestamp DESC
      LIMIT 1
    `) as Array<any>;

    const last_activity_at = lastActivity[0]?.timestamp || lead.email_sent_at;

    // Calculate days
    const sentDate = new Date(lead.email_sent_at);
    const now = new Date();
    const days_since_sent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));

    const activityDate = new Date(last_activity_at);
    const days_since_activity = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    // Derive state
    const relationship_state = deriveRelationshipState(
      opened_count,
      clicked_count,
      lead.replied,
      days_since_sent,
      days_since_activity
    );

    // Generate assessment
    const assessment = generateAssessment(
      opened_count,
      clicked_count,
      lead.replied,
      days_since_sent,
      days_since_activity
    );

    // Generate recommended action
    const recommended_action = generateRecommendedAction(
      relationship_state,
      days_since_sent,
      opened_count,
      clicked_count,
      lead.replied,
      days_since_activity
    );

    return {
      lead_id: lead.id,
      business_name: lead.business_name,
      email_subject: lead.subject,
      email_body: lead.body,
      email_sent_at: lead.email_sent_at.toISOString(),
      recipient_email: lead.email,
      opened_count,
      clicked_count,
      replied: lead.replied,
      replied_at: lead.replied_at ? lead.replied_at.toISOString() : null,
      last_activity_at: last_activity_at.toISOString(),
      relationship_state,
      days_since_sent,
      days_since_last_activity: days_since_activity,
      assessment,
      recommended_action
    };
  } catch (error) {
    console.error("[Conversation Intelligence] Error:", error);
    return null;
  }
}
