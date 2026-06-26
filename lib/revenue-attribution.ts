import { neon } from "@neondatabase/serverless";

/**
 * Revenue Attribution System
 *
 * Tracks full customer journey:
 * Discovery Mission → Lead Created → Email Sent → Engagement → Standing Order
 *
 * For every customer, shows:
 * - How they were discovered (mission, inbound, manual)
 * - First contact date
 * - Engagement timeline
 * - Conversion date and revenue
 *
 * Used for: Attribution, channel analysis, journey mapping
 * DORMANT: Data collection only
 */

export interface CustomerJourney {
  lead_id: string;
  business_name: string;
  business_category: string;

  // Discovery
  discovery_source: "discovery_mission" | "inbound" | "manual" | "unknown";
  discovery_mission: string | null;
  discovered_at: string | null;

  // Lead creation
  qualified_at: string | null;
  opportunity_score: number;

  // First contact
  first_email_sent_at: string | null;
  first_email_type: string | null;

  // Engagement
  first_opened_at: string | null;
  first_clicked_at: string | null;
  total_opens: number;
  total_clicks: number;

  // Reply/conversation
  replied_at: string | null;
  days_to_reply: number | null;

  // Conversion
  standing_order_created_at: string | null;
  revenue_generated: number;
  days_to_conversion: number | null;

  // Journey summary
  total_days: number;
  touches: number; // Count of email interactions
  journey_stages: string[];
}

/**
 * Get full attribution journey for a customer
 */
