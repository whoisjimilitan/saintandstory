#!/bin/bash

# MORNING OPERATIONS REPORT
# Run this script each morning to see what autonomy produced overnight
# Usage: ./morning-report.sh

cd "$(dirname "$0")" || exit

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║           MORNING OPERATIONS REPORT - B2B Autonomy Layer           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

npx tsx --env-file=.env.local -e "
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function report() {
  try {
    // Get today's latest run
    const runs = await sql\`
      SELECT
        run_id,
        started_at,
        completed_at,
        status,
        discovery_count,
        leads_created,
        jobs_created,
        drivers_matched,
        emails_sent,
        standing_orders_processed,
        failures
      FROM b2b_orchestration_logs
      WHERE DATE(started_at) = CURRENT_DATE
      ORDER BY started_at DESC
      LIMIT 1
    \`;

    if (runs.length === 0) {
      console.log('⏳ No execution recorded yet for today.');
      console.log('Cron is scheduled for 02:00 UTC.');
      console.log('');
      return;
    }

    const run = runs[0];
    const duration = Math.round(
      (new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000
    );

    console.log('✅ AUTONOMY EXECUTED TODAY');
    console.log('');
    console.log('Execution ID:          ' + run.run_id);
    console.log('Started:               ' + run.started_at);
    console.log('Duration:              ' + duration + ' seconds');
    console.log('Status:                ' + run.status);
    console.log('');
    console.log('PRODUCTION:');
    console.log('  Businesses Found:    ' + run.discovery_count);
    console.log('  Leads Created:       ' + run.leads_created);
    console.log('  Jobs Generated:      ' + run.jobs_created);
    console.log('');
    console.log('ENGAGEMENT:');
    console.log('  Driver Matches:      ' + run.drivers_matched);
    console.log('  Recognition Emails:  ' + run.emails_sent);
    console.log('  Standing Orders:     ' + run.standing_orders_processed);
    console.log('');

    if (run.failures && run.failures.length > 0) {
      console.log('⚠️  FAILURES TO ADDRESS:');
      for (const failure of run.failures) {
        console.log('  • ' + failure);
      }
      console.log('');
    } else {
      console.log('✅ No failures recorded');
      console.log('');
    }

    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║ The system discovered, matched, and created work while you slept.  ║');
    console.log('║ Get on with it.                                                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');

  } catch (err) {
    console.error('Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

report();
" 2>&1
