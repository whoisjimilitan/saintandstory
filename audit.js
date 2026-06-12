require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function runAudit() {
  try {
    console.log('='.repeat(80));
    console.log('AUTONOMY EXECUTION FORENSIC AUDIT');
    console.log('2026-06-12 02:00 UTC SCHEDULED RUN');
    console.log('='.repeat(80));
    console.log('');

    // GET EXACT TIMESTAMPS
    console.log('1. LEDGER RECORDS WITH EXACT TIMESTAMPS');
    console.log('-'.repeat(80));
    const ledger = await sql`
      SELECT 
        run_id,
        started_at AT TIME ZONE 'UTC' as started_utc,
        completed_at AT TIME ZONE 'UTC' as completed_utc,
        status,
        discovery_count,
        leads_created,
        jobs_created,
        failures
      FROM b2b_orchestration_logs
      ORDER BY started_at DESC
      LIMIT 5
    `;

    console.log(`Total ledger records: ${ledger.length}`);
    console.log('');
    
    ledger.forEach((record, idx) => {
      const startDate = new Date(record.started_utc);
      const isJune12 = startDate.getUTCDate() === 12 && startDate.getUTCMonth() === 5; // Month is 0-indexed
      
      console.log(`Record ${idx + 1}:`);
      console.log(`  Run ID: ${record.run_id}`);
      console.log(`  Started: ${record.started_utc} (UTC)`);
      console.log(`  Date: ${startDate.toISOString()}`);
      console.log(`  Is June 12?: ${isJune12 ? '✅ YES' : '❌ NO'}`);
      console.log(`  Status: ${record.status}`);
      console.log(`  Leads Created: ${record.leads_created}`);
      console.log(`  Jobs Created: ${record.jobs_created}`);
      console.log('');
    });

    // EXPECTED EXECUTION WINDOW
    console.log('2. EXPECTED EXECUTION WINDOW');
    console.log('-'.repeat(80));
    const expectedStart = new Date('2026-06-12T02:00:00Z');
    const expectedEnd = new Date('2026-06-12T02:10:00Z');
    console.log(`Expected start: ${expectedStart.toISOString()}`);
    console.log(`Expected end:   ${expectedEnd.toISOString()}`);
    console.log('');

    // CHECK IF ANY JUNE 12 EXECUTION EXISTS
    const june12Records = ledger.filter(r => {
      const d = new Date(r.started_utc);
      return d.getUTCDate() === 12 && d.getUTCMonth() === 5;
    });

    console.log('3. FINAL VERDICT');
    console.log('-'.repeat(80));
    
    if (june12Records.length === 0) {
      console.log('');
      console.log('❌ AUTONOMY EXECUTION FAILED');
      console.log('');
      console.log('Critical Finding:');
      console.log('  ❌ NO EXECUTION RECORD FOR 2026-06-12 02:00 UTC');
      console.log('  ❌ Cron did not fire on schedule');
      console.log('');
      console.log('Last execution was:');
      if (ledger.length > 0) {
        const last = new Date(ledger[0].started_utc);
        console.log(`  Date/Time: ${ledger[0].started_utc}`);
        console.log(`  Status: ${ledger[0].status}`);
        console.log(`  Leads created: ${ledger[0].leads_created}`);
      }
      console.log('');
      console.log('Root Cause Options:');
      console.log('  1. Vercel cron did not trigger at 02:00 UTC');
      console.log('  2. /api/orchestrate/b2b-daily endpoint not accessible');
      console.log('  3. Endpoint failed before ledger insert');
      console.log('  4. CRON_SECRET header validation failed');
      console.log('');
      console.log('STATUS: ❌ AUTONOMY VERIFICATION FAILED');
      console.log('Confidence: 100%');
    } else {
      console.log('✅ AUTONOMY EXECUTION VERIFIED');
      console.log(`Found ${june12Records.length} execution(s) on 2026-06-12`);
      june12Records.forEach(r => {
        console.log(`  ${r.started_utc} | Status: ${r.status} | Leads: ${r.leads_created}`);
      });
    }
    console.log('');

  } catch (error) {
    console.error('AUDIT ERROR:', error.message);
    process.exit(1);
  }
}

runAudit();
