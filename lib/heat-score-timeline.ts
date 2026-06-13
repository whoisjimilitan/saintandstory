import { neon } from "@neondatabase/serverless";
import { calculateHeatScore } from "@/lib/heat-score";

/**
 * Heat Score Timeline Tracking
 *
 * Records daily snapshots of heat scores to track:
 * - Prospects heating up (increasing heat)
 * - Prospects cooling down (decreasing heat)
 * - Heat score movement patterns
 *
 * Used for: Identifying momentum, trend analysis
 */

/**
 * Record today's heat score snapshot for all leads
 * Called once daily (via cron or manual trigger)
 */
export async function recordDailyHeatScoreSnapshot(
  sql: any
): Promise<{ recorded: number; errors: string[] }> {
  try {
    const leads = await sql`
      SELECT id
      FROM b2b_leads
      WHERE status NOT IN ('dead')
      LIMIT 500
    `;

    let recorded = 0;
    const errors: string[] = [];

    for (const lead of leads) {
      try {
        const breakdown = await calculateHeatScore(sql, lead.id);

        await sql`
          INSERT INTO b2b_heat_score_history (
            lead_id, heat_score, engagement_score, qualification_score, intent_score
          ) VALUES (
            ${lead.id},
            ${breakdown.heat_score},
            ${breakdown.engagement_score},
            ${breakdown.business_fit_score},
            ${breakdown.intent_signals_score}
          )
        `;

        recorded++;
      } catch (err) {
        errors.push(`Lead ${lead.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`[HEAT-TIMELINE] Recorded ${recorded} snapshots`);
    return { recorded, errors };
  } catch (error) {
    console.error("[HEAT-TIMELINE] Error recording snapshot:", error);
    return { recorded: 0, errors: [String(error)] };
  }
}

/**
 * Get heat score movement for a lead
 * Shows if it's heating up, cooling down, or stable
 */
export async function getHeatScoreMovement(
  sql: any,
  leadId: string
): Promise<{
  current_heat: number;
  heat_24h_ago: number | null;
  heat_7d_ago: number | null;
  trend: "heating_up" | "cooling_down" | "stable";
  momentum: number;
  history: Array<{ date: string; heat_score: number }>;
}> {
  try {
    const history = await sql`
      SELECT heat_score, recorded_at
      FROM b2b_heat_score_history
      WHERE lead_id = ${leadId}
      ORDER BY recorded_at DESC
      LIMIT 30
    `;

    if (history.length === 0) {
      return {
        current_heat: 0,
        heat_24h_ago: null,
        heat_7d_ago: null,
        trend: "stable",
        momentum: 0,
        history: [],
      };
    }

    const now = new Date();
    const day24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day7dAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const currentHeat = history[0].heat_score;
    const heat24hAgo = history.find(
      (h: any) => new Date(h.recorded_at) < day24hAgo
    )?.heat_score || null;
    const heat7dAgo = history.find(
      (h: any) => new Date(h.recorded_at) < day7dAgo
    )?.heat_score || null;

    // Calculate trend
    let trend: "heating_up" | "cooling_down" | "stable" = "stable";
    let momentum = 0;

    if (heat24hAgo !== null) {
      momentum = currentHeat - heat24hAgo;
      if (momentum > 5) trend = "heating_up";
      else if (momentum < -5) trend = "cooling_down";
    }

    // Format history for display
    const formattedHistory = history
      .reverse()
      .map((h: any) => ({
        date: new Date(h.recorded_at).toLocaleDateString(),
        heat_score: h.heat_score,
      }));

    return {
      current_heat: currentHeat,
      heat_24h_ago: heat24hAgo,
      heat_7d_ago: heat7dAgo,
      trend,
      momentum,
      history: formattedHistory,
    };
  } catch (error) {
    console.error("[HEAT-TIMELINE] Error getting movement:", error);
    return {
      current_heat: 0,
      heat_24h_ago: null,
      heat_7d_ago: null,
      trend: "stable",
      momentum: 0,
      history: [],
    };
  }
}

/**
 * Get prospects heating up fastest
 * Shows most improved prospects
 */
export async function getHeatingUpProspects(
  sql: any,
  limit: number = 10
): Promise<
  Array<{
    lead_id: string;
    business_name: string;
    current_heat: number;
    momentum: number;
    trend: string;
  }>
> {
  try {
    // Get latest heat scores
    const latest = await sql`
      SELECT DISTINCT ON (lead_id) lead_id, heat_score, recorded_at
      FROM b2b_heat_score_history
      ORDER BY lead_id, recorded_at DESC
    `;

    // Get 24h ago snapshots
    const day24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const previous = await sql`
      SELECT lead_id, heat_score
      FROM b2b_heat_score_history
      WHERE recorded_at < ${day24hAgo}
      ORDER BY lead_id, recorded_at DESC
    `;

    // Calculate momentum
    const movements = latest
      .map((curr: any) => {
        const prev = previous.find((p: any) => p.lead_id === curr.lead_id);
        return {
          lead_id: curr.lead_id,
          current_heat: curr.heat_score,
          momentum: prev ? curr.heat_score - prev.heat_score : 0,
        };
      })
      .filter((m: any) => m.momentum > 5)
      .sort((a: any, b: any) => b.momentum - a.momentum)
      .slice(0, limit);

    // Get business names
    const result = await Promise.all(
      movements.map(async (m: any) => {
        const lead = await sql`
          SELECT business_name
          FROM b2b_leads
          WHERE id = ${m.lead_id}
          LIMIT 1
        `;

        return {
          lead_id: m.lead_id,
          business_name: lead[0]?.business_name || "Unknown",
          current_heat: m.current_heat,
          momentum: m.momentum,
          trend: "🔥 Heating up",
        };
      })
    );

    return result;
  } catch (error) {
    console.error("[HEAT-TIMELINE] Error getting heating up prospects:", error);
    return [];
  }
}

/**
 * Get prospects cooling down
 * Shows prospects losing engagement
 */
export async function getCoolingDownProspects(
  sql: any,
  limit: number = 10
): Promise<
  Array<{
    lead_id: string;
    business_name: string;
    current_heat: number;
    momentum: number;
    trend: string;
  }>
> {
  try {
    const latest = await sql`
      SELECT DISTINCT ON (lead_id) lead_id, heat_score
      FROM b2b_heat_score_history
      ORDER BY lead_id, recorded_at DESC
    `;

    const day24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const previous = await sql`
      SELECT lead_id, heat_score
      FROM b2b_heat_score_history
      WHERE recorded_at < ${day24hAgo}
      ORDER BY lead_id, recorded_at DESC
    `;

    const movements = latest
      .map((curr: any) => {
        const prev = previous.find((p: any) => p.lead_id === curr.lead_id);
        return {
          lead_id: curr.lead_id,
          current_heat: curr.heat_score,
          momentum: prev ? curr.heat_score - prev.heat_score : 0,
        };
      })
      .filter((m: any) => m.momentum < -5)
      .sort((a: any, b: any) => a.momentum - b.momentum)
      .slice(0, limit);

    const result = await Promise.all(
      movements.map(async (m: any) => {
        const lead = await sql`
          SELECT business_name
          FROM b2b_leads
          WHERE id = ${m.lead_id}
          LIMIT 1
        `;

        return {
          lead_id: m.lead_id,
          business_name: lead[0]?.business_name || "Unknown",
          current_heat: m.current_heat,
          momentum: m.momentum,
          trend: "❄️ Cooling down",
        };
      })
    );

    return result;
  } catch (error) {
    console.error("[HEAT-TIMELINE] Error getting cooling down prospects:", error);
    return [];
  }
}
