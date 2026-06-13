/**
 * PRISMA → PHASE 4 BRIDGE
 *
 * Connects Prisma-discovered businesses to the Phase 4 revenue qualification pipeline.
 * Only processes businesses not yet qualified (self-healing with NOT EXISTS query).
 * Protected by UNIQUE constraints:
 * - qualified_businesses(discovered_business_id)
 * - b2b_leads(qualified_business_id)
 */

import { neon } from "@neondatabase/serverless";
import { runFullPipeline, RawBusinessDiscovery } from "./four-layer-pipeline";

export interface BridgeResult {
  totalProcessed: number;
  discovered: number;
  qualified: number;
  promoted: number;
  errors: Array<{ placeId: string; error: string }>;
}

/**
 * Process unqualified discovered businesses through Phase 4 pipeline
 * Uses NOT EXISTS query for self-healing deduplication
 */
export async function processUnqualifiedBusinesses(
  limit: number = 25
): Promise<BridgeResult> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  const result: BridgeResult = {
    totalProcessed: 0,
    discovered: 0,
    qualified: 0,
    promoted: 0,
    errors: [],
  };

  try {
    // Self-healing query: Only get businesses not yet qualified
    const unqualifiedBusinesses = await sql`
      SELECT
        db.id,
        db.google_place_id,
        db.business_name,
        db.address,
        db.postcode,
        db.category,
        db.source,
        db.raw_data
      FROM discovered_businesses db
      LEFT JOIN qualified_businesses qb
        ON qb.discovered_business_id = db.id
      WHERE qb.discovered_business_id IS NULL
      LIMIT ${limit}
    `;

    console.log(`[Bridge] Found ${unqualifiedBusinesses.length} unqualified businesses to process\n`);
    result.totalProcessed = unqualifiedBusinesses.length;

    // Process each business
    for (const business of unqualifiedBusinesses) {
      try {
        // Fetch reviews for this discovered business
        const reviews = await sql`
          SELECT rating, text, author, time
          FROM reviews
          WHERE discovered_business_id = ${business.id}
          LIMIT 50
        `;

        // Build RawBusinessDiscovery adapter
        const rawDiscovery: RawBusinessDiscovery = {
          placeId: business.google_place_id,
          name: business.business_name,
          address: business.address || "",
          postcode: business.postcode,
          category: business.category,
          source: business.source || "discovery",
          reviews: (reviews as any[]).map((r: any) => ({
            rating: r.rating,
            text: r.text,
            author: r.author,
            time: r.time,
          })),
          rawData: business.raw_data,
        };

        // Run through Phase 4 pipeline
        const pipelineResult = await runFullPipeline(sql, rawDiscovery);

        if (pipelineResult.discovered) result.discovered++;
        if (pipelineResult.qualified) result.qualified++;
        if (pipelineResult.promoted) result.promoted++;

        console.log(
          `[Bridge] ✓ ${business.business_name} - D:${pipelineResult.discovered ? '✓' : '✗'} Q:${pipelineResult.qualified ? '✓' : '✗'} P:${pipelineResult.promoted ? '✓' : '✗'}`
        );
      } catch (error) {
        result.errors.push({
          placeId: business.google_place_id,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`[Bridge] ✗ ${business.business_name}: ${error}`);
      }
    }

  } catch (error) {
    console.error("[Bridge] Fatal error:", error);
    throw error;
  }

  return result;
}

/**
 * Batch process with progress reporting
 */
export async function processInBatches(
  batchSize: number = 25,
  maxBatches?: number
): Promise<void> {
  let batchCount = 0;
  let totalProcessed = 0;
  let totalQualified = 0;
  let totalPromoted = 0;

  console.log(`\n[Bridge] Starting batch processing (batch size: ${batchSize})\n`);

  while (true) {
    batchCount++;

    if (maxBatches && batchCount > maxBatches) {
      console.log(`[Bridge] Reached max batches (${maxBatches})\n`);
      break;
    }

    console.log(`[Bridge] === BATCH ${batchCount} ===\n`);

    const result = await processUnqualifiedBusinesses(batchSize);

    if (result.totalProcessed === 0) {
      console.log("[Bridge] No more unqualified businesses. Processing complete.\n");
      break;
    }

    totalProcessed += result.totalProcessed;
    totalQualified += result.qualified;
    totalPromoted += result.promoted;

    console.log(`[Bridge] Batch ${batchCount} complete:`);
    console.log(`  Processed: ${result.totalProcessed}`);
    console.log(`  Qualified: ${result.qualified}`);
    console.log(`  Promoted: ${result.promoted}`);
    console.log(`  Errors: ${result.errors.length}\n`);

    if (result.errors.length > 0) {
      console.log("[Bridge] Errors in this batch:");
      for (const err of result.errors) {
        console.log(`  - ${err.placeId}: ${err.error}`);
      }
      console.log("");
    }
  }

  console.log("[Bridge] === SUMMARY ===");
  console.log(`  Total Processed: ${totalProcessed}`);
  console.log(`  Total Qualified: ${totalQualified}`);
  console.log(`  Total Promoted: ${totalPromoted}\n`);
}
