/**
 * Research Missions Engine
 *
 * Operator-defined discovery tasks that feed into the four-layer pipeline.
 *
 * Flow:
 * Research Mission
 *   ↓ Execute Discovery (find all candidates)
 *   ↓ Feed to discovered_businesses
 *   ↓ Trigger enrichment
 *   ↓ Trigger qualification
 *   ↓ Automatic lead promotion if score ≥ threshold
 *
 * Key: Mission finds all candidates, no filtering at discovery time.
 */

import { searchByLocationAndTerms } from "./google-places";
import { runFullPipeline } from "./four-layer-pipeline";
import type { RawBusinessDiscovery } from "./four-layer-pipeline";

export interface ResearchMission {
  id: string;
  name: string;
  mission_type: "geography" | "sector" | "postcode" | "custom" | "ai_research";
  prompt?: string;
  discovery_strategy: {
    search_terms: string[];
    locations: string[];
    postcodes?: string[];
    filters?: Record<string, any>;
  };
  source: string;
  status: string;
  created_by: string;
  created_at: string;
}

/**
 * Create a research mission
 */
export async function createResearchMission(
  sql: any,
  mission: {
    name: string;
    mission_type: string;
    prompt?: string;
    discovery_strategy: any;
    created_by: string;
  }
): Promise<string> {
  const result = await sql`
    INSERT INTO research_missions (
      name, mission_type, prompt, discovery_strategy,
      source, status, created_by
    ) VALUES (
      ${mission.name}, ${mission.mission_type}, ${mission.prompt || null},
      ${JSON.stringify(mission.discovery_strategy)},
      'operator', 'pending', ${mission.created_by}
    )
    RETURNING id
  `;

  return (result[0] as any).id;
}

/**
 * Execute research mission
 * Discovers, enriches, qualifies, and promotes businesses
 */
