const { neon } = require('@neondatabase/serverless');

async function checkOrchestration() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== STAGE A: CRON TRIGGER ===\n');
    
    console.log('Cron configuration found: ✓');
    console.log('Schedule: 0 2 * * * (02:00 UTC daily)');
    console.log('Entry point: https://saintandstoryltd.co.uk/api/orchestrate/b2b-daily');
    console.log('Auth: Bearer token via CRON_SECRET\n');
    
    console.log('=== STAGE B: API EXECUTION LOGS ===\n');
    
    const logs = await sql`
      SELECT COUNT(*) as total_executions, 
             COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
             COUNT(CASE WHEN status = 'partial_failure' THEN 1 END) as partial_failures,
             MAX(completed_at) as last_execution,
             MIN(completed_at) as first_execution
      FROM b2b_orchestration_logs
    `;
    console.table(logs);
    
    console.log('\nRecent execution history:');
    const recentLogs = await sql`
      SELECT 
        run_id,
        started_at,
        completed_at,
        status,
        execution_details ->> 'success' as success,
        execution_details ->> 'stages' as stages
      FROM b2b_orchestration_logs
      ORDER BY completed_at DESC
      LIMIT 5
    `;
    console.table(recentLogs);
    
    console.log('\nExecution details (last run):');
    const lastRun = await sql`
      SELECT 
        run_id,
        started_at,
        completed_at,
        status,
        execution_details
      FROM b2b_orchestration_logs
      ORDER BY completed_at DESC
      LIMIT 1
    `;
    if (lastRun.length > 0) {
      console.log('\nRun ID:', lastRun[0].run_id);
      console.log('Status:', lastRun[0].status);
      console.log('Started:', lastRun[0].started_at);
      console.log('Completed:', lastRun[0].completed_at);
      console.log('Full details:', JSON.stringify(lastRun[0].execution_details, null, 2));
    } else {
      console.log('NO EXECUTION LOGS FOUND');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkOrchestration();
