import { neon } from "@neondatabase/serverless";

/**
 * Email Engagement Tracking System
 *
 * Records and analyzes email engagement from Resend webhooks:
 * - Opened (with pixel tracking)
 * - Clicked (with link redirects)
 * - Bounced
 * - Complained
 *
 * Calculates engagement score for heat ranking.
 */

export interface EmailEvent {
  type: "opened" | "clicked" | "bounced" | "complained" | "delivered";
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EngagementMetrics {
  opens: number;
  firstOpenAt: string | null;
  lastOpenAt: string | null;
  clicks: number;
  clickedLinks: string[];
  lastClickAt: string | null;
  bounced: boolean;
  complained: boolean;
  engagementScore: number;
  lastActivity: string | null;
}

/**
 * Record an email event from Resend webhook
 */
export async function recordEmailEvent(
  sql: any,
  leadId: string,
  outreachId: string,
  eventType: "opened" | "clicked" | "bounced" | "complained" | "delivered",
  metadata?: Record<string, any>
) {
  try {
    const timestamp = new Date().toISOString();

    // Insert event
    const result = await sql`
      INSERT INTO b2b_email_events (
        lead_id, outreach_id, event_type, timestamp, metadata
      ) VALUES (
        ${leadId}, ${outreachId}, ${eventType}, ${timestamp}, ${JSON.stringify(metadata || {})}
      )
      RETURNING id
    `;

    // If it's a click event, also track the link
    if (eventType === "clicked" && metadata?.link_url) {
      await sql`
        INSERT INTO b2b_email_link_clicks (
          event_id, lead_id, link_url, link_text, clicked_at
        ) VALUES (
          ${result[0].id}, ${leadId}, ${metadata.link_url}, ${metadata.link_text || null}, ${timestamp}
        )
      `;
    }

    // Update lead's engagement score
    await updateEngagementScore(sql, leadId);

    console.log(`[ENGAGEMENT] Recorded ${eventType} for lead ${leadId}`);
    return true;
  } catch (error) {
    console.error("[ENGAGEMENT] Failed to record event:", error);
    return false;
  }
}

/**
 * Calculate engagement score (0-100) based on email interactions
 * Opens: +10 each (max +50)
 * Clicks: +20 each (max +30)
 * Reply: +20
 * Bounced/Complained: -100 (disqualify)
 */
export async function calculateEngagementScore(
  sql: any,
  leadId: string
): Promise<number> {
  try {
    const events = await sql`
      SELECT event_type, COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      GROUP BY event_type
    `;

    // Check if ANY outreach record has a reply (not just the most recent)
    const responseRecords = await sql`
      SELECT COUNT(*) as reply_count
      FROM b2b_responses
      WHERE lead_id = ${leadId}
    `;

    let score = 0;

    // Parse event counts
    const eventMap = Object.fromEntries(
      events.map((e: any) => [e.event_type, e.count])
    );

    // Opens: +10 each, max 50
    const opens = Math.min(eventMap.opened || 0, 5) * 10;
    score += opens;

    // Clicks: +20 each, max 30
    const clicks = Math.min(eventMap.clicked || 0, 1) * 20; // First click = +20
    score += clicks;

    // Reply: +20 (check if ANY response exists, not just latest outreach)
    if (responseRecords.length > 0 && responseRecords[0].reply_count > 0) {
      score += 20;
    }

    // Bounced or complained: -100 (disqualify)
    if (eventMap.bounced || eventMap.complained) {
      score = 0; // Complete disqualification
    }

    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    console.error("[ENGAGEMENT] Failed to calculate score:", error);
    return 0;
  }
}

/**
 * Update engagement score and timestamp for a lead
 */
export async function updateEngagementScore(sql: any, leadId: string) {
  try {
    const score = await calculateEngagementScore(sql, leadId);
    const lastEvent = await sql`
      SELECT MAX(timestamp) as last_activity
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
    `;

    await sql`
      UPDATE b2b_leads
      SET engagement_score = ${score},
          last_engagement_at = ${lastEvent[0]?.last_activity || null}
      WHERE id = ${leadId}
    `;

    return score;
  } catch (error) {
    console.error("[ENGAGEMENT] Failed to update score:", error);
    return 0;
  }
}

/**
 * Get complete engagement metrics for a lead
 */
export async function getEngagementMetrics(
  sql: any,
  leadId: string
): Promise<EngagementMetrics> {
  try {
    const events = await sql`
      SELECT event_type, timestamp
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      ORDER BY timestamp
    `;

    const linkClicks = await sql`
      SELECT DISTINCT link_url
      FROM b2b_email_link_clicks
      WHERE lead_id = ${leadId}
      ORDER BY clicked_at DESC
    `;

    const opens = events.filter((e: any) => e.event_type === "opened").length;
    const clicks = events.filter((e: any) => e.event_type === "clicked").length;
    const bounced = events.some((e: any) => e.event_type === "bounced");
    const complained = events.some((e: any) => e.event_type === "complained");

    const openEvents = events.filter((e: any) => e.event_type === "opened");
    const clickEvents = events.filter((e: any) => e.event_type === "clicked");

    const firstOpenAt =
      openEvents.length > 0 ? openEvents[0].timestamp : null;
    const lastOpenAt =
      openEvents.length > 0
        ? openEvents[openEvents.length - 1].timestamp
        : null;
    const lastClickAt =
      clickEvents.length > 0
        ? clickEvents[clickEvents.length - 1].timestamp
        : null;

    const lastActivityEvent = [...events].sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    const engagementScore = await calculateEngagementScore(sql, leadId);

    return {
      opens,
      firstOpenAt,
      lastOpenAt,
      clicks,
      clickedLinks: linkClicks.map((l: any) => l.link_url),
      lastClickAt,
      bounced,
      complained,
      engagementScore,
      lastActivity: lastActivityEvent?.timestamp || null,
    };
  } catch (error) {
    console.error("[ENGAGEMENT] Failed to get metrics:", error);
    return {
      opens: 0,
      firstOpenAt: null,
      clicks: 0,
      clickedLinks: [],
      lastClickAt: null,
      bounced: false,
      complained: false,
      engagementScore: 0,
      lastOpenAt: null,
      lastActivity: null,
    };
  }
}

/**
 * Time since last engagement (human readable)
 */
export function timeSinceLastEngagement(lastActivityAt: string | null): string {
  if (!lastActivityAt) return "Never";

  const now = new Date();
  const then = new Date(lastActivityAt);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}
