/**
 * POSTCODE INTELLIGENCE
 *
 * Computed nightly from existing data.
 * Postcode becomes the intelligence nucleus connecting:
 * - Acquisition (businesses discovered + qualified in postcode)
 * - Recruitment (driver density + shortage)
 * - Operations (journey demand + capacity)
 * - Revenue (total standing order value)
 *
 * No new persistence layer. Cached in memory or Redis.
 */

export interface PostcodeIntelligence {
  postcode: string;
  business_opportunity_score: number; // avg opportunity_score in postcode
  driver_capacity_score: number; // driver count + shortage ratio
  journey_demand_score: number; // journey volume in postcode
  revenue_potential_score: number; // total standing order value
  businesses_discovered: number;
  businesses_qualified: number;
  active_drivers: number;
  driver_shortage: number; // (qualified_businesses count * 0.3) - driver count
  total_journey_demand: number;
  total_revenue_potential: number;
  last_calculated_at: string;
}

export async function computePostcodeIntelligence(
  sql: any,
  postcode: string
): Promise<PostcodeIntelligence | null> {
  try {
    // Acquisition intelligence: businesses discovered + qualified in postcode
    const acquisitionData = (await sql`
      SELECT
        COUNT(*) as total_discovered,
        SUM(CASE WHEN qb.id IS NOT NULL THEN 1 ELSE 0 END) as total_qualified,
        COALESCE(AVG(qb.opportunity_score), 0) as avg_opportunity_score
      FROM discovered_businesses db
      LEFT JOIN qualified_businesses qb ON db.id = qb.discovered_business_id
      WHERE db.postcode = ${postcode}
    `) as Array<{
      total_discovered: number;
      total_qualified: number;
      avg_opportunity_score: number;
    }>;

    // Driver intelligence: density + shortage
    const driverData = (await sql`
      SELECT
        COUNT(*) as active_driver_count
      FROM drivers
      WHERE postcode = ${postcode} AND active = true
    `) as Array<{ active_driver_count: number }>;

    // Operational intelligence: journey demand
    const demandData = (await sql`
      SELECT
        COUNT(*) as journey_count,
        COALESCE(SUM(price), 0) as total_value
      FROM b2b_standing_orders
      WHERE pickup_postcode = ${postcode} AND active = true
    `) as Array<{ journey_count: number; total_value: number }>;

    const acq = acquisitionData[0] || {};
    const drivers = driverData[0] || { active_driver_count: 0 };
    const demand = demandData[0] || { journey_count: 0, total_value: 0 };

    // Calculate driver shortage (jobs per driver ratio)
    const jobsPerDriver = drivers.active_driver_count > 0
      ? demand.journey_count / drivers.active_driver_count
      : demand.journey_count;
    const driverShortage = Math.max(0, (acq.total_qualified || 0) * 0.3 - (drivers.active_driver_count || 0));

    // Score calculations (0-100 scale)
    const businessOpportunitiesScore = Math.min(100, (acq.avg_opportunity_score || 0));
    const driverCapacityScore = Math.max(0, 100 - (driverShortage * 10)); // decreases as shortage increases
    const journeyDemandScore = Math.min(100, (demand.journey_count || 0) * 5); // 1 journey = 5 points
    const revenuePotentialScore = Math.min(100, ((demand.total_value || 0) / 1000) * 10); // £1000 = 10 points

    return {
      postcode,
      business_opportunity_score: Math.round(businessOpportunitiesScore),
      driver_capacity_score: Math.round(driverCapacityScore),
      journey_demand_score: Math.round(journeyDemandScore),
      revenue_potential_score: Math.round(revenuePotentialScore),
      businesses_discovered: acq.total_discovered || 0,
      businesses_qualified: acq.total_qualified || 0,
      active_drivers: drivers.active_driver_count || 0,
      driver_shortage: Math.max(0, driverShortage),
      total_journey_demand: demand.journey_count || 0,
      total_revenue_potential: demand.total_value || 0,
      last_calculated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Postcode Intelligence] Error computing for ${postcode}:`, error);
    return null;
  }
}

export async function computeAllPostcodeIntelligence(
  sql: any
): Promise<PostcodeIntelligence[]> {
  try {
    // Get all unique postcodes from discovered_businesses
    const postcodes = (await sql`
      SELECT DISTINCT postcode FROM discovered_businesses WHERE postcode IS NOT NULL
      UNION
      SELECT DISTINCT pickup_postcode as postcode FROM b2b_standing_orders WHERE pickup_postcode IS NOT NULL
      UNION
      SELECT DISTINCT postcode FROM drivers WHERE postcode IS NOT NULL
    `) as Array<{ postcode: string }>;

    const intelligence: PostcodeIntelligence[] = [];

    for (const row of postcodes) {
      const result = await computePostcodeIntelligence(sql, row.postcode);
      if (result) {
        intelligence.push(result);
      }
    }

    return intelligence;
  } catch (error) {
    console.error("[Postcode Intelligence] Error computing all postcodes:", error);
    return [];
  }
}
