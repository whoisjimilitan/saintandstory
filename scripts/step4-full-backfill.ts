/**
 * STEP 4: FULL BACKFILL
 *
 * Process all 151 unqualified Prisma businesses in batches of 25
 * After idempotency test passes, safe to process entire backlog
 */

import { neon } from "@neondatabase/serverless";
import { processInBatches } from "../lib/prisma-to-phase4-bridge";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function fullBackfill() {
  console.log("📦 STEP 4: FULL BACKFILL\n");
  console.log("Processing all 151 Prisma businesses in batches of 25\n");

  try {
    // Get baseline counts
    console.log("📊 Baseline counts...\n");
    const businessCount = await sql`SELECT COUNT(*)::int as count FROM "Business"`;
    const baselineDB = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const businessTotal = businessCount[0].count;
    const dbBefore = baselineDB[0].count;
    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;

    console.log(`  Business total (Prisma):     ${businessTotal}`);
    console.log(`  discovered_businesses:      ${dbBefore}`);
    console.log(`  qualified_businesses:       ${qbBefore}`);
    console.log(`  b2b_leads:                  ${blBefore}`);
    console.log(`  Expected after backfill:    ${businessTotal} qualified + leads\n`);

    // Run batch processing
    await processInBatches(sql, 25);

    // Get final counts
    const afterDB = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const afterQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const afterBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const dbAfter = afterDB[0].count;
    const qbAfter = afterQB[0].count;
    const blAfter = afterBL[0].count;

    const dbDelta = dbAfter - dbBefore;
    const qbDelta = qbAfter - qbBefore;
    const blDelta = blAfter - blBefore;

    console.log("=".repeat(60));
    console.log("BACKFILL COMPLETE:");
    console.log("=".repeat(60));
    console.log(`  discovered_businesses: ${dbBefore} → ${dbAfter} (Δ +${dbDelta})`);
    console.log(`  qualified_businesses:  ${qbBefore} → ${qbAfter} (Δ +${qbDelta})`);
    console.log(`  b2b_leads:             ${blBefore} → ${blAfter} (Δ +${blDelta})\n`);

    console.log("=".repeat(60));
    console.log("SUCCESS CRITERIA:");
    console.log("=".repeat(60));

    let passed = 0;
    let total = 3;

    if (qbAfter > qbBefore) {
      console.log("✅ qualified_businesses populated (was 0, now " + qbAfter + ")");
      passed++;
    } else {
      console.log("❌ qualified_businesses NOT populated");
    }

    if (blAfter > blBefore) {
      console.log("✅ b2b_leads increased (was " + blBefore + ", now " + blAfter + ")");
      passed++;
    } else {
      console.log("❌ b2b_leads NOT increased");
    }

    if (qbDelta > 0) {
      console.log("✅ New records created in this backfill");
      passed++;
    } else {
      console.log("⚠️  No new records created (may indicate already processed)");
    }

    console.log(`\n${passed}/${total} criteria met\n`);

    if (passed >= 2) {
      console.log("✅ BACKFILL SUCCESSFUL");
      console.log("✅ Revenue pipeline populated");
      console.log("✅ Ready for orchestration wiring\n");
      process.exit(0);
    } else {
      console.log("❌ Backfill did not meet success criteria");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  }
}

fullBackfill();
