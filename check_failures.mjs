import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get latest orchestration run details
const latest = await sql`
  SELECT run_id, started_at, status, execution_details
  FROM b2b_orchestration_logs
  ORDER BY started_at DESC
  LIMIT 1
`;

if (latest.length > 0) {
  const run = latest[0];
  console.log("=== LATEST ORCHESTRATION RUN ===");
  console.log(`ID: ${run.run_id}`);
  console.log(`Time: ${run.started_at}`);
  console.log(`Status: ${run.status}`);
  console.log(`\nDetails:`);
  console.log(JSON.stringify(run.execution_details, null, 2));
}
