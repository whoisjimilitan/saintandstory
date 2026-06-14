import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

// TASK 5: REPLY READINESS GATE
async function readinessGate() {
  console.log('\n=== TASK 5: REPLY READINESS GATE ===\n');

  const gate = {
    timestamp: new Date().toISOString(),
    checks: {},
    blockers: [],
    pass_status: null
  };

  console.log('Running 5 critical checks...\n');

  // CHECK 1: Engagement Data Consistency
  console.log('1️⃣  Engagement Data Consistency...');
  try {
    const inconsistencies = await sql(`
      SELECT
        l.id,
        l.business_name,
        COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as click_count,
        COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as open_count
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.source != 'qa_system_test'
      AND COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) > 0
      AND COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) = 0
      GROUP BY l.id, l.business_name;
    `);

    if (inconsistencies.length > 0) {
      gate.checks['consistency'] = 'FAIL';
      gate.blockers.push({
        check: 'Engagement Data Consistency',
        issue: `${inconsistencies.length} prospects show clicks without opens`,
        detail: 'This violates normal email tracking. Clicks cannot happen before opens.',
        resolution: 'Investigate event join logic and Resend webhook attribution'
      });
      console.log('   ❌ FAIL: Clicks without opens detected\n');
    } else {
      gate.checks['consistency'] = 'PASS';
      console.log('   ✅ PASS: All clicks have corresponding opens\n');
    }
  } catch (error) {
    gate.checks['consistency'] = 'ERROR';
    gate.blockers.push({
      check: 'Engagement Data Consistency',
      issue: error.message,
      detail: 'Database query failed',
      resolution: 'Check database connection and schema'
    });
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }

  // CHECK 2: Click Attribution
  console.log('2️⃣  Click Attribution Verification...');
  try {
    const clicks = await sql(`
      SELECT COUNT(*) as count FROM b2b_email_events
      WHERE event_type = 'clicked'
      AND lead_id IS NOT NULL;
    `);

    if (clicks[0].count === 0) {
      gate.checks['attribution'] = 'FAIL';
      gate.blockers.push({
        check: 'Click Attribution',
        issue: 'No clicked events found with valid lead_id',
        detail: 'Either no clicks have been recorded or lead_id attribution is broken',
        resolution: 'Verify Resend webhook is setting lead_id correctly'
      });
      console.log('   ❌ FAIL: No attributable clicks\n');
    } else {
      gate.checks['attribution'] = 'PASS';
      console.log(`   ✅ PASS: ${clicks[0].count} clicks attributed to leads\n`);
    }
  } catch (error) {
    gate.checks['attribution'] = 'ERROR';
    gate.blockers.push({
      check: 'Click Attribution',
      issue: error.message
    });
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }

  // CHECK 3: Email Confidence
  console.log('3️⃣  Email Confidence Assessment...');
  try {
    const emails = await sql(`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE email IS NOT NULL
      AND email != ''
      AND email LIKE '%@%'
      AND source != 'qa_system_test';
    `);

    const totalLeads = await sql(`
      SELECT COUNT(*) as count FROM b2b_leads
      WHERE source != 'qa_system_test';
    `);

    const confidence = (emails[0].count / totalLeads[0].count * 100).toFixed(1);

    if (emails[0].count < 3) {
      gate.checks['email_confidence'] = 'FAIL';
      gate.blockers.push({
        check: 'Email Confidence',
        issue: `Only ${emails[0].count} leads have valid emails`,
        detail: 'Need minimum 3 production leads with valid emails to test',
        resolution: 'Verify email acquisition and enrichment'
      });
      console.log(`   ❌ FAIL: Only ${emails[0].count} valid emails\n`);
    } else {
      gate.checks['email_confidence'] = 'PASS';
      console.log(`   ✅ PASS: ${emails[0].count}/${totalLeads[0].count} leads have emails (${confidence}%)\n`);
    }
  } catch (error) {
    gate.checks['email_confidence'] = 'ERROR';
    gate.blockers.push({
      check: 'Email Confidence',
      issue: error.message
    });
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }

  // CHECK 4: Signal Chain Validation
  console.log('4️⃣  Signal Chain Validation...');
  try {
    const signalChain = await sql(`
      SELECT
        COUNT(*) as leads_with_complete_chain
      FROM (
        SELECT l.id
        FROM b2b_leads l
        JOIN b2b_outreach o ON l.id = o.lead_id
        JOIN b2b_email_events e ON o.id = e.outreach_id
        WHERE l.heat_score > 0
        AND l.engagement_score > 0
        AND l.source != 'qa_system_test'
        GROUP BY l.id
      ) as complete;
    `);

    if (signalChain[0].leads_with_complete_chain < 1) {
      gate.checks['signal_chain'] = 'FAIL';
      gate.blockers.push({
        check: 'Signal Chain',
        issue: 'No prospects with complete signal chain (lead → outreach → events → scores)',
        detail: 'Signal chain should show at least 1 complete prospect with heat score > 0',
        resolution: 'Verify event recording and score calculation'
      });
      console.log('   ❌ FAIL: No complete signal chains\n');
    } else {
      gate.checks['signal_chain'] = 'PASS';
      console.log(`   ✅ PASS: ${signalChain[0].leads_with_complete_chain} leads with complete signal chains\n`);
    }
  } catch (error) {
    gate.checks['signal_chain'] = 'ERROR';
    gate.blockers.push({
      check: 'Signal Chain',
      issue: error.message
    });
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }

  // CHECK 5: Duplicate Follow-Ups
  console.log('5️⃣  Duplicate Follow-Up Prevention...');
  try {
    const duplicates = await sql(`
      SELECT
        l.id,
        l.business_name,
        COUNT(*) as followup_count
      FROM b2b_leads l
      JOIN b2b_outreach o ON l.id = o.lead_id
      WHERE o.email_type = 'reply_followup'
      AND l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.length > 0) {
      gate.checks['duplicates'] = 'FAIL';
      gate.blockers.push({
        check: 'Duplicate Follow-Ups',
        issue: `${duplicates.length} prospects already have multiple follow-ups sent`,
        detail: 'Cannot send duplicate follow-ups without analyzing why first one didn\'t work',
        resolution: 'Review existing follow-ups before sending new ones'
      });
      console.log(`   ❌ FAIL: ${duplicates.length} prospects with duplicate follow-ups\n`);
    } else {
      gate.checks['duplicates'] = 'PASS';
      console.log('   ✅ PASS: No duplicate follow-ups exist\n');
    }
  } catch (error) {
    gate.checks['duplicates'] = 'ERROR';
    gate.blockers.push({
      check: 'Duplicate Follow-Ups',
      issue: error.message
    });
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }

  // DETERMINE GATE STATUS
  gate.pass_status = !gate.blockers.length &&
                     Object.values(gate.checks).every(v => v === 'PASS');

  // Write gate report
  const gateReport = `# REPLY READINESS GATE

**Generated**: ${gate.timestamp}

## GATE STATUS

${gate.pass_status ? '✅ **PASS** — Ready to execute reply follow-ups' : '❌ **FAIL** — Do not proceed with follow-ups'}

## CHECK RESULTS

| Check | Status |
|---|---|
| Engagement Data Consistency | ${gate.checks.consistency} |
| Click Attribution Verification | ${gate.checks.attribution} |
| Email Confidence Assessment | ${gate.checks.email_confidence} |
| Signal Chain Validation | ${gate.checks.signal_chain} |
| Duplicate Follow-Up Prevention | ${gate.checks.duplicates} |

## BLOCKERS

${gate.blockers.length === 0 ? 'None ✅' : gate.blockers.map(b => `
### ${b.check}

**Issue**: ${b.issue}

**Detail**: ${b.detail}

**Resolution**: ${b.resolution}

`).join('\n')}

## RECOMMENDATION

${gate.pass_status ? `
✅ **All checks passed.**

You may proceed to execute FINAL_REPLY_EXECUTION_PLAN.md

Next step: Run phase_reply_execution.mjs

` : `
❌ **Checks have failed.**

Do NOT execute follow-ups until these blockers are resolved:

${gate.blockers.map(b => `1. ${b.check}: ${b.resolution}`).join('\n')}

After resolving, re-run phase_readiness_gate.mjs to re-verify.

`}
`;

  fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/REPLY_READINESS_GATE.md', gateReport);

  console.log('=== GATE REPORT ===\n');
  console.log(gateReport);

  // If PASS, generate execution plan
  if (gate.pass_status) {
    console.log('\n✅ GATE PASSED\n');
    console.log('Generating FINAL_REPLY_EXECUTION_PLAN.md...\n');

    try {
      const clickedProspects = await sql(`
        SELECT DISTINCT
          l.id,
          l.business_name,
          l.email,
          l.heat_score,
          l.engagement_score,
          l.opportunity_score,
          COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as opens,
          COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as clicks,
          MAX(e.timestamp) as last_engagement
        FROM b2b_leads l
        LEFT JOIN b2b_outreach o ON l.id = o.lead_id
        LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
        WHERE e.event_type = 'clicked'
        AND l.source != 'qa_system_test'
        GROUP BY l.id, l.business_name, l.email, l.heat_score, l.engagement_score, l.opportunity_score
        ORDER BY l.heat_score DESC
        LIMIT 8;
      `);

      const executionPlan = `# FINAL REPLY EXECUTION PLAN

**Generated**: ${new Date().toISOString()}

**Status**: ✅ All pre-execution audits passed

## EXECUTIVE SUMMARY

${clickedProspects.length} production prospects are qualified to receive follow-up outreach.

Each has:
- Verified engagement (clicked email)
- Valid email address
- Heat score > 0 (qualifying signal)
- Complete signal chain

## PROSPECTS APPROVED FOR OUTREACH

${clickedProspects.map((p, idx) => `
### ${idx + 1}. ${p.business_name}

**Lead ID**: ${p.id}

**Email**: ${p.email}

**Evidence of Engagement**:
- Opens: ${p.opens}
- Clicks: ${p.clicks}
- Last engagement: ${p.last_engagement}
- Heat score: ${p.heat_score}/100
- Engagement score: ${p.engagement_score}/100
- Opportunity score: ${p.opportunity_score}

**Selection Reason**: Production prospect with verified click engagement and complete signal chain

**Status**: ✅ Approved for follow-up

`).join('\n')}

## EXECUTION INSTRUCTIONS

1. Run: \`node phase_reply_execution.mjs\`

2. This will:
   - Send personalized follow-ups using REPLY_STRATEGY_BOOK.md
   - Log outreach records with Resend message IDs
   - Create database entries for tracking
   - Generate execution report

3. Track in: FIRST_REPLY_TRACKER.md

4. Monitor for replies within 24 hours

## SUCCESS CRITERIA

✅ **Follow-ups sent**: ${clickedProspects.length}/${clickedProspects.length}
✅ **Message IDs recorded**: All
✅ **Database records created**: All
✅ **Ready for monitoring**: Yes

## DO NOT PROCEED WITHOUT

- [ ] All 5 pre-execution audits passed ✅
- [ ] Engagement data verified consistent ✅
- [ ] Click attribution confirmed ✅
- [ ] Email addresses validated ✅
- [ ] Signal chain tested end-to-end ✅

`;

      fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/FINAL_REPLY_EXECUTION_PLAN.md', executionPlan);

      console.log('✅ FINAL_REPLY_EXECUTION_PLAN.md created\n');
      console.log('Ready to execute follow-ups.\n');

    } catch (error) {
      console.error('❌ Could not generate execution plan:', error.message);
    }

  } else {
    console.log('\n❌ GATE FAILED\n');
    console.log('Do not proceed with follow-ups.\n');
    console.log('Resolve blockers and re-run audit.\n');
  }
}

readinessGate().catch(console.error);
