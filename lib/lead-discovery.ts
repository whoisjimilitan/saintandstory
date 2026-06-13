import { neon } from "@neondatabase/serverless";
import { type Lead } from "@/lib/b2b-types";

/**
 * Find B2B leads within driver's service radius
 * Uses PostGIS ST_DWithin for efficient geospatial queries
 */
export async function findNearbyLeads(
  driverId: string,
  postcode: string,
  latitude: number,
  longitude: number,
  radius_miles: number
): Promise<Lead[]> {
  if (!process.env.DATABASE_URL) return [];

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Query leads within radius that:
    // - Have not been sent recognition email by this driver yet
    // - Have valid email and pain signals
    // - Are not already closed/dead status
    const leads = await sql`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.business_category,
        l.email,
        l.city,
        l.postcode,
        l.pain_point,
        l.pain_point_review,
        l.review_rating,
        l.status,
        l.lead_state,
        l.created_at,
        l.source,
        l.latitude,
        l.longitude,
        l.driver_id,
        l.email_sent_at
      FROM b2b_leads l
      WHERE
        -- Within driver's service radius using PostGIS
        ST_DWithin(
          geography(ST_MakePoint(l.longitude, l.latitude)),
          geography(ST_MakePoint(${longitude}, ${latitude})),
          ${radius_miles} * 1609.34  -- convert miles to meters
        )
        -- Not yet contacted by this driver
        AND (l.driver_id IS NULL OR l.driver_id != ${driverId})
        -- Has valid email (can contact)
        AND l.email IS NOT NULL
        -- Not already closed/dead
        AND l.status NOT IN ('closed', 'dead')
        -- Prioritize leads with pain signals
        AND l.pain_point IS NOT NULL
        -- Gate outreach to active tiers (A/B only)
        AND (l.lead_tier IS NULL OR l.lead_tier IN ('A', 'B'))
      ORDER BY
        l.pain_point DESC,
        l.review_rating ASC,
        l.created_at DESC
      LIMIT 50
    `;

    return leads as Lead[];
  } catch (error) {
    console.error("[Lead Discovery] Error finding nearby leads:", error);
    return [];
  }
}

/**
 * Find leads for bulk discovery (for multiple drivers)
 * Returns leads by proximity to driver's postcode
 */
export async function findLeadsForDriver(
  driverId: string,
  latitude: number,
  longitude: number,
  radius_miles: number
): Promise<Lead[]> {
  return findNearbyLeads(driverId, "", latitude, longitude, radius_miles);
}

/**
 * Get discovery metrics for a driver
 */
export async function getDiscoveryMetrics(driverId: string) {
  if (!process.env.DATABASE_URL) return null;

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`
      SELECT
        COUNT(*) as total_discovered,
        COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL) as emails_sent,
        COUNT(*) FILTER (WHERE pain_point IS NOT NULL) as pain_signals,
        COUNT(*) FILTER (WHERE status = 'warm') as warm_leads,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_leads
      FROM b2b_leads
      WHERE driver_id = ${driverId}
    `;

    return result[0];
  } catch (error) {
    console.error("[Lead Discovery] Error fetching metrics:", error);
    return null;
  }
}
