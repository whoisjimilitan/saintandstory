import { neon } from "@neondatabase/serverless";

/**
 * Mission ROI Tracking
 *
 * For each discovery mission, track:
 * - Businesses discovered
 * - Qualified
 * - Converted to leads
 * - Converted to customers (standing orders)
 * - Revenue generated
 * - ROI metrics
 *
 * Used for: Mission performance analysis, discovery optimization
 * DORMANT: Data collection only
 */

export interface MissionROI {
  mission_id: string;
  niche: string;
  locations: string[];
  discovered_count: number;
  qualified_count: number;
  leads_created_count: number;
  converted_count: number;
  revenue_generated: number;
  cost_estimate: number; // Based on discovered count
  roi_percent: number;
  discovery_efficiency: number; // Qualified / discovered
  conversion_funnel: {
    discovered_to_qualified: number;
    qualified_to_leads: number;
    leads_to_converted: number;
  };
  status: "active" | "paused" | "completed";
  last_discovery: string | null;
  created_at: string;
}

/**
 * Calculate ROI for a discovery mission
 */
export async function getMissionROI(
  sql: any,
  missionId: string
): Promise<MissionROI | null> {
  try {
    const mission = await sql`
      SELECT id, niche, locations, enabled, created_at, last_discovery
      FROM b2b_discovery_config
      WHERE id = ${missionId}
      LIMIT 1
    `;

    if (!mission || mission.length === 0) {
      return null;
    }

    const m = mission[0];

    // Count discovered
    const discovered = await sql`
      SELECT COUNT(*) as count
      FROM discovered_businesses
      WHERE mission_id = ${missionId}
    `;

    // Count qualified
    const qualified = await sql`
      SELECT COUNT(*) as count
      FROM qualified_businesses qb
      JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      WHERE db.mission_id = ${missionId}
    `;

    // Count leads created
    const leadsCreated = await sql`
      SELECT COUNT(*) as count
      FROM b2b_leads l
      JOIN discovered_businesses db ON l.qualified_business_id IS NOT NULL
      WHERE db.mission_id = ${missionId}
    `;

    // Count converted
    const converted = await sql`
      SELECT COUNT(DISTINCT l.id) as count
      FROM b2b_leads l
      JOIN b2b_standing_orders so ON l.id = so.lead_id
      JOIN discovered_businesses db ON l.qualified_business_id IS NOT NULL
      WHERE db.mission_id = ${missionId}
    `;

    // Revenue
    const revenue = await sql`
      SELECT COALESCE(SUM(so.price), 0) as total
      FROM b2b_standing_orders so
      JOIN b2b_leads l ON so.lead_id = l.id
      JOIN discovered_businesses db ON l.qualified_business_id IS NOT NULL
      WHERE db.mission_id = ${missionId}
    `;

    const discoveredCount = (discovered[0] as any).count || 0;
    const qualifiedCount = (qualified[0] as any).count || 0;
    const leadsCount = (leadsCreated[0] as any).count || 0;
    const convertedCount = (converted[0] as any).count || 0;
    const revenueGenerated = parseFloat((revenue[0] as any).total || 0);

    // Estimate cost (rough: £50 per Google Maps discovery)
    const costEstimate = discoveredCount * 50;

    // Calculate ROI
    const roi = costEstimate > 0 ? ((revenueGenerated - costEstimate) / costEstimate) * 100 : 0;

    return {
      mission_id: missionId,
      niche: m.niche,
      locations: m.locations,
      discovered_count: discoveredCount,
      qualified_count: qualifiedCount,
      leads_created_count: leadsCount,
      converted_count: convertedCount,
      revenue_generated: revenueGenerated,
      cost_estimate: costEstimate,
      roi_percent: roi,
      discovery_efficiency:
        discoveredCount > 0 ? qualifiedCount / discoveredCount : 0,
      conversion_funnel: {
        discovered_to_qualified:
          discoveredCount > 0 ? qualifiedCount / discoveredCount : 0,
        qualified_to_leads:
          qualifiedCount > 0 ? leadsCount / qualifiedCount : 0,
        leads_to_converted:
          leadsCount > 0 ? convertedCount / leadsCount : 0,
      },
      status: m.enabled ? "active" : "paused",
      last_discovery: m.last_discovery,
      created_at: m.created_at,
    };
  } catch (error) {
    console.error("[MISSION-ROI] Error calculating ROI:", error);
    return null;
  }
}

/**
 * Get all mission ROIs
 */
export async function getAllMissionROIs(sql: any): Promise<MissionROI[]> {
  try {
    const missions = await sql`
      SELECT id
      FROM b2b_discovery_config
      ORDER BY created_at DESC
    `;

    const rois = await Promise.all(
      missions.map(async (m: any) => getMissionROI(sql, m.id))
    );

    return rois.filter((roi) => roi !== null) as MissionROI[];
  } catch (error) {
    console.error("[MISSION-ROI] Error getting all ROIs:", error);
    return [];
  }
}

/**
 * Get missions ranked by ROI performance
 */
export async function getMissionsByROI(sql: any): Promise<MissionROI[]> {
  try {
    const all = await getAllMissionROIs(sql);
    return all.sort((a, b) => b.roi_percent - a.roi_percent);
  } catch (error) {
    console.error("[MISSION-ROI] Error ranking by ROI:", error);
    return [];
  }
}

/**
 * Get high-performing missions (ROI > 100%)
 */
export async function getHighPerformingMissions(sql: any): Promise<MissionROI[]> {
  try {
    const all = await getAllMissionROIs(sql);
    return all.filter((m) => m.roi_percent > 100);
  } catch (error) {
    console.error("[MISSION-ROI] Error getting high performers:", error);
    return [];
  }
}

/**
 * Get underperforming missions (ROI < 0%)
 */
export async function getUnderperformingMissions(sql: any): Promise<MissionROI[]> {
  try {
    const all = await getAllMissionROIs(sql);
    return all.filter((m) => m.roi_percent < 0 && m.discovered_count >= 5);
  } catch (error) {
    console.error("[MISSION-ROI] Error getting underperformers:", error);
    return [];
  }
}
