import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function diagnoseReplyReadiness() {
  console.log('\n=== REPLY EXECUTION DIAGNOSTIC ===\n');

  try {
    // 1. Check if clicked prospects exist
    console.log('1️⃣  CHECKING CLICKED PROSPECTS...\n');

    const clickedProspects = await sql(`
      SELECT DISTINCT
        l.id,
        l.business_name,
        l.email,
        l.heat_score,
        l.engagement_score,
        COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as click_count,
        COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as open_count,
        COUNT(CASE WHEN e.event_type = 'replied' THEN 1 END) as reply_count,
        MAX(e.timestamp) as last_engagement
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.email, l.heat_score, l.engagement_score
      ORDER BY l.heat_score DESC, last_engagement DESC;
    `);

    console.log(`✅ Found ${clickedProspects.length} production clicked prospects\n`);

    if (clickedProspects.length === 0) {
      console.log('⚠️  ISSUE: No clicked prospects found');
      console.log('Expected: 45 leads were outreached, 18 opened, 8 should have clicked\n');
      return;
    }

    if (clickedProspects.length < 8) {
      console.log(`⚠️  WARNING: Only ${clickedProspects.length} clicked prospects (expected 8)\n`);
    }

    console.log('CLICKED PROSPECTS:');
    clickedProspects.forEach((p, i) => {
      const status = p.reply_count > 0 ? '✅ REPLIED' : '⏳ NO REPLY';
      console.log(`   ${i + 1}. ${p.business_name}`);
      console.log(`      Heat: ${p.heat_score}/100 | Opens: ${p.open_count} | Clicks: ${p.click_count} | ${status}`);
      console.log(`      Email: ${p.email || '❌ MISSING'}`);
      console.log('');
    });

    // 2. Check if any have already been followed up
    console.log('\n2️⃣  CHECKING FOR EXISTING FOLLOW-UPS...\n');

    const followUpsSent = await sql(`
      SELECT DISTINCT l.business_name, COUNT(*) as followup_count
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      WHERE o.email_type = 'reply_followup'
      GROUP BY l.business_name;
    `);

    if (followUpsSent.length > 0) {
      console.log(`⚠️  WARNING: ${followUpsSent.length} prospects already have follow-ups:\n`);
      followUpsSent.forEach(p => {
        console.log(`   ${p.business_name}: ${p.followup_count} follow-ups sent`);
      });
    } else {
      console.log('✅ No follow-ups sent yet (clean slate)\n');
    }

    // 3. Check database connectivity
    console.log('\n3️⃣  CHECKING DATABASE TABLES...\n');

    try {
      const tables = await sql(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('b2b_leads', 'b2b_outreach', 'b2b_email_events')
        ORDER BY table_name;
      `);

      console.log(`✅ Found ${tables.length}/3 required tables:`);
      tables.forEach(t => console.log(`   ✓ ${t.table_name}`));

      if (tables.length < 3) {
        console.log('\n⚠️  Missing tables — follow-up tracking may fail');
      }
    } catch (err) {
      console.log(`❌ Database schema check failed: ${err.message}`);
    }

    // 4. Check Resend API
    console.log('\n4️⃣  CHECKING RESEND API...\n');

    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY not set in environment');
      console.log('   Email sending will fail. Set RESEND_API_KEY before running phase_reply_execution.mjs');
    } else {
      console.log('✅ RESEND_API_KEY is set');
    }

    // 5. Summary
    console.log('\n5️⃣  EXECUTION READINESS\n');

    const readyToSend = clickedProspects.length >= 3 &&
                        clickedProspects.filter(p => p.email).length >= 3 &&
                        process.env.RESEND_API_KEY;

    if (readyToSend) {
      console.log('✅ READY TO EXECUTE');
      console.log('\nNext steps:');
      console.log('1. Run: node phase_reply_execution.mjs');
      console.log('2. Monitor inbox for replies');
      console.log('3. Update FIRST_REPLY_TRACKER.md with timestamps');
      console.log('4. When first reply arrives, execute FIRST_MEETING_PLAYBOOK');
    } else {
      console.log('⚠️  NOT READY TO EXECUTE');
      console.log('\nIssues to resolve:');
      if (clickedProspects.length < 3) {
        console.log(`   • Only ${clickedProspects.length} prospects (need 3+)`);
      }
      if (clickedProspects.filter(p => p.email).length < 3) {
        console.log(`   • Only ${clickedProspects.filter(p => p.email).length} have emails`);
      }
      if (!process.env.RESEND_API_KEY) {
        console.log('   • RESEND_API_KEY not configured');
      }
    }

  } catch (error) {
    console.error('\n❌ DIAGNOSTIC FAILED:\n', error.message);
    console.log('\nThis likely means:');
    console.log('- Database is not connected');
    console.log('- Tables do not exist');
    console.log('- Schema is incorrect');
  }

  console.log('\n=== END DIAGNOSTIC ===\n');
}

diagnoseReplyReadiness().catch(console.error);
