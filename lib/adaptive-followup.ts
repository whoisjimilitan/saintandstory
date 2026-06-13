import { neon } from "@neondatabase/serverless";

/**
 * Adaptive Follow-Up Engine
 *
 * Analyzes engagement patterns and determines optimal follow-up strategy
 * Rules-based system: IF engagement_pattern THEN follow_up_type
 *
 * Examples:
 * - IF opened but didn't click → Send educational follow-up
 * - IF clicked but didn't reply → Send case study / social proof
 * - IF 3+ opens → Send direct meeting request
 * - IF no opens after 3 days → Test new subject line
 *
 * DORMANT: Not activated. Ready for feature flag activation.
 */

export type FollowUpType =
  | "educational"
  | "case_study"
  | "meeting_request"
  | "subject_test"
  | "value_prop"
  | "social_proof";

export interface FollowUpRecommendation {
  should_send_followup: boolean;
  followup_type: FollowUpType | null;
  reasoning: string;
  engagement_pattern: string;
  days_since_last_email: number;
}

/**
 * Get engagement pattern for a lead
 */
export async function analyzeEngagementPattern(
  sql: any,
  leadId: string
): Promise<{
  opens: number;
  clicks: number;
  replied: boolean;
  bounced: boolean;
  daysActive: number;
  lastEventType: string | null;
}> {
  try {
    const events = await sql`
      SELECT event_type, timestamp
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      ORDER BY timestamp DESC
    `;

    const outreach = await sql`
      SELECT replied, sent_at
      FROM b2b_outreach
      WHERE lead_id = ${leadId}
      ORDER BY sent_at DESC
      LIMIT 1
    `;

    const opens = events.filter((e: any) => e.event_type === "opened").length;
    const clicks = events.filter((e: any) => e.event_type === "clicked").length;
    const bounced = events.some((e: any) => e.event_type === "bounced");
    const replied = outreach.length > 0 && outreach[0].replied;

    const daysActive =
      outreach.length > 0
        ? Math.floor(
            (Date.now() - new Date(outreach[0].sent_at).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

    const lastEventType = events.length > 0 ? events[0].event_type : null;

    return {
      opens,
      clicks,
      replied,
      bounced,
      daysActive,
      lastEventType,
    };
  } catch (error) {
    console.error("[ADAPTIVE-FOLLOWUP] Error analyzing engagement:", error);
    return {
      opens: 0,
      clicks: 0,
      replied: false,
      bounced: false,
      daysActive: 0,
      lastEventType: null,
    };
  }
}

/**
 * Determine optimal follow-up type based on engagement
 *
 * Rules (in priority order):
 * 1. Already replied → Don't follow up
 * 2. Bounced/Complained → Don't follow up
 * 3. 3+ opens without click → Meeting request (they're interested)
 * 4. Clicked but no reply → Case study (build confidence)
 * 5. 1-2 opens, no click → Educational (nurture engagement)
 * 6. No opens after 3 days → Subject test (fresh angle)
 */
export async function getFollowUpRecommendation(
  sql: any,
  leadId: string
): Promise<FollowUpRecommendation> {
  try {
    const pattern = await analyzeEngagementPattern(sql, leadId);

    // Rule 1: Already replied
    if (pattern.replied) {
      return {
        should_send_followup: false,
        followup_type: null,
        reasoning: "Lead already replied. Awaiting response.",
        engagement_pattern: "replied",
        days_since_last_email: pattern.daysActive,
      };
    }

    // Rule 2: Bounced or complained
    if (pattern.bounced) {
      return {
        should_send_followup: false,
        followup_type: null,
        reasoning: "Email bounced. Lead disqualified.",
        engagement_pattern: "bounced",
        days_since_last_email: pattern.daysActive,
      };
    }

    // Rule 3: 3+ opens without click (high engagement, no action)
    if (pattern.opens >= 3 && pattern.clicks === 0) {
      return {
        should_send_followup: true,
        followup_type: "meeting_request",
        reasoning:
          "High email engagement (3+ opens) but no clicks. Time for direct meeting request.",
        engagement_pattern: "high_opens_no_clicks",
        days_since_last_email: pattern.daysActive,
      };
    }

    // Rule 4: Clicked but no reply (showed interest, needs confidence)
    if (pattern.clicks > 0 && !pattern.replied) {
      return {
        should_send_followup: true,
        followup_type: "case_study",
        reasoning:
          "Lead clicked link but didn't reply. Send social proof / case study.",
        engagement_pattern: "clicked_no_reply",
        days_since_last_email: pattern.daysActive,
      };
    }

    // Rule 5: 1-2 opens, no click (moderate engagement)
    if (pattern.opens >= 1 && pattern.clicks === 0) {
      return {
        should_send_followup: true,
        followup_type: "educational",
        reasoning:
          "Light email engagement. Send educational content to nurture.",
        engagement_pattern: "light_opens_no_clicks",
        days_since_last_email: pattern.daysActive,
      };
    }

    // Rule 6: No opens after 3 days (try fresh angle)
    if (pattern.opens === 0 && pattern.daysActive >= 3) {
      return {
        should_send_followup: true,
        followup_type: "subject_test",
        reasoning:
          "No opens after 3 days. Test different subject line / angle.",
        engagement_pattern: "no_opens_3days",
        days_since_last_email: pattern.daysActive,
      };
    }

    // Default: Wait for more data
    return {
      should_send_followup: false,
      followup_type: null,
      reasoning: "Not yet time for follow-up. Continue monitoring.",
      engagement_pattern: "waiting",
      days_since_last_email: pattern.daysActive,
    };
  } catch (error) {
    console.error("[ADAPTIVE-FOLLOWUP] Error getting recommendation:", error);
    return {
      should_send_followup: false,
      followup_type: null,
      reasoning: "Error analyzing engagement",
      engagement_pattern: "error",
      days_since_last_email: 0,
    };
  }
}

/**
 * Get template for follow-up type
 * Returns the email template to use for this follow-up
 */
export function getFollowUpTemplate(followupType: FollowUpType): {
  subject_template: string;
  body_template: string;
  description: string;
} {
  const templates: Record<
    FollowUpType,
    { subject_template: string; body_template: string; description: string }
  > = {
    educational: {
      subject_template:
        "Quick insight: How {BUSINESS_NAME} could reduce {PAIN_POINT} coordination",
      body_template: `Hi {CONTACT_NAME},

I noticed you opened my previous message. I wanted to share a quick insight that might be relevant to {BUSINESS_NAME}.

Many businesses like yours are using this approach to reduce {PAIN_POINT} friction: [Educational insight]

Would this be useful to explore? Let me know.

Best,
Jimi
Saint & Story`,
      description:
        "Educational follow-up for light engagement. Build awareness.",
    },

    case_study: {
      subject_template:
        "Re: How we helped {SIMILAR_BUSINESS} solve {PAIN_POINT}",
      body_template: `Hi {CONTACT_NAME},

Thanks for your interest in Saint & Story. I wanted to share a recent case study that might be relevant to {BUSINESS_NAME}.

We worked with {SIMILAR_BUSINESS} (similar size, {INDUSTRY}) to reduce their {PAIN_POINT} coordination from {TIME_BEFORE} to {TIME_AFTER}.

Key results:
- {RESULT_1}
- {RESULT_2}
- {RESULT_3}

Would you be open to a quick conversation about how we could replicate this for {BUSINESS_NAME}?

Best,
Jimi
Saint & Story`,
      description: "Case study / social proof for clicked but no reply.",
    },

    meeting_request: {
      subject_template:
        "Let's talk: {BUSINESS_NAME} moving to next level of service",
      body_template: `Hi {CONTACT_NAME},

I can see you've been engaging with our approach to {PAIN_POINT} solutions. This tells me you're interested in exploring options.

I'd like to schedule 15 minutes to understand {BUSINESS_NAME}'s specific situation and see if we're a fit.

Available this week:
- [TIME_1]
- [TIME_2]
- [TIME_3]

Which works best?

Best,
Jimi
Saint & Story`,
      description:
        "Direct meeting request for high engagement (3+ opens).",
    },

    subject_test: {
      subject_template:
        "{ALT_SUBJECT_LINE_1} - Quick question",
      body_template: `Hi {CONTACT_NAME},

I realize my last subject line might not have resonated. Let me try a different angle.

{BUSINESS_NAME} is at the stage where most teams struggle with {PAIN_POINT}. We've built a system that removes this bottleneck entirely.

Curious if that's a pain point for you?

Best,
Jimi
Saint & Story`,
      description:
        "Subject line test for no opens. Fresh angle, simpler message.",
    },

    value_prop: {
      subject_template: "The real ROI of reducing {PAIN_POINT}",
      body_template: `Hi {CONTACT_NAME},

Most teams don't realize the hidden cost of {PAIN_POINT} friction:

- Lost time: {HOURS_PER_WEEK}h per week
- Cost per incident: {COST_PER_INCIDENT}
- Cumulative annual cost: {ANNUAL_COST}

This is why we built Saint & Story.

Worth a conversation?

Best,
Jimi`,
      description: "Value proposition / ROI-focused follow-up.",
    },

    social_proof: {
      subject_template: "Why {COMPETITOR_TYPE} teams choose Saint & Story",
      body_template: `Hi {CONTACT_NAME},

Quick stat: {PERCENT_OF_INDUSTRY}% of {INDUSTRY} teams have moved to dedicated {SERVICE_TYPE} coordination.

The ones who haven't are still losing {HOURS_PER_WEEK}h/week to manual coordination.

{BUSINESS_NAME} could be one of the teams that fixed this. Worth exploring?

Best,
Jimi`,
      description: "Social proof / bandwagon effect follow-up.",
    },
  };

  return templates[followupType];
}

/**
 * Get all leads needing adaptive follow-ups
 * DORMANT: Not called automatically. Used only when feature flag enabled.
 */
export async function getLeadsNeedingFollowUp(
  sql: any
): Promise<
  Array<{
    lead_id: string;
    recommendation: FollowUpRecommendation;
  }>
> {
  try {
    // Get all leads with outreach sent but not yet converted
    const leads = await sql`
      SELECT DISTINCT l.id
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      WHERE l.status NOT IN ('closed', 'dead')
        AND o.replied = false
        AND o.sent_at > NOW() - INTERVAL '30 days'
      LIMIT 100
    `;

    const leadsWithRecommendations = await Promise.all(
      leads.map(async (lead: any) => ({
        lead_id: lead.id,
        recommendation: await getFollowUpRecommendation(sql, lead.id),
      }))
    );

    // Filter to only those that should get follow-ups
    return leadsWithRecommendations.filter(
      (l) => l.recommendation.should_send_followup
    );
  } catch (error) {
    console.error("[ADAPTIVE-FOLLOWUP] Error getting leads needing follow-up:", error);
    return [];
  }
}
