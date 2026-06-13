/**
 * STEP 6: BACKFILL ALL BUSINESSES
 *
 * Process all unqualified discoveries in 25-business batches
 * Requires: DRY RUN (STEP 5) to pass first
 */

import { neon } from "@neondatabase/serverless";
import { processInBatches } from "../lib/prisma-phase4-bridge";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function backfillAll() {
  console.log("📦 STEP 6: BACKFILL ALL BUSINESSES\n");
  console.log("Processing all unqualified businesses in batches of 25\n");

  try {
    // Get baseline counts
    console.log("📊 Baseline counts...\n");
    const discoveredCount = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const dbCount = discoveredCount[0].count;
    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;

    console.log(`  discovered_businesses: ${dbCount}`);
    console.log(`  qualified_businesses: ${qbBefore}`);
    console.log(`  b2b_leads: ${blBefore}\n`);

    if (dbCount === 0) {
      console.log("⚠️  No discovered businesses found\n");
      process.exit(1);
    }

    // Run batch processing
    await processInBatches(25);

    // Get final counts
    const afterQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const afterBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const qbAfter = afterQB[0].count;
    const blAfter = afterBL[0].count;
    const qbDelta = qbAfter - qbBefore;
    const blDelta = blAfter - blBefore;

    console.log("=".repeat(60));
    console.log("BACKFILL COMPLETE:");
    console.log("=".repeat(60));
    console.log(`  qualified_businesses: ${qbBefore} → ${qbAfter} (Δ +${qbDelta})`);
    console.log(`  b2b_leads: ${blBefore} → ${blAfter} (Δ +${blDelta})\n`);

    // Verify revenue pipeline should wake up
    if (qbAfter > 0 && blAfter > blBefore) {
      console.log("✅ BACKFILL SUCCESSFUL");
      console.log("✅ Revenue pipeline data populated\n");
      process.exit(0);
    } else {
      console.log("⚠️  Backfill completed but no new records created");
      console.log("This may indicate discovery data was already qualified\n");
      process.exit(0);
    }

  } catch (error) {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  }
}

backfillAll();