export async function getCustomerJourney(
  sql: any,
  leadId: string
): Promise<CustomerJourney | null> {
  try {
    // Get lead details
    const leads = await sql`
      SELECT
        id, business_name, business_category, source, created_at,
        opportunity_score, last_engagement_at
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `;

    if (!leads || leads.length === 0) {
      return null;
    }

    const lead = leads[0];

    // Get outreach timeline
    const outreach = await sql`
      SELECT sent_at, email_type, replied, replied_at
      FROM b2b_outreach
      WHERE lead_id = ${leadId}
      ORDER BY sent_at ASC
    `;

    // Get engagement events
    const events = await sql`
      SELECT event_type, timestamp
      FROM b2b_email_events
      WHERE lead_id = ${leadId}
      ORDER BY timestamp ASC
    `;

    // Get standing order (conversion)
    const standingOrders = await sql`
      SELECT created_at, price
      FROM b2b_standing_orders
      WHERE lead_id = ${leadId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // Parse discovery source
    let discoverySource: "discovery_mission" | "inbound" | "manual" | "unknown" = "unknown";
    let discoveryMission = null;

    if (lead.source === "discovery_promoted" || lead.source === "discovery") {
      discoverySource = "discovery_mission";
      // Try to find mission info
      const missionInfo = await sql`
        SELECT niche, locations
        FROM b2b_discovery_config dc
        WHERE dc.niche ILIKE lead.niche OR dc.locations @> ARRAY[${lead.city}]
        LIMIT 1
      `;
      if (missionInfo && missionInfo.length > 0) {
        discoveryMission = `${missionInfo[0].niche} (${missionInfo[0].locations.join(", ")})`;
      }
    } else if (lead.source === "inbound") {
      discoverySource = "inbound";
    } else if (lead.source === "manual") {
      discoverySource = "manual";
    }

    // Calculate metrics
    const firstEmailSent = outreach.length > 0 ? outreach[0].sent_at : null;
    const firstOpened = events.find((e: any) => e.event_type === "opened")?.timestamp;
    const firstClicked = events.find((e: any) => e.event_type === "clicked")?.timestamp;
    const totalOpens = events.filter((e: any) => e.event_type === "opened").length;
    const totalClicks = events.filter((e: any) => e.event_type === "clicked").length;

    const repliedAt = outreach.find((o: any) => o.replied)?.replied_at || null;
    let daysToReply = null;
    if (repliedAt && firstEmailSent) {
      daysToReply = Math.floor(
        (new Date(repliedAt).getTime() - new Date(firstEmailSent).getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    // Conversion metrics
    const conversionDate = standingOrders.length > 0 ? standingOrders[0].created_at : null;
    const revenue = standingOrders.length > 0 ? standingOrders[0].price : 0;

    let daysToConversion = null;
    if (conversionDate) {
      daysToConversion = Math.floor(
        (new Date(conversionDate).getTime() - new Date(lead.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    // Get last engagement timestamp
    const lastEngagement = lead.last_engagement_at;

    // Total journey time
    const journeyEndDate = conversionDate || lastEngagement || new Date().toISOString();
    const totalDays = Math.floor(
      (new Date(journeyEndDate).getTime() - new Date(lead.created_at).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Journey stages completed
    const journeyStages = [];
    journeyStages.push("discovered");
    if (firstEmailSent) journeyStages.push("contacted");
    if (firstOpened) journeyStages.push("opened");
    if (firstClicked) journeyStages.push("clicked");
    if (repliedAt) journeyStages.push("replied");
    if (conversionDate) journeyStages.push("converted");

    return {
      lead_id: leadId,
      business_name: lead.business_name,
      business_category: lead.business_category,

      discovery_source: discoverySource,
      discovery_mission: discoveryMission,
      discovered_at: lead.created_at,

      qualified_at: lead.created_at, // Approximation
      opportunity_score: lead.opportunity_score || 0,

      first_email_sent_at: firstEmailSent,
      first_email_type: outreach.length > 0 ? outreach[0].email_type : null,

      first_opened_at: firstOpened,
      first_clicked_at: firstClicked,
      total_opens: totalOpens,
      total_clicks: totalClicks,

      replied_at: repliedAt,
      days_to_reply: daysToReply,

      standing_order_created_at: conversionDate,
      revenue_generated: revenue,
      days_to_conversion: daysToConversion,

      total_days: totalDays,
      touches: outreach.length + events.length,
      journey_stages: journeyStages,
    };
  } catch (error) {
    console.error("[REVENUE-ATTRIBUTION] Error getting journey:", error);
    return null;
  }
}

/**
 * Get all customer journeys
 */
export async function getAllCustomerJourneys(
  sql: any
): Promise<CustomerJourney[]> {
  try {
    // Get all leads that converted
    const converted = await sql`
      SELECT DISTINCT l.id
      FROM b2b_leads l
      JOIN b2b_standing_orders so ON l.id = so.lead_id
      ORDER BY so.created_at DESC
    `;

    const journeys = await Promise.all(
      converted.map(async (row: any) => getCustomerJourney(sql, row.id))
    );

    return journeys.filter((j) => j !== null) as CustomerJourney[];
  } catch (error) {
    console.error("[REVENUE-ATTRIBUTION] Error getting all journeys:", error);
    return [];
  }
}

/**
 * Get attribution summary by discovery source
 */
export async function getAttributionBySource(
  sql: any
): Promise<
  Record<
    string,
    {
      journeys: number;
      revenue: number;
      avg_days_to_conversion: number;
    }
  >
> {
  try {
    const allJourneys = await getAllCustomerJourneys(sql);

    const bySource: Record<
      string,
      {
        journeys: number;
        revenue: number;
        avg_days_to_conversion: number;
      }
    > = {};

    for (const journey of allJourneys) {
      const source = journey.discovery_source;

      if (!bySource[source]) {
        bySource[source] = {
          journeys: 0,
          revenue: 0,
          avg_days_to_conversion: 0,
        };
      }

      bySource[source].journeys += 1;
      bySource[source].revenue += journey.revenue_generated;
      if (journey.days_to_conversion) {
        bySource[source].avg_days_to_conversion +=
          journey.days_to_conversion;
      }
    }

    // Calculate averages
    for (const source in bySource) {
      if (bySource[source].journeys > 0) {
        bySource[source].avg_days_to_conversion = Math.round(
          bySource[source].avg_days_to_conversion /
            bySource[source].journeys
        );
      }
    }

    return bySource;
  } catch (error) {
    console.error("[REVENUE-ATTRIBUTION] Error getting source attribution:", error);
    return {};
  }
}