export async function executeResearchMission(
  sql: any,
  missionId: string,
  apiKey: string,
  promoteIfScoreAbove: number = 40
): Promise<{
  success: boolean;
  discovered: number;
  qualified: number;
  promoted: number;
  error?: string;
}> {
  try {
    // Get mission
    const missions = (await sql`
      SELECT * FROM research_missions WHERE id = ${missionId}
    `) as ResearchMission[];

    if (missions.length === 0) {
      return { success: false, discovered: 0, qualified: 0, promoted: 0, error: "Mission not found" };
    }

    const mission = missions[0];
    const strategy = mission.discovery_strategy;

    // Mark as running
    await sql`UPDATE research_missions SET status = 'running', started_at = NOW() WHERE id = ${missionId}`;

    let totalDiscovered = 0;
    let totalQualified = 0;
    let totalPromoted = 0;
    const errors: string[] = [];

    // Execute based on mission type
    if (mission.mission_type === "postcode" && strategy.postcodes) {
      // Postcode-based mission
      for (const postcode of strategy.postcodes) {
        try {
          const results = await searchByLocationAndTerms(
            postcode,
            strategy.search_terms,
            apiKey
          );

          for (const result of results) {
            const business: RawBusinessDiscovery = {
              placeId: result.place_id,
              name: result.name,
              address: result.formatted_address || "",
              postcode,
              category: strategy.filters?.category || "research_discovery",
              source: "research_mission",
              reviews: result.reviews?.map((r: any) => ({
                rating: r.rating,
                text: r.text,
                author: r.author_name,
                time: r.time,
              })),
              website: result.website,
              phone: result.formatted_phone_number,
              rating: result.rating,
              reviewCount: result.review_count,
              rawData: result,
            };

            // Run four-layer pipeline
            const pipelineResult = await runFullPipeline(
              sql,
              business
            );

            if (pipelineResult.discovered) totalDiscovered++;
            if (pipelineResult.qualified) totalQualified++;
            if (pipelineResult.promoted) totalPromoted++;

            // Link to mission
            try {
              await sql`
                UPDATE discovered_businesses
                SET mission_id = ${missionId}
                WHERE google_place_id = ${business.placeId}
              `;
            } catch (e) {
              // Already linked or error, continue
            }
          }
        } catch (e) {
          const err = e instanceof Error ? e.message : String(e);
          errors.push(`Postcode ${postcode}: ${err}`);
          console.error(`[Research Mission] Error processing postcode:`, e);
        }
      }
    } else if (mission.mission_type === "geography" && strategy.locations) {
      // Geography-based mission
      for (const location of strategy.locations) {
        try {
          const results = await searchByLocationAndTerms(
            location,
            strategy.search_terms,
            apiKey
          );

          for (const result of results) {
            const business: RawBusinessDiscovery = {
              placeId: result.place_id,
              name: result.name,
              address: result.formatted_address || "",
              postcode: location,
              category: strategy.filters?.category || "research_discovery",
              source: "research_mission",
              reviews: result.reviews?.map((r: any) => ({
                rating: r.rating,
                text: r.text,
                author: r.author_name,
                time: r.time,
              })),
              website: result.website,
              phone: result.formatted_phone_number,
              rating: result.rating,
              reviewCount: result.review_count,
              rawData: result,
            };

            const pipelineResult = await runFullPipeline(
              sql,
              business
            );

            if (pipelineResult.discovered) totalDiscovered++;
            if (pipelineResult.qualified) totalQualified++;
            if (pipelineResult.promoted) totalPromoted++;

            try {
              await sql`
                UPDATE discovered_businesses
                SET mission_id = ${missionId}
                WHERE google_place_id = ${business.placeId}
              `;
            } catch (e) {
              // Already linked, continue
            }
          }
        } catch (e) {
          const err = e instanceof Error ? e.message : String(e);
          errors.push(`${location}: ${err}`);
          console.error(`[Research Mission] Error processing location:`, e);
        }
      }
    }

    // Mark as completed
    await sql`
      UPDATE research_missions
      SET status = 'completed',
          completed_at = NOW(),
          discoveries_found = ${totalDiscovered},
          businesses_qualified = ${totalQualified},
          leads_created = ${totalPromoted},
          results_summary = ${JSON.stringify({
            discovered: totalDiscovered,
            qualified: totalQualified,
            promoted: totalPromoted,
            errors: errors.length > 0 ? errors : null,
          })}
      WHERE id = ${missionId}
    `;

    return {
      success: true,
      discovered: totalDiscovered,
      qualified: totalQualified,
      promoted: totalPromoted,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Research Mission] Fatal error:`, error);

    try {
      await sql`
        UPDATE research_missions
        SET status = 'failed',
            completed_at = NOW(),
            error_message = ${errorMsg}
        WHERE id = ${missionId}
      `;
    } catch (e) {
      console.error("Error updating mission status:", e);
    }

    return {
      success: false,
      discovered: 0,
      qualified: 0,
      promoted: 0,
      error: errorMsg,
    };
  }
}

/**
 * Add opportunity signal to a discovered business
 */
export async function addOpportunitySignal(
  sql: any,
  discoveredBusinessId: string,
  signalType: string,
  scoreImpact: number = 5,
  description?: string,
  metadata?: any
): Promise<boolean> {
  try {
    await sql`
      INSERT INTO opportunity_signals (
        discovered_business_id, signal_type, signal_description,
        score_impact, source, metadata
      ) VALUES (
        ${discoveredBusinessId}, ${signalType}, ${description || null},
        ${scoreImpact}, 'operator', ${JSON.stringify(metadata || {})}
      )
    `;

    // Update qualified business score if exists
    const qualified = await sql`
      SELECT qb.id, qb.opportunity_score
      FROM qualified_businesses qb
      WHERE qb.discovered_business_id = ${discoveredBusinessId}
    `;

    if (qualified.length > 0) {
      const newScore = Math.min((qualified[0].opportunity_score || 0) + scoreImpact, 100);
      await sql`
        UPDATE qualified_businesses
        SET opportunity_score = ${newScore},
            updated_at = NOW()
        WHERE id = ${qualified[0].id}
      `;
    }

    return true;
  } catch (error) {
    console.error("[Research Missions] Error adding signal:", error);
    return false;
  }
}

/**
 * Get mission status
 */
export async function getMissionStatus(sql: any, missionId: string): Promise<ResearchMission | null> {
  const result = (await sql`
    SELECT * FROM research_missions WHERE id = ${missionId}
  `) as ResearchMission[];

  return result.length > 0 ? result[0] : null;
}
