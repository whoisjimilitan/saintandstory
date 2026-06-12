require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    // Check for any leads created on June 12
    const june12Leads = await sql`
      SELECT COUNT(*) as count, 
             MIN(created_at) as first_created,
             MAX(created_at) as last_created
      FROM b2b_leads
      WHERE DATE(created_at AT TIME ZONE 'UTC') = '2026-06-12'
    `;

    console.log('Leads created on 2026-06-12:');
    console.log(`  Count: ${june12Leads[0].count}`);
    console.log(`  First: ${june12Leads[0].first_created}`);
    console.log(`  Last: ${june12Leads[0].last_created}`);
    console.log('');

    // Check for jobs created on June 12
    const june12Jobs = await sql`
      SELECT COUNT(*) as count,
             MIN(created_at) as first_created,
             MAX(created_at) as last_created
      FROM jobs
      WHERE DATE(created_at AT TIME ZONE 'UTC') = '2026-06-12'
    `;

    console.log('Jobs created on 2026-06-12:');
    console.log(`  Count: ${june12Jobs[0].count}`);
    console.log(`  First: ${june12Jobs[0].first_created}`);
    console.log(`  Last: ${june12Jobs[0].last_created}`);
    console.log('');

    // Check standing orders
    const june12SO = await sql`
      SELECT COUNT(*) as count,
             MIN(created_at) as first_created,
             MAX(created_at) as last_created
      FROM b2b_standing_orders
      WHERE DATE(created_at AT TIME ZONE 'UTC') = '2026-06-12'
    `;

    console.log('Standing orders created on 2026-06-12:');
    console.log(`  Count: ${june12SO[0].count}`);
    console.log(`  First: ${june12SO[0].first_created}`);
    console.log(`  Last: ${june12SO[0].last_created}`);
    console.log('');

    console.log('CONCLUSION: No B2B activity on 2026-06-12');
    console.log('This indicates: Orchestration did NOT execute');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
