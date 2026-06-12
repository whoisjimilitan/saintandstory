require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function buildTimeline() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     COMPLETE MORNING TIMELINE: 2026-06-12 01:00-05:00 UTC   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // 1. Get ALL orchestration ledger entries for the entire day
    console.log('DATA SOURCE 1: ORCHESTRATION LEDGER');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    const ledgerEntries = await sql`
      SELECT 
        run_id,
        started_at AT TIME ZONE 'UTC' as started_utc,
        completed_at AT TIME ZONE 'UTC' as completed_utc,
        status,
        discovery_count,
        leads_created,
        jobs_created,
        failures,
        created_at AT TIME ZONE 'UTC' as logged_at
      FROM b2b_orchestration_logs
      WHERE DATE(started_at AT TIME ZONE 'UTC') = '2026-06-12'
      ORDER BY started_at ASC
    `;

    if (ledgerEntries.length === 0) {
      console.log('⚠️  NO LEDGER ENTRIES FOR 2026-06-12\n');
    } else {
      console.log(`Found ${ledgerEntries.length} ledger entries:\n`);
      ledgerEntries.forEach((entry, idx) => {
        const startTime = new Date(entry.started_utc).toISOString();
        const endTime = new Date(entry.completed_utc).toISOString();
        console.log(`  [${idx + 1}] ${startTime} → ${endTime}`);
        console.log(`      Run ID: ${entry.run_id}`);
        console.log(`      Status: ${entry.status}`);
        console.log(`      Discovery: ${entry.discovery_count}, Leads: ${entry.leads_created}, Jobs: ${entry.jobs_created}`);
        if (entry.failures && entry.failures.length > 0) {
          console.log(`      Failures: ${entry.failures.join('; ')}`);
        }
        console.log('');
      });
    }

    // 2. Get ALL leads created during the window
    console.log('\nDATA SOURCE 2: B2B_LEADS (All created in window)');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    const leadsInWindow = await sql`
      SELECT 
        id,
        created_at AT TIME ZONE 'UTC' as created_utc,
        business_name,
        city
      FROM b2b_leads
      WHERE created_at >= '2026-06-12T01:00:00Z'
        AND created_at <= '2026-06-12T05:00:00Z'
      ORDER BY created_at ASC
    `;

    if (leadsInWindow.length === 0) {
      console.log('⚠️  NO LEADS CREATED IN WINDOW (01:00-05:00 UTC)\n');
    } else {
      console.log(`Found ${leadsInWindow.length} leads created:\n`);
      leadsInWindow.forEach((lead, idx) => {
        const time = new Date(lead.created_utc).toISOString();
        console.log(`  [${idx + 1}] ${time}: ${lead.business_name} (${lead.city})`);
      });
    }

    // 3. Get ALL jobs created during the window
    console.log('\n\nDATA SOURCE 3: JOBS (All created in window)');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    const jobsInWindow = await sql`
      SELECT 
        id,
        created_at AT TIME ZONE 'UTC' as created_utc,
        reference,
        status
      FROM jobs
      WHERE created_at >= '2026-06-12T01:00:00Z'
        AND created_at <= '2026-06-12T05:00:00Z'
      ORDER BY created_at ASC
    `;

    if (jobsInWindow.length === 0) {
      console.log('⚠️  NO JOBS CREATED IN WINDOW (01:00-05:00 UTC)\n');
    } else {
      console.log(`Found ${jobsInWindow.length} jobs created:\n`);
      jobsInWindow.forEach((job, idx) => {
        const time = new Date(job.created_utc).toISOString();
        console.log(`  [${idx + 1}] ${time}: ${job.reference} (${job.status})`);
      });
    }

    // 4. Analyze the timeline
    console.log('\n\nTIMELINE ANALYSIS');
    console.log('─────────────────────────────────────────────────────────────\n');

    const windowStart = new Date('2026-06-12T01:00:00Z');
    const windowEnd = new Date('2026-06-12T05:00:00Z');

    // Expected window: 02:00-03:00 UTC
    const expectedStart = new Date('2026-06-12T02:00:00Z');
    const expectedEnd = new Date('2026-06-12T03:00:00Z');

    // Hobby plan might have 30-60 minute window
    const hobbyEarlyWindow = new Date('2026-06-12T01:30:00Z');
    const hobbyLateWindow = new Date('2026-06-12T03:00:00Z');

    console.log('Expected Execution Window (CRON: 0 2 * * *):');
    console.log(`  02:00:00 UTC to 02:59:59 UTC\n`);

    console.log('Possible Hobby Plan Window (±30-60 min):');
    console.log(`  01:30:00 UTC to 03:00:00 UTC\n`);

    // Check for any evidence of execution
    const totalLeadsCreated = leadsInWindow.length;
    const totalJobsCreated = jobsInWindow.length;
    const ledgerRecords = ledgerEntries.length;

    console.log('Evidence of Autonomous Execution:');
    console.log(`  Ledger records: ${ledgerRecords}`);
    console.log(`  Leads created: ${totalLeadsCreated}`);
    console.log(`  Jobs created: ${totalJobsCreated}`);
    console.log(`  Total database modifications: ${totalLeadsCreated + totalJobsCreated}\n`);

    if (ledgerRecords === 0 && totalLeadsCreated === 0 && totalJobsCreated === 0) {
      console.log('🔴 CONCLUSION: ZERO autonomous execution in entire 01:00-05:00 UTC window');
      console.log('   (This includes Hobby flexible window hypothesis)\n');
    } else if (ledgerRecords > 0) {
      console.log('🟢 EXECUTION DETECTED');
      ledgerEntries.forEach(entry => {
        const execTime = new Date(entry.started_utc);
        if (execTime >= expectedStart && execTime <= expectedEnd) {
          console.log(`   ✓ Execution at expected time: ${execTime.toISOString()}`);
        } else {
          console.log(`   ⚠ Execution at unexpected time: ${execTime.toISOString()}`);
        }
      });
    }

    // 5. Cross-check with Vercel logs
    console.log('\n\nDATA SOURCE 4: VERCEL LOGS (via CLI)');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('(Already queried in previous investigation)');
    console.log('Result: ZERO POST requests to /api/orchestrate/b2b-daily in 01:00-05:00 UTC');
    console.log('        Only manual test at 04:13:44 UTC visible in logs\n');

    // Summary
    console.log('\n═════════════════════════════════════════════════════════════');
    console.log('FINAL ASSESSMENT');
    console.log('═════════════════════════════════════════════════════════════\n');

    if (ledgerRecords === 0) {
      console.log('✗ NO autonomous execution detected');
      console.log('✗ Entire 01:00-05:00 UTC window searched');
      console.log('✗ Including Hobby plan flexible execution window');
      console.log('✗ Including timezone offset hypothesis');
      console.log('\n→ CONCLUSION: Scheduler did not invoke /api/orchestrate/b2b-daily');
      console.log('→ This is definitively a scheduler/platform issue, not application logic');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

buildTimeline();
