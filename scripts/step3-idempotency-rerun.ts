/**
 * STEP 3: IDEMPOTENCY VALIDATION
 *
 * Re-run the exact same business query after Step 2 completes
 * Expected: 0 new qualified_businesses, 0 new b2b_leads
 *
 * This proves nightly execution is safe and won't create duplicates
 */

import { neon } from "@neondatabase/serverless";
import { processUnqualifiedPrismaBusinesses } from "../lib/prisma-to-phase4-bridge";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function idempotencyTest() {
  console.log("🔄 STEP 3: IDEMPOTENCY VALIDATION\n");
  console.log("Re-running Step 2 business query");
  console.log("Expected: 0 new records (proof of deduplication)\n");

  try {
    // Get baseline (should be same as Step 2 after)
    console.log("📊 Baseline counts (before re-run)...\n");
    const baselineDB = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const dbBefore = baselineDB[0].count;
    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;

    console.log(`  discovered_businesses: ${dbBefore}`);
    console.log(`  qualified_businesses:  ${qbBefore}`);
    console.log(`  b2b_leads:             ${blBefore}\n`);

    // Re-run the same query
    console.log("▶️  Re-running bridge on same businesses...\n");
    const result = await processUnqualifiedPrismaBusinesses(sql, 10);

    // Get after counts
    const afterDB = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const afterQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const afterBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const dbAfter = afterDB[0].count;
    const qbAfter = afterQB[0].count;
    const blAfter = afterBL[0].count;

    const dbDelta = dbAfter - dbBefore;
    const qbDelta = qbAfter - qbBefore;
    const blDelta = blAfter - blBefore;

    console.log("\n" + "=".repeat(60));
    console.log("IDEMPOTENCY TEST RESULTS:");
    console.log("=".repeat(60));
    console.log(`  Businesses found: ${result.totalProcessed}`);
    console.log(`  Expected: 0 (already processed)\n`);

    console.log("Database deltas:");
    console.log(`  discovered_businesses: Δ +${dbDelta} (expected: 0)`);
    console.log(`  qualified_businesses:  Δ +${qbDelta} (expected: 0)`);
    console.log(`  b2b_leads:             Δ +${blDelta} (expected: 0)\n`);

    // Verdict
    console.log("=".repeat(60));
    console.log("VERDICT:");
    console.log("=".repeat(60));

    if (result.totalProcessed === 0 && qbDelta === 0 && blDelta === 0) {
      console.log("✅ IDEMPOTENCY TEST PASSED");
      console.log("✅ Re-run produced zero new records");
      console.log("✅ System is safe for nightly execution\n");
      process.exit(0);
    } else if (result.totalProcessed > 0) {
      console.log("⚠️  IDEMPOTENCY ISSUE DETECTED");
      console.log(`   Businesses re-processed: ${result.totalProcessed}`);
      console.log("   Expected: 0 (they should already exist)\n");
      console.log("   Possible causes:");
      console.log("   - NOT EXISTS query is finding already-qualified businesses");
      console.log("   - discovered_business.source_id not being set correctly\n");
      process.exit(1);
    } else {
      console.log("⚠️  Test completed but unexpected state");
      console.log(`   Deltas: DB=${dbDelta}, QB=${qbDelta}, BL=${blDelta}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Idempotency test failed:", error);
    process.exit(1);
  }
}

idempotencyTest();
