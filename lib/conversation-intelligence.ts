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
  relationship_state: "cold" | "warm" | "hot" | "replied" | "meeting" | "won" | "lost";
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
): "cold" | "warm" | "hot" | "replied" | "meeting" | "won" | "lost" {
  // If replied, they're engaged
  if (replied) {
    return "replied";
  }

  // If clicked, they're interested
  if (clicked_count > 0) {
    return "hot";
  }

  // If opened, they've seen it
  if (opened_count > 0) {
    return "warm";
  }

  // If nothing in 14+ days, probably lost interest
  if (days_since_activity > 14) {
    return "cold";
  }

  // Default cold if nothing happened yet
  return "cold";
}

/**
 * Generate assessment based on behavior
 */
export function generateAssessment(
  opened_count: number,
  clicked_count: number,
  replied: boolean,
  days_since_sent: number,
  days_since_activity: number,
  business_category?: string
): string {
  if (replied) {
    return "Prospect is actively engaged and responded. Next action: Schedule meeting or send follow-up information.";
  }

  if (clicked_count > 0) {
    const interest = opened_count > 2 ? "strong" : "specific";
    return `${interest.charAt(0).toUpperCase() + interest.slice(1)} interest detected. Clicked link ${clicked_count} time${clicked_count > 1 ? "s" : ""}. No reply yet suggests they're evaluating or need human confirmation.`;
  }

  if (opened_count > 0) {
    const times = opened_count > 2 ? "multiple times" : "once";
    return `Prospect opened email ${times} (${opened_count} times). Interest confirmed but not yet committed. May need higher-touch follow-up.`;
  }

  if (days_since_sent > 7) {
    return `Email sent ${days_since_sent} days ago with no opens. Likely not seen or deprioritized. Consider follow-up or different approach.`;
  }

  return "Email recently sent. Awaiting prospect response.";
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
      days_since_activity,
      lead.business_category
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
