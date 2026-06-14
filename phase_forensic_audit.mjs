import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

// TASK 1: ENGAGEMENT FORENSICS
async function clickForensics() {
  console.log('\n=== TASK 1: CLICK FORENSICS ===\n');

  try {
    const report = {
      timestamp: new Date().toISOString(),
      query_intent: 'For every prospect showing clicks, prove they are real and trace event sequence',
      findings: [],
      summary: {},
      data_quality_issues: []
    };

    // Get all production leads with any engagement
    const allLeads = await sql(`
      SELECT
        l.id,
        l.business_name,
        l.email,
        l.engagement_score,
        l.source,
        l.created_at,
        COUNT(DISTINCT o.id) as outreach_count,
        MAX(o.sent_at) as last_outreach_sent,
        SUM(CASE WHEN e.event_type = 'opened' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN e.event_type = 'clicked' THEN 1 ELSE 0 END) as click_count,
        SUM(CASE WHEN e.event_type = 'replied' THEN 1 ELSE 0 END) as reply_count,
        SUM(CASE WHEN e.event_type = 'bounced' THEN 1 ELSE 0 END) as bounce_count,
        SUM(CASE WHEN e.event_type = 'complained' THEN 1 ELSE 0 END) as complaint_count
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.source != 'qa_system_test'
      GROUP BY l.id, l.business_name, l.email, l.engagement_score, l.source, l.created_at
      HAVING COUNT(DISTINCT o.id) > 0
      ORDER BY l.created_at DESC;
    `);

    console.log(`Found ${allLeads.length} production leads with outreach.\n`);

    // Now for each lead with clicks, get detailed event sequence
    for (const lead of allLeads) {
      if (lead.click_count > 0) {
        // Get detailed event sequence for this lead
        const events = await sql(`
          SELECT
            o.id as outreach_id,
            o.resend_message_id,
            o.email_type,
            o.sent_at,
            e.id as event_id,
            e.event_type,
            e.timestamp,
            e.metadata
          FROM b2b_outreach o
          LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
          WHERE o.lead_id = ${lead.id}
          ORDER BY o.sent_at ASC, e.timestamp ASC;
        `);

        const prospect = {
          lead_id: lead.id,
          business_name: lead.business_name,
          email: lead.email,
          engagement_score: lead.engagement_score,
          email_source: lead.source,
          outreach_events: []
        };

        // Group events by outreach
        const outreachGroups = {};
        events.forEach(evt => {
          if (!outreachGroups[evt.outreach_id]) {
            outreachGroups[evt.outreach_id] = {
              outreach_id: evt.outreach_id,
              resend_message_id: evt.resend_message_id,
              email_type: evt.email_type,
              sent_at: evt.sent_at,
              events: []
            };
          }
          if (evt.event_id) {
            outreachGroups[evt.outreach_id].events.push({
              event_type: evt.event_type,
              timestamp: evt.timestamp,
              metadata: evt.metadata
            });
          }
        });

        prospect.outreach_events = Object.values(outreachGroups);

        // Check for data quality issues
        const eventSequence = prospect.outreach_events.flatMap(o => o.events);
        const clickEvents = eventSequence.filter(e => e.event_type === 'clicked');
        const openEvents = eventSequence.filter(e => e.event_type === 'opened');

        if (clickEvents.length > 0 && openEvents.length === 0) {
          report.data_quality_issues.push({
            lead_id: lead.id,
            business_name: lead.business_name,
            issue: 'CLICK WITHOUT OPEN',
            severity: 'CRITICAL',
            detail: `${clickEvents.length} clicks recorded but 0 opens. This violates normal email tracking behavior.`,
            possible_causes: [
              'Click event recorded before open event reaches database',
              'Event join is missing opens',
              'Different Resend events are being attributed to different outreach records',
              'Tracking pixel artifact',
              'Webhook attribution error'
            ]
          });
        }

        report.findings.push(prospect);
      }
    }

    report.summary = {
      total_leads_examined: allLeads.length,
      leads_with_clicks: allLeads.filter(l => l.click_count > 0).length,
      leads_with_opens_and_clicks: allLeads.filter(l => l.click_count > 0 && l.open_count > 0).length,
      leads_with_clicks_but_no_opens: allLeads.filter(l => l.click_count > 0 && l.open_count === 0).length,
      data_integrity_issues_found: report.data_quality_issues.length
    };

    // Write report
    const reportContent = `# CLICK FORENSICS REPORT

**Generated**: ${report.timestamp}

## SUMMARY

- **Total production leads examined**: ${report.summary.total_leads_examined}
- **Leads with clicks**: ${report.summary.leads_with_clicks}
- **Leads with opens AND clicks**: ${report.summary.leads_with_opens_and_clicks}
- **⚠️ Leads with clicks but NO opens**: ${report.summary.leads_with_clicks_but_no_opens}
- **Data integrity issues found**: ${report.data_quality_issues.length}

## DATA QUALITY ISSUES

${report.data_quality_issues.length === 0 ? '✅ None detected' : report.data_quality_issues.map(issue => `
### ${issue.issue}

**Lead**: ${issue.business_name} (ID: ${issue.lead_id})

**Severity**: ${issue.severity}

**Detail**: ${issue.detail}

**Possible Causes**:
${issue.possible_causes.map(c => `- ${c}`).join('\n')}

`).join('\n')}

## DETAILED FINDINGS

${report.findings.map(prospect => `
### ${prospect.business_name}

**Lead ID**: ${prospect.lead_id}

**Email**: ${prospect.email}

**Engagement Score**: ${prospect.engagement_score}/100

**Email Source**: ${prospect.email_source}

**Outreach Events**:
${prospect.outreach_events.map((outreach, idx) => `
#### Send ${idx + 1}

- **Outreach ID**: ${outreach.outreach_id}
- **Resend Message ID**: ${outreach.resend_message_id}
- **Email Type**: ${outreach.email_type}
- **Sent At**: ${outreach.sent_at}

**Event Sequence**:
${outreach.events.length === 0 ? '- No events recorded' : outreach.events.map(evt => `- **${evt.event_type}** @ ${evt.timestamp}`).join('\n')}

`).join('\n')}

`).join('\n')}

## INTERPRETATION

${report.summary.leads_with_clicks_but_no_opens > 0 ? `
⚠️ **CRITICAL FINDING**

${report.summary.leads_with_clicks_but_no_opens} prospects show clicks without opens.

This is impossible in normal email tracking behavior.

**Next Steps**:
1. Verify the event join logic in the query
2. Check if Resend webhooks are merging events correctly
3. Examine raw b2b_email_events table for this lead
4. Verify outreach IDs match message IDs
5. Check if events from multiple outreach records are being consolidated

**Do NOT proceed with follow-ups until this is resolved.**

` : `
✅ **PASS**: All click events have corresponding open events
`}

## CONCLUSION

${report.data_quality_issues.length === 0 ? '✅ ENGAGEMENT DATA APPEARS CONSISTENT' : '❌ ENGAGEMENT DATA HAS INTEGRITY ISSUES - DO NOT PROCEED'}
`;

    fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/CLICK_FORENSICS_REPORT.md', reportContent);

    console.log('✅ CLICK_FORENSICS_REPORT.md created\n');
    console.log(reportContent);

    return report.data_quality_issues.length === 0;

  } catch (error) {
    console.error('❌ FORENSICS FAILED:', error.message);
    return false;
  }
}

