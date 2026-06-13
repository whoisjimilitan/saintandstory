/**
 * PRISMA → PHASE 4 BRIDGE (CORRECTED)
 *
 * Connects Prisma discovery layer to Phase 4 revenue qualification.
 *
 * Data flow:
 * Business (Prisma) → discovered_businesses → runFullPipeline()
 *     ↓
 * qualified_businesses → promoteToLead() → b2b_leads
 *     ↓
 * Recognition Email → Revenue Pipeline
 *
 * ID Strategy:
 * - discovered_businesses.id = generated UUID (for downstream refs)
 * - discovered_businesses.source_id = Business.id (traceability)
 * - source = 'prisma_business' (source tracking)
 */

import { neon } from "@neondatabase/serverless";
import { runFullPipeline, RawBusinessDiscovery } from "./four-layer-pipeline";

export interface BridgeResult {
  totalProcessed: number;
  discovered: number;
  qualified: number;
  promoted: number;
  errors: Array<{ businessId: string; error: string }>;
}

/**
 * Process unqualified Prisma businesses through Phase 4 pipeline
 */
export async function processUnqualifiedPrismaBusinesses(
  sql: any,
  limit: number = 25
): Promise<BridgeResult> {
  const result: BridgeResult = {
    totalProcessed: 0,
    discovered: 0,
    qualified: 0,
    promoted: 0,
    errors: [],
  };

  try {
    // Self-healing query: Only process businesses not yet qualified
    // Uses UNIQUE constraint on google_place_id to prevent reprocessing
    // If Business.id already exists in discovered_businesses.google_place_id, it won't reprocess
    const unqualifiedBusinesses = await sql`
      SELECT DISTINCT
        b.id as business_id,
        b.name,
        COALESCE(b.niche, '') as niche,
        b."createdAt",
        b.website,
        b.phone,
        b.address,
        COALESCE(b.location, '') as location,
        b."sourcePayload"
      FROM "Business" b
      LEFT JOIN discovered_businesses db
        ON db.google_place_id = b.id
      WHERE db.id IS NULL
      LIMIT ${limit}
    `;

    console.log(`[Bridge] Found ${unqualifiedBusinesses.length} unqualified Prisma businesses\n`);
    result.totalProcessed = unqualifiedBusinesses.length;

    // Process each business
    for (const business of unqualifiedBusinesses as any[]) {
      try {
        // Fetch reviews for this Prisma business
        const reviews = await sql`
          SELECT
            r.rating,
            r.text,
            r.author,
            r."createdAt" as time
          FROM "Review" r
          WHERE r."businessId" = ${business.business_id}
          LIMIT 50
        `;

        // Build RawBusinessDiscovery adapter
        const rawDiscovery: RawBusinessDiscovery = {
          placeId: business.business_id, // Use Business.id as placeId
          name: business.name,
          address: business.address || "",
          postcode: business.location, // Use location as postcode if available
          category: business.niche || "Unknown",
          source: "prisma_business",
          reviews: (reviews as any[]).map((r: any) => ({
            rating: r.rating,
            text: r.text,
            author: r.author,
            time: r.time?.getTime() || Date.now(),
          })),
          rawData: {
            prismaBusinessId: business.business_id,
            website: business.website,
            phone: business.phone,
            niche: business.niche,
            location: business.location,
            sourcePayload: business.sourcePayload,
            createdAt: business.createdAt,
          },
        };

        // Run through Phase 4 pipeline
        const pipelineResult = await runFullPipeline(sql, rawDiscovery);

        if (pipelineResult.discovered) result.discovered++;
        if (pipelineResult.qualified) result.qualified++;
        if (pipelineResult.promoted) result.promoted++;

        console.log(
          `[Bridge] ✓ ${business.name} - D:${pipelineResult.discovered ? '✓' : '✗'} Q:${pipelineResult.qualified ? '✓' : '✗'} P:${pipelineResult.promoted ? '✓' : '✗'}`
        );
      } catch (error) {
        result.errors.push({
          businessId: business.business_id,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`[Bridge] ✗ ${business.name}: ${error}`);
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
  sql: any,
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

    const result = await processUnqualifiedPrismaBusinesses(sql, batchSize);

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
        console.log(`  - ${err.businessId}: ${err.error}`);
      }
      console.log("");
    }
  }

  console.log("[Bridge] === SUMMARY ===");
  console.log(`  Total Processed: ${totalProcessed}`);
  console.log(`  Total Qualified: ${totalQualified}`);
  console.log(`  Total Promoted: ${totalPromoted}\n`);
}
