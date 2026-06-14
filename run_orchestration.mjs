import { runDailyB2BOrchestration } from "./lib/b2b-orchestrator.ts";

console.log("=== ORCHESTRATION EXECUTION ===\n");
console.log("Starting orchestration at", new Date().toISOString());

try {
  const result = await runDailyB2BOrchestration();
  
  console.log("\n=== ORCHESTRATION RESULT ===");
  console.log(`Run ID:       ${result.executionId}`);
  console.log(`Status:       ${result.success ? '✅ SUCCESS' : '⚠️  ' + (result.stages.discovery.errors.length > 0 ? 'PARTIAL' : 'FAILURE')}`);
  console.log(`Duration:     ${Math.round(result.totalDurationMs / 1000)}s`);
  
  console.log(`\n=== STAGE RESULTS ===`);
  console.log(`Discovery:`);
  console.log(`  Discovered: ${result.stages.discovery.count}`);
  console.log(`  Skipped:    ${result.stages.discovery.skipped}`);
  console.log(`  Errors:     ${result.stages.discovery.errors.length}`);
  if (result.stages.discovery.errors.length > 0) {
    result.stages.discovery.errors.forEach(e => console.log(`    - ${e}`));
  }
  
  console.log(`\nDriver Matching:`);
  console.log(`  Attempted:  ${result.stages.driverMatching.attempted}`);
  console.log(`  Succeeded:  ${result.stages.driverMatching.succeeded}`);
  console.log(`  Failed:     ${result.stages.driverMatching.failed.length}`);
  if (result.stages.driverMatching.failed.length > 0) {
    result.stages.driverMatching.failed.forEach(e => console.log(`    - ${e}`));
  }
  
  console.log(`\nStanding Orders:`);
  console.log(`  Created:    ${result.stages.standingOrders.created}`);
  console.log(`  Failed:     ${result.stages.standingOrders.failed.length}`);
  if (result.stages.standingOrders.failed.length > 0) {
    result.stages.standingOrders.failed.forEach(e => console.log(`    - ${e}`));
  }
  
  console.log(`\nMetrics:`);
  console.log(`  Calculated: ${result.stages.metrics.calculated ? 'YES' : 'NO'}`);
  
} catch (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}