// TASK 2: EMAIL CONFIDENCE AUDIT
async function emailConfidenceAudit() {
  console.log('\n=== TASK 2: EMAIL CONFIDENCE AUDIT ===\n');

  try {
    const leads = await sql(`
      SELECT
        l.id,
        l.business_name,
        l.email,
        l.source,
        l.created_at
      FROM b2b_leads l
      WHERE l.source != 'qa_system_test'
      ORDER BY l.created_at DESC;
    `);

    const confidence = {
      VERIFIED: [],
      SCRAPED: [],
      DOMAIN_DERIVED: [],
      PATTERN_GENERATED: [],
      MANUAL: [],
      UNKNOWN: []
    };

    leads.forEach(lead => {
      // Simple heuristic: check email pattern
      if (lead.email.includes('@') && lead.email.length > 10) {
        // Check if it looks domain-derived (like name@business.co.uk)
        const parts = lead.email.split('@');
        const domain = parts[1];

        if (domain && lead.business_name) {
          const businessDomain = lead.business_name.toLowerCase().replace(/\s+/g, '');
          const possibleDomains = [
            businessDomain + '.com',
            businessDomain + '.co.uk',
            businessDomain + '.uk',
            businessDomain.split(' ')[0] + '.com',
            businessDomain.split(' ')[0] + '.co.uk'
          ];

          if (possibleDomains.includes(domain.toLowerCase())) {
            confidence.DOMAIN_DERIVED.push(lead);
          } else if (['info', 'contact', 'enquiries', 'hello', 'support'].some(prefix => lead.email.startsWith(prefix + '@'))) {
            confidence.PATTERN_GENERATED.push(lead);
          } else {
            confidence.UNKNOWN.push(lead);
          }
        } else {
          confidence.UNKNOWN.push(lead);
        }
      } else {
        confidence.UNKNOWN.push(lead);
      }
    });

    const reportContent = `# EMAIL CONFIDENCE AUDIT

**Date**: ${new Date().toISOString()}

## SUMMARY

| Confidence Level | Count | Percentage |
|---|---|---|
| VERIFIED | ${confidence.VERIFIED.length} | ${(confidence.VERIFIED.length / leads.length * 100).toFixed(1)}% |
| SCRAPED | ${confidence.SCRAPED.length} | ${(confidence.SCRAPED.length / leads.length * 100).toFixed(1)}% |
| DOMAIN-DERIVED | ${confidence.DOMAIN_DERIVED.length} | ${(confidence.DOMAIN_DERIVED.length / leads.length * 100).toFixed(1)}% |
| PATTERN-GENERATED | ${confidence.PATTERN_GENERATED.length} | ${(confidence.PATTERN_GENERATED.length / leads.length * 100).toFixed(1)}% |
| MANUAL | ${confidence.MANUAL.length} | ${(confidence.MANUAL.length / leads.length * 100).toFixed(1)}% |
| UNKNOWN | ${confidence.UNKNOWN.length} | ${(confidence.UNKNOWN.length / leads.length * 100).toFixed(1)}% |

**Total Production Leads**: ${leads.length}

## DEFINITIONS

**VERIFIED**: Email address confirmed by prospect directly (replied to email, or manually confirmed)

**SCRAPED**: Email extracted from public directory or website

**DOMAIN-DERIVED**: Email constructed from business name + known domain pattern

**PATTERN-GENERATED**: Email constructed using generic patterns (info@, contact@, enquiries@)

**MANUAL**: Email added manually by operator

**UNKNOWN**: Email source cannot be determined from available data

## DETAIL BY CATEGORY

### VERIFIED
${confidence.VERIFIED.length === 0 ? '(none)' : confidence.VERIFIED.map(l => `- ${l.business_name}: ${l.email}`).join('\n')}

### DOMAIN-DERIVED
${confidence.DOMAIN_DERIVED.length === 0 ? '(none)' : confidence.DOMAIN_DERIVED.map(l => `- ${l.business_name}: ${l.email}`).join('\n')}

### PATTERN-GENERATED
${confidence.PATTERN_GENERATED.length === 0 ? '(none)' : confidence.PATTERN_GENERATED.map(l => `- ${l.business_name}: ${l.email}`).join('\n')}

### UNKNOWN
${confidence.UNKNOWN.length === 0 ? '(none)' : confidence.UNKNOWN.map(l => `- ${l.business_name}: ${l.email}`).join('\n')}

## RISK ASSESSMENT

**High Confidence (VERIFIED + SCRAPED)**: ${confidence.VERIFIED.length + confidence.SCRAPED.length} leads

**Medium Confidence (DOMAIN-DERIVED)**: ${confidence.DOMAIN_DERIVED.length} leads

**Low Confidence (PATTERN-GENERATED + UNKNOWN)**: ${confidence.PATTERN_GENERATED.length + confidence.UNKNOWN.length} leads

**Recommendation**: Do not send follow-ups to low-confidence email addresses until verified.
`;

    fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/EMAIL_CONFIDENCE_AUDIT.md', reportContent);

    console.log('✅ EMAIL_CONFIDENCE_AUDIT.md created\n');
    console.log(reportContent);

  } catch (error) {
    console.error('❌ EMAIL AUDIT FAILED:', error.message);
  }
}

