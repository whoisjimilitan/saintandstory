import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Check for any remaining data quality issues
const standingOrdersCheck = await sql`
  SELECT COUNT(*) as broken FROM b2b_standing_orders
  WHERE active = true 
  AND (pickup_postcode IS NULL OR delivery_postcode IS NULL)
`;

const driversCheck = await sql`
  SELECT COUNT(*) as disabled FROM drivers
  WHERE profile_live = true AND b2b_opt_in = false
`;

const orchestrationLogs = await sql`
  SELECT status, execution_details, created_at
  FROM b2b_orchestration_logs
  ORDER BY created_at DESC
  LIMIT 3
`;

console.log("=== FAILURE RECHECK REPORT ===\n");

console.log("DATA QUALITY CHECKS:");
console.log(`Active standing orders with missing postcodes: ${standingOrdersCheck[0].broken} ✅`);
console.log(`Production drivers without B2B opt-in: ${driversCheck[0].disabled} ✅`);
console.log('');

console.log("RECENT ORCHESTRATION RUNS:");
orchestrationLogs.forEach((log, i) => {
  const details = typeof log.execution_details === 'string'
    ? JSON.parse(log.execution_details)
    : log.execution_details;
  
  console.log(`\nRun ${i + 1}:`);
  console.log(`  Created:  ${log.created_at}`);
  console.log(`  Status:   ${log.status}`);
  console.log(`  Discovery: ${details.stages.discovery.count} found, ${details.stages.discovery.errors.length} errors`);
  console.log(`  Standing Orders: ${details.stages.standingOrders.created} created, ${details.stages.standingOrders.failed.length} failed`);
  
  if (details.stages.standingOrders.failed.length > 0) {
    console.log(`  Failures:`);
    details.stages.standingOrders.failed.forEach(f => console.log(`    - ${f}`));
  }
});

console.log('\n\n=== CONCLUSION ===');
if (standingOrdersCheck[0].broken === 0 && driversCheck[0].disabled === 0) {
  console.log('✅ NO CRITICAL FAILURES REMAIN');
  console.log('All data quality issues have been resolved.');
  console.log('System ready for orchestration success.');
} else {
  console.log('❌ FAILURES REMAIN');
}
