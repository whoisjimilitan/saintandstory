require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    console.log('H1: Was the request received?');
    console.log('Checking for ANY evidence of execution on 2026-06-12 between 01:55-02:10 UTC...\n');

    // Check for any leads created in that window
    const leadsInWindow = await sql`
      SELECT COUNT(*) as count
      FROM b2b_leads
      WHERE created_at >= '2026-06-12T01:55:00Z'
        AND created_at <= '2026-06-12T02:10:00Z'
    `;

    // Check for jobs created in that window
    const jobsInWindow = await sql`
      SELECT COUNT(*) as count
      FROM jobs
      WHERE created_at >= '2026-06-12T01:55:00Z'
        AND created_at <= '2026-06-12T02:10:00Z'
    `;

    // Check for orchestration logs in that window
    const logsInWindow = await sql`
      SELECT COUNT(*) as count
      FROM b2b_orchestration_logs
      WHERE created_at >= '2026-06-12T01:55:00Z'
        AND created_at <= '2026-06-12T02:10:00Z'
    `;

    // Check for standing orders in that window
    const soInWindow = await sql`
      SELECT COUNT(*) as count
      FROM b2b_standing_orders
      WHERE created_at >= '2026-06-12T01:55:00Z'
        AND created_at <= '2026-06-12T02:10:00Z'
    `;

    console.log('Window: 2026-06-12 01:55:00 UTC to 02:10:00 UTC');
    console.log('B2B Leads created:', leadsInWindow[0].count);
    console.log('Jobs created:', jobsInWindow[0].count);
    console.log('Orchestration logs created:', logsInWindow[0].count);
    console.log('Standing orders created:', soInWindow[0].count);
    console.log('');

    const totalActivity = leadsInWindow[0].count + jobsInWindow[0].count + 
                         logsInWindow[0].count + soInWindow[0].count;

    if (totalActivity === 0) {
      console.log('FINDING: Zero database activity in the execution window');
      console.log('Evidence AGAINST request being received: STRONG');
    } else {
      console.log('FINDING: Activity detected in execution window');
      console.log('Evidence FOR request being received: PRESENT');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
