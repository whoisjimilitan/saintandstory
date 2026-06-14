import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get the latest orchestration run
const latest = await sql`
  SELECT id, run_id, status, execution_details, created_at
  FROM b2b_orchestration_logs
  ORDER BY created_at DESC
  LIMIT 1
`;

if (latest.length === 0) {
  console.log("No orchestration logs found");
  process.exit(1);
}

const log = latest[0];
console.log("=== LATEST ORCHESTRATION RUN ===\n");
console.log(`Run ID:     ${log.run_id}`);
console.log(`Status:     ${log.status}`);
console.log(`Created:    ${log.created_at}`);
console.log(`\nExecution Details:`);

if (log.execution_details) {
  const details = typeof log.execution_details === 'string' 
    ? JSON.parse(log.execution_details) 
    : log.execution_details;
  
  console.log(JSON.stringify(details, null, 2));
}
