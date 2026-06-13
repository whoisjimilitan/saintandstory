/**
 * STEP 1: SINGLE BUSINESS VALIDATION
 *
 * Test that one Prisma business successfully enters Phase 4 pipeline
 * Captures before/after counts to verify no duplicates
 */

import { neon } from "@neondatabase/serverless";
import { processUnqualifiedPrismaBusinesses } from "../lib/prisma-to-phase4-bridge";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testOneBusiness() {
  console.log("🧪 STEP 1: SINGLE BUSINESS VALIDATION\n");

  try {
    // Get baseline counts
    console.log("📊 Baseline counts...\n");
    const baselineDB = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const dbBefore = baselineDB[0].count;
    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;

    console.log(`  discovered_businesses: ${dbBefore}`);
    console.log(`  qualified_businesses:  ${qbBefore}`);
    console.log(`  b2b_leads:             ${blBefore}\n`);

    // Process one business
    console.log("▶️  Processing one Prisma business...\n");
    const result = await processUnqualifiedPrismaBusinesses(sql, 1);

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
    console.log("RESULT:");
    console.log("=".repeat(60));
    console.log(`  Businesses processed: ${result.totalProcessed}`);
    console.log(`  Qualified created: ${result.qualified}`);
    console.log(`  Leads created: ${result.promoted}\n`);

    console.log("Database impact:");
    console.log(`  discovered_businesses: ${dbBefore} → ${dbAfter} (Δ +${dbDelta})`);
    console.log(`  qualified_businesses:  ${qbBefore} → ${qbAfter} (Δ +${qbDelta})`);
    console.log(`  b2b_leads:             ${blBefore} → ${blAfter} (Δ +${blDelta})\n`);

    if (result.errors.length > 0) {
      console.log(`⚠️  Errors: ${result.errors.length}`);
      for (const err of result.errors) {
        console.log(`  - ${err.businessId}: ${err.error}`);
      }
      console.log("");
    }

    // Verdict
    console.log("=".repeat(60));
    console.log("VERDICT:");
    console.log("=".repeat(60));

    if (result.totalProcessed === 0) {
      console.log("⚠️  No unqualified businesses found");
      console.log("Cannot test bridge without Prisma business data\n");
      process.exit(1);
    }

    if (result.totalProcessed === 1 && qbDelta >= 1) {
      console.log("✅ SINGLE BUSINESS TEST PASSED");
      console.log("✅ Prisma business successfully entered Phase 4\n");
      process.exit(0);
    } else {
      console.log("❌ Unexpected result");
      console.log(`   Expected: 1 business processed, ${qbDelta} qualified`);
      console.log(`   Verify Phase 4 pipeline executed\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testOneBusiness();
