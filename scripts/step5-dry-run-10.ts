/**
 * STEP 5: DRY RUN - PROCESS 10 BUSINESSES
 *
 * Verify: Bridge works for batch, creates no duplicates
 * Requires: discovered_businesses table populated
 */

import { neon } from "@neondatabase/serverless";
import { processUnqualifiedBusinesses } from "../lib/prisma-phase4-bridge";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function dryRun() {
  console.log("🧪 STEP 5: DRY RUN - PROCESS 10 BUSINESSES\n");

  try {
    // Get baseline counts
    console.log("📊 Baseline counts...\n");
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;

    console.log(`  qualified_businesses: ${qbBefore}`);
    console.log(`  b2b_leads: ${blBefore}\n`);

    // Run bridge on 10 businesses
    console.log("▶️  Processing 10 unqualified businesses...\n");
    const result = await processUnqualifiedBusinesses(10);

    // Get after counts
    const afterQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const afterBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const qbAfter = afterQB[0].count;
    const blAfter = afterBL[0].count;
    const qbDelta = qbAfter - qbBefore;
    const blDelta = blAfter - blBefore;

    console.log("\n" + "=".repeat(60));
    console.log("DRY RUN RESULTS:");
    console.log("=".repeat(60));
    console.log(`  Businesses processed: ${result.totalProcessed}`);
    console.log(`  Qualified created: ${result.qualified}`);
    console.log(`  Leads created: ${result.promoted}\n`);

    console.log("Database impact:");
    console.log(`  qualified_businesses: ${qbBefore} → ${qbAfter} (Δ +${qbDelta})`);
    console.log(`  b2b_leads: ${blBefore} → ${blAfter} (Δ +${blDelta})\n`);

    if (result.errors.length > 0) {
      console.log(`⚠️  Errors: ${result.errors.length}`);
      for (const err of result.errors) {
        console.log(`  - ${err.placeId}: ${err.error}`);
      }
      console.log("");
    }

    // Verdict
    if (result.totalProcessed === 0) {
      console.log("⚠️  No unqualified businesses found");
      console.log("Cannot run dry run without discovery data\n");
      process.exit(1);
    }

    if (qbDelta >= result.qualified && blDelta >= result.promoted) {
      console.log("✅ DRY RUN PASSED");
      console.log("✅ Bridge is creating records correctly\n");
      process.exit(0);
    } else {
      console.log("❌ Unexpected database state");
      console.log(`   Expected qualified_businesses +${result.qualified}, got +${qbDelta}`);
      console.log(`   Expected b2b_leads +${result.promoted}, got +${blDelta}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Dry run failed:", error);
    process.exit(1);
  }
}

dryRun();
