import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get last 30 runs
const runs = await sql`
  SELECT 
    run_id, 
    started_at, 
    status,
    execution_details
  FROM b2b_orchestration_logs
  ORDER BY started_at DESC
  LIMIT 30
`;

console.log(`=== ORCHESTRATION RUN ANALYSIS ===\nTotal runs: ${runs.length}\n`);

// Parse failures
const failures = {};

runs.forEach(run => {
  const details = run.execution_details;
  
  // Collect all errors
  const allErrors = [
    ...(details.stages?.discovery?.errors || []),
    ...(details.stages?.driverMatching?.failed || []),
    ...(details.stages?.standingOrders?.failed || [])
  ];
  
  allErrors.forEach(error => {
    // Extract failure type
    let type = "Unknown";
    
    if (error.includes("Missing routing postcode")) {
      type = "Missing Postcode (Standing Orders)";
    } else if (error.includes("Driver")) {
      type = "Driver Related";
    } else if (error.includes("@")) {
      type = "Discovery Error";
    } else {
      type = "Other: " + error.substring(0, 50);
    }
    
    if (!failures[type]) {
      failures[type] = {
        count: 0,
        firstSeen: run.started_at,
        lastSeen: run.started_at,
        examples: []
      };
    }
    
    failures[type].count++;
    failures[type].lastSeen = run.started_at;
    if (failures[type].examples.length < 2) {
      failures[type].examples.push(error);
    }
  });
});

// Output failures
console.log("=== FAILURE SUMMARY ===\n");
Object.entries(failures)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([type, data]) => {
    console.log(`${type}`);
    console.log(`  Count: ${data.count}`);
    console.log(`  First: ${data.firstSeen}`);
    console.log(`  Last:  ${data.lastSeen}`);
    console.log(`  Example: ${data.examples[0]}`);
    console.log('');
  });

// Analyze success rates
const successRuns = runs.filter(r => r.status === 'success').length;
const partialRuns = runs.filter(r => r.status === 'partial_failure').length;

console.log(`=== SUCCESS RATE ===`);
console.log(`Success: ${successRuns}/${runs.length} (${Math.round(successRuns/runs.length*100)}%)`);
console.log(`Partial Failure: ${partialRuns}/${runs.length} (${Math.round(partialRuns/runs.length*100)}%)`);

// Analyze stage-by-stage
console.log(`\n=== STAGE ANALYSIS ===`);

const stageStats = {
  discovery: { success: 0, fail: 0 },
  driverMatching: { success: 0, fail: 0 },
  standingOrders: { success: 0, fail: 0 }
};

runs.forEach(run => {
  const d = run.execution_details.stages;
  
  if (d.discovery?.errors?.length === 0) {
    stageStats.discovery.success++;
  } else {
    stageStats.discovery.fail++;
  }
  
  if (d.driverMatching?.failed?.length === 0) {
    stageStats.driverMatching.success++;
  } else {
    stageStats.driverMatching.fail++;
  }
  
  if (d.standingOrders?.failed?.length === 0) {
    stageStats.standingOrders.success++;
  } else {
    stageStats.standingOrders.fail++;
  }
});

Object.entries(stageStats).forEach(([stage, stats]) => {
  const total = stats.success + stats.fail;
  console.log(`${stage}: ${stats.success}/${total} pass (${Math.round(stats.success/total*100)}%)`);
});
