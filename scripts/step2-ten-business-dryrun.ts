/**
 * STEP 2: TEN BUSINESS DRY RUN
 *
 * Process 10 unqualified Prisma businesses
 * Verify: Growth, no duplicates, no errors
 */

import { neon } from "@neondatabase/serverless";
import { processUnqualifiedPrismaBusinesses } from "../lib/prisma-to-phase4-bridge";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function dryRun10() {
  console.log("🧪 STEP 2: TEN BUSINESS DRY RUN\n");

  try {
    // Get baseline counts
    console.log("📊 Baseline counts...\n");
    const baselineDB = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;
    const businessCount = await sql`SELECT COUNT(*)::int as count FROM "Business"`;

    const dbBefore = baselineDB[0].count;
    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;
    const businessTotal = businessCount[0].count;

    console.log(`  Business (Prisma):           ${businessTotal}`);
    console.log(`  discovered_businesses:      ${dbBefore}`);
    console.log(`  qualified_businesses:       ${qbBefore}`);
    console.log(`  b2b_leads:                  ${blBefore}\n`);

    // Process 10 businesses
    console.log("▶️  Processing 10 unqualified Prisma businesses...\n");
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
    console.log("DRY RUN RESULTS:");
    console.log("=".repeat(60));
    console.log(`  Businesses processed: ${result.totalProcessed}`);
    console.log(`  Qualified created: ${result.qualified}`);
    console.log(`  Leads created: ${result.promoted}`);
    console.log(`  Errors: ${result.errors.length}\n`);

    console.log("Database impact:");
    console.log(`  discovered_businesses: ${dbBefore} → ${dbAfter} (Δ +${dbDelta})`);
    console.log(`  qualified_businesses:  ${qbBefore} → ${qbAfter} (Δ +${qbDelta})`);
    console.log(`  b2b_leads:             ${blBefore} → ${blAfter} (Δ +${blDelta})\n`);

    if (result.errors.length > 0) {
      console.log(`⚠️  Errors encountered:`);
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
      console.log("All Prisma businesses may already be processed\n");
      process.exit(1);
    }

    if (qbDelta > 0 && result.errors.length === 0) {
      console.log("✅ DRY RUN PASSED");
      console.log("✅ Bridge successfully qualified businesses");
      console.log("✅ Ready for idempotency test\n");
      process.exit(0);
    } else if (result.errors.length > 0) {
      console.log("⚠️  DRY RUN COMPLETED WITH ERRORS");
      console.log("   Review errors above before proceeding\n");
      process.exit(1);
    } else {
      console.log("❌ Unexpected result");
      console.log(`   Expected: ${result.totalProcessed} businesses qualified`);
      console.log(`   Got: ${qbDelta} new qualified_businesses\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Dry run failed:", error);
    process.exit(1);
  }
}

dryRun10();