// TASK 3: DELIVERY VALIDATION
async function deliveryValidation() {
  console.log('\n=== TASK 3: DELIVERY VALIDATION ===\n');

  try {
    const outreach = await sql(`
      SELECT
        o.id,
        o.resend_message_id,
        o.sent_at,
        l.business_name,
        l.email,
        COUNT(CASE WHEN e.event_type = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN e.event_type = 'opened' THEN 1 END) as opened_count,
        COUNT(CASE WHEN e.event_type = 'clicked' THEN 1 END) as clicked_count,
        COUNT(CASE WHEN e.event_type = 'bounced' THEN 1 END) as bounced_count,
        COUNT(CASE WHEN e.event_type = 'complained' THEN 1 END) as complained_count,
        COUNT(CASE WHEN e.event_type = 'replied' THEN 1 END) as replied_count
      FROM b2b_outreach o
      JOIN b2b_leads l ON o.lead_id = l.id
      LEFT JOIN b2b_email_events e ON o.id = e.outreach_id
      WHERE l.source != 'qa_system_test'
      GROUP BY o.id, o.resend_message_id, o.sent_at, l.business_name, l.email
      ORDER BY o.sent_at DESC;
    `);

    const reportContent = `# DELIVERY VALIDATION REPORT

**Date**: ${new Date().toISOString()}

## SUMMARY

**Total Outreach Records**: ${outreach.length}

| Event Type | Count |
|---|---|
| Delivered | ${outreach.reduce((sum, o) => sum + o.delivered_count, 0)} |
| Opened | ${outreach.reduce((sum, o) => sum + o.opened_count, 0)} |
| Clicked | ${outreach.reduce((sum, o) => sum + o.clicked_count, 0)} |
| Bounced | ${outreach.reduce((sum, o) => sum + o.bounced_count, 0)} |
| Complained | ${outreach.reduce((sum, o) => sum + o.complained_count, 0)} |
| Replied | ${outreach.reduce((sum, o) => sum + o.replied_count, 0)} |

## DETAIL

${outreach.map(o => `
### ${o.business_name}

- **Email**: ${o.email}
- **Outreach ID**: ${o.id}
- **Resend Message ID**: ${o.resend_message_id}
- **Sent At**: ${o.sent_at}

**Events**:
- Delivered: ${o.delivered_count}
- Opened: ${o.opened_count}
- Clicked: ${o.clicked_count}
- Bounced: ${o.bounced_count}
- Complained: ${o.complained_count}
- Replied: ${o.replied_count}

`).join('\n')}

## FINDINGS

**Emails with no delivery event**: ${outreach.filter(o => o.delivered_count === 0).length}

**⚠️ This may indicate**:
- Delivery event webhook not firing
- Resend integration issue
- Database logging issue

`;

    fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/DELIVERY_VALIDATION_REPORT.md', reportContent);

    console.log('✅ DELIVERY_VALIDATION_REPORT.md created\n');
    console.log(reportContent);

  } catch (error) {
    console.error('❌ DELIVERY VALIDATION FAILED:', error.message);
  }
}

async function main() {
  console.log('🔍 PRE-REPLY EXECUTION AUDIT\n');
  console.log('OBJECTIVE: Prove all commercial signals are real before follow-up outreach\n');

  const forensicsPass = await clickForensics();
  await emailConfidenceAudit();
  await deliveryValidation();

  console.log('\n=== AUDIT SUMMARY ===\n');
  console.log('Generated files:');
  console.log('1. CLICK_FORENSICS_REPORT.md');
  console.log('2. EMAIL_CONFIDENCE_AUDIT.md');
  console.log('3. DELIVERY_VALIDATION_REPORT.md');
  console.log('\nNext:');
  console.log('Review all three reports.');
  console.log('If any issues found, resolve before proceeding to follow-up execution.');
}

main().catch(console.error);
