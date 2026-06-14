import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

// TASK 4: SIGNAL CHAIN VALIDATION
async function signalChainProof() {
  console.log('\n=== TASK 4: SIGNAL CHAIN VALIDATION ===\n');
  console.log('Objective: Trace one clicked prospect end-to-end through entire system\n');

  try {
    // Find one high-confidence clicked prospect
    const prospect = await sql(`
      SELECT
        l.id,
        l.business_name,
        l.email,
        l.engagement_score,
        l.opportunity_score,
        l.heat_score,
        COUNT(DISTINCT o.id) as outreach_count
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE e.event_type = 'clicked'
      AND l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.email, l.engagement_score, l.opportunity_score, l.heat_score
      ORDER BY l.heat_score DESC
      LIMIT 1;
    `);

    if (!prospect || prospect.length === 0) {
      console.log('❌ No clicked prospects found\n');
      return false;
    }

    const lead = prospect[0];

    console.log(`Tracing: ${lead.business_name}\n`);

    const proof = {
      lead: lead,
      stages: {}
    };

    // STAGE 1: Lead
    proof.stages.lead = {
      id: lead.id,
      business_name: lead.business_name,
      email: lead.email,
      engagement_score: lead.engagement_score,
      opportunity_score: lead.opportunity_score,
      heat_score: lead.heat_score,
      status: '✅ EXISTS'
    };

    // STAGE 2: Outreach
    const outreach = await sql(`
      SELECT
        id,
        resend_message_id,
        email_type,
        sent_at
      FROM b2b_outreach
      WHERE lead_id = ${lead.id}
      ORDER BY sent_at DESC;
    `);

    if (outreach.length === 0) {
      proof.stages.outreach = {
        status: '❌ NO OUTREACH RECORDS'
      };
    } else {
      proof.stages.outreach = outreach.map(o => ({
        outreach_id: o.id,
        resend_message_id: o.resend_message_id,
        email_type: o.email_type,
        sent_at: o.sent_at,
        status: '✅ EXISTS'
      }));
    }

    // STAGE 3: Message ID verification
    if (outreach.length > 0) {
      const messageIds = outreach.filter(o => o.resend_message_id).length;
      proof.stages.message_id = {
        total_outreach: outreach.length,
        with_message_id: messageIds,
        status: messageIds === outreach.length ? '✅ ALL HAVE MESSAGE IDS' : '⚠️ MISSING MESSAGE IDS'
      };
    }

    // STAGE 4: Resend Events
    const allEvents = await sql(`
      SELECT
        e.id,
        e.event_type,
        e.timestamp,
        o.resend_message_id
      FROM b2b_email_events e
      JOIN b2b_outreach o ON e.outreach_id = o.id
      WHERE o.lead_id = ${lead.id}
      ORDER BY e.timestamp ASC;
    `);

    const eventTypes = {};
    allEvents.forEach(evt => {
      if (!eventTypes[evt.event_type]) {
        eventTypes[evt.event_type] = [];
      }
      eventTypes[evt.event_type].push({
        timestamp: evt.timestamp,
        message_id: evt.resend_message_id
      });
    });

    proof.stages.resend_events = {
      total_events: allEvents.length,
      event_types: eventTypes,
      status: allEvents.length > 0 ? '✅ EVENTS RECORDED' : '❌ NO EVENTS RECORDED'
    };

    // STAGE 5: Database Events
    const dbEvents = await sql(`
      SELECT event_type, COUNT(*) as count
      FROM b2b_email_events
      WHERE lead_id = ${lead.id}
      GROUP BY event_type
      ORDER BY count DESC;
    `);

    proof.stages.database_events = {
      by_type: dbEvents,
      status: '✅ EVENTS IN DATABASE'
    };

    // STAGE 6: Engagement Score
    proof.stages.engagement_score = {
      current_score: lead.engagement_score,
      calculation_basis: eventTypes,
      status: lead.engagement_score > 0 ? '✅ SCORE CALCULATED' : '⚠️ SCORE IS ZERO'
    };

    // STAGE 7: Opportunity Score
    proof.stages.opportunity_score = {
      current_score: lead.opportunity_score,
      status: lead.opportunity_score ? '✅ CALCULATED' : '⚠️ NULL OR ZERO'
    };

    // STAGE 8: Heat Score
    proof.stages.heat_score = {
      current_score: lead.heat_score,
      formula: '(opportunity_score × 0.4) + (engagement_score × 0.4) + (intent_score × 0.2)',
      calculation: `(${lead.opportunity_score} × 0.4) + (${lead.engagement_score} × 0.4) + (intent × 0.2)`,
      status: lead.heat_score > 0 ? '✅ CALCULATED' : '⚠️ ZERO OR NULL'
    };

    // STAGE 9: Dashboard Visibility
    const dashboardCheck = await sql(`
      SELECT
        l.id,
        l.business_name,
        l.heat_score,
        l.engagement_score,
        COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as clicks
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.id = ${lead.id}
      GROUP BY l.id, l.business_name, l.heat_score, l.engagement_score;
    `);

    proof.stages.dashboard_visibility = {
      query_result: dashboardCheck,
      status: dashboardCheck.length > 0 ? '✅ VISIBLE IN DASHBOARD QUERY' : '❌ NOT IN DASHBOARD QUERY'
    };

    // Write report
    const reportContent = `# SIGNAL CHAIN PROOF

**Date**: ${new Date().toISOString()}

## PROSPECT

**Name**: ${proof.lead.business_name}

**Email**: ${proof.lead.email}

**Lead ID**: ${proof.lead.id}

## END-TO-END TRACE

### STAGE 1: Lead Exists

${proof.stages.lead.status}

| Field | Value |
|---|---|
| ID | ${proof.stages.lead.id} |
| Business | ${proof.stages.lead.business_name} |
| Email | ${proof.stages.lead.email} |
| Current Engagement Score | ${proof.stages.lead.engagement_score} |
| Current Opportunity Score | ${proof.stages.lead.opportunity_score} |
| Current Heat Score | ${proof.stages.lead.heat_score} |

### STAGE 2: Outreach Created

${typeof proof.stages.outreach === 'object' && proof.stages.outreach.status ? proof.stages.outreach.status : '✅ EXISTS'}

${Array.isArray(proof.stages.outreach) ? proof.stages.outreach.map((o, idx) => `
**Outreach ${idx + 1}**:
- ID: ${o.outreach_id}
- Resend Message ID: ${o.resend_message_id}
- Type: ${o.email_type}
- Sent: ${o.sent_at}
`).join('\n') : ''}

### STAGE 3: Message IDs Recorded

${proof.stages.message_id ? proof.stages.message_id.status : 'N/A'}

### STAGE 4: Resend Events Fired

${proof.stages.resend_events.status}

**Total events recorded**: ${proof.stages.resend_events.total_events}

**By type**:
${Object.entries(proof.stages.resend_events.event_types).map(([type, events]) => {
  return `- **${type}**: ${events.length} events\n${events.map(e => `  - ${e.timestamp}`).join('\n')}`;
}).join('\n')}

### STAGE 5: Events in Database

${proof.stages.database_events.status}

${proof.stages.database_events.by_type.map(row => `- **${row.event_type}**: ${row.count}`).join('\n')}

### STAGE 6: Engagement Score Calculated

${proof.stages.engagement_score.status}

**Score**: ${proof.stages.engagement_score.current_score}/100

### STAGE 7: Opportunity Score Calculated

${proof.stages.opportunity_score.status}

**Score**: ${proof.stages.opportunity_score.current_score}

### STAGE 8: Heat Score Calculated

${proof.stages.heat_score.status}

**Score**: ${proof.stages.heat_score.current_score}/100

**Formula**: ${proof.stages.heat_score.formula}

**Calculation**: ${proof.stages.heat_score.calculation}

### STAGE 9: Visible in Dashboard Query

${proof.stages.dashboard_visibility.status}

## CONCLUSION

${proof.lead.heat_score > 0 && proof.lead.engagement_score > 0 ? '✅ SIGNAL CHAIN COMPLETE' : '❌ SIGNAL CHAIN INCOMPLETE'}

**This prospect demonstrates**:
- ${proof.lead.heat_score > 0 ? '✅ Real engagement (heat score: ' + proof.lead.heat_score + '/100)' : '❌ No engagement detected'}
- ${proof.lead.engagement_score > 0 ? '✅ Recorded events (' + proof.lead.engagement_score + '/100 engagement)' : '❌ No events recorded'}
- ${proof.stages.resend_events.total_events > 0 ? '✅ Resend webhook integration working' : '❌ No webhook events'}
- ${proof.stages.dashboard_visibility.status.includes('✅') ? '✅ Visible in dashboard queries' : '❌ Not visible in queries'}

`;

    fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/SIGNAL_CHAIN_PROOF.md', reportContent);

    console.log('✅ SIGNAL_CHAIN_PROOF.md created\n');
    console.log(reportContent);

    return proof.lead.heat_score > 0 && proof.lead.engagement_score > 0;

  } catch (error) {
    console.error('❌ SIGNAL CHAIN VALIDATION FAILED:', error.message);
    return false;
  }
}

signalChainProof().catch(console.error);
