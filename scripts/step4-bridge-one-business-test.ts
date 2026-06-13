/**
 * STEP 4: ONE-BUSINESS BRIDGE TEST
 *
 * Test that Prisma data successfully enters Phase 4 pipeline
 * Requires: discovered_businesses table populated
 */

import { processUnqualifiedBusinesses } from "../lib/prisma-phase4-bridge";

async function testOneBusiness() {
  console.log("🌉 STEP 4: ONE-BUSINESS BRIDGE TEST\n");
  console.log("Testing: Can one Prisma-discovered business enter Phase 4?\n");

  try {
    const result = await processUnqualifiedBusinesses(1);

    console.log("\n" + "=".repeat(60));
    console.log("RESULT:");
    console.log("=".repeat(60));
    console.log(`  Processed: ${result.totalProcessed}`);
    console.log(`  Discovered: ${result.discovered}`);
    console.log(`  Qualified: ${result.qualified}`);
    console.log(`  Promoted: ${result.promoted}`);
    console.log(`  Errors: ${result.errors.length}\n`);

    if (result.errors.length > 0) {
      console.log("ERRORS:");
      for (const err of result.errors) {
        console.log(`  - ${err.placeId}: ${err.error}`);
      }
      console.log("");
    }

    if (result.totalProcessed === 0) {
      console.log("⚠️  No unqualified businesses found");
      console.log("Cannot test bridge without discovery data\n");
      process.exit(1);
    }

    if (result.discovered === 1) {
      console.log("✅ ONE-BUSINESS BRIDGE TEST PASSED");
      console.log("✅ Prisma data successfully entered Phase 4\n");
      process.exit(0);
    } else {
      console.log("❌ Unexpected result: business not processed\n");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Bridge test failed:", error);
    process.exit(1);
  }
}

testOneBusiness();
