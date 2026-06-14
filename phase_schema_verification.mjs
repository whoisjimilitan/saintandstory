import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function schemaVerification() {
  console.log('\n=== SCHEMA VERIFICATION AUDIT ===\n');
  console.log('Objective: Verify actual database structure before running other audits\n');

  const schema = {
    timestamp: new Date().toISOString(),
    tables: {},
    assumptions_verified: [],
    assumptions_violated: [],
    critical_issues: [],
    safe_to_proceed: null
  };

  try {
    // Check b2b_leads table
    console.log('1️⃣  Checking b2b_leads table...\n');
    try {
      const leadsInfo = await sql(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'b2b_leads'
        ORDER BY ordinal_position;
      `);

      const leadsColumns = {};
      leadsInfo.forEach(col => {
        leadsColumns[col.column_name] = {
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        };
      });

      schema.tables.b2b_leads = {
        exists: true,
        columns: leadsColumns,
        column_count: leadsInfo.length
      };

      console.log(`✅ b2b_leads exists with ${leadsInfo.length} columns:\n`);
      Object.entries(leadsColumns).forEach(([name, info]) => {
        console.log(`   - ${name}: ${info.type}${info.nullable ? ' (nullable)' : ''}`);
      });

      // Verify expected columns
      const expectedLeadsColumns = [
        'id', 'business_name', 'email', 'source',
        'engagement_score', 'opportunity_score', 'heat_score'
      ];

      const missingLeadsColumns = expectedLeadsColumns.filter(col => !leadsColumns[col]);
      const foundLeadsColumns = expectedLeadsColumns.filter(col => leadsColumns[col]);

      console.log(`\n   Expected columns: ${foundLeadsColumns.length}/${expectedLeadsColumns.length} present`);

      if (missingLeadsColumns.length > 0) {
        console.log(`   ⚠️  Missing: ${missingLeadsColumns.join(', ')}`);
        schema.assumptions_violated.push(`b2b_leads missing columns: ${missingLeadsColumns.join(', ')}`);
      } else {
        schema.assumptions_verified.push('b2b_leads has all expected columns');
      }

      console.log('\n');

    } catch (error) {
      schema.critical_issues.push(`Failed to query b2b_leads schema: ${error.message}`);
      console.log(`❌ Error: ${error.message}\n`);
    }

    // Check b2b_outreach table
    console.log('2️⃣  Checking b2b_outreach table...\n');
    try {
      const outreachInfo = await sql(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'b2b_outreach'
        ORDER BY ordinal_position;
      `);

      const outreachColumns = {};
      outreachInfo.forEach(col => {
        outreachColumns[col.column_name] = {
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        };
      });

      schema.tables.b2b_outreach = {
        exists: true,
        columns: outreachColumns,
        column_count: outreachInfo.length
      };

      console.log(`✅ b2b_outreach exists with ${outreachInfo.length} columns:\n`);
      Object.entries(outreachColumns).forEach(([name, info]) => {
        console.log(`   - ${name}: ${info.type}${info.nullable ? ' (nullable)' : ''}`);
      });

      // Verify expected columns
      const expectedOutreachColumns = [
        'id', 'lead_id', 'resend_message_id', 'email_type', 'sent_at'
      ];

      const missingOutreachColumns = expectedOutreachColumns.filter(col => !outreachColumns[col]);
      const foundOutreachColumns = expectedOutreachColumns.filter(col => outreachColumns[col]);

      console.log(`\n   Expected columns: ${foundOutreachColumns.length}/${expectedOutreachColumns.length} present`);

      if (missingOutreachColumns.length > 0) {
        console.log(`   ⚠️  Missing: ${missingOutreachColumns.join(', ')}`);
        schema.assumptions_violated.push(`b2b_outreach missing columns: ${missingOutreachColumns.join(', ')}`);
      } else {
        schema.assumptions_verified.push('b2b_outreach has all expected columns');
      }

      console.log('\n');

    } catch (error) {
      schema.critical_issues.push(`Failed to query b2b_outreach schema: ${error.message}`);
      console.log(`❌ Error: ${error.message}\n`);
    }

    // Check b2b_email_events table
    console.log('3️⃣  Checking b2b_email_events table...\n');
    try {
      const eventsInfo = await sql(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'b2b_email_events'
        ORDER BY ordinal_position;
      `);

      const eventsColumns = {};
      eventsInfo.forEach(col => {
        eventsColumns[col.column_name] = {
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        };
      });

      schema.tables.b2b_email_events = {
        exists: true,
        columns: eventsColumns,
        column_count: eventsInfo.length
      };

      console.log(`✅ b2b_email_events exists with ${eventsInfo.length} columns:\n`);
      Object.entries(eventsColumns).forEach(([name, info]) => {
        console.log(`   - ${name}: ${info.type}${info.nullable ? ' (nullable)' : ''}`);
      });

      // Verify expected columns
      const expectedEventsColumns = [
        'id', 'outreach_id', 'event_type', 'timestamp'
      ];

      const optionalEventsColumns = [
        'lead_id', 'message_id', 'metadata'
      ];

      const missingRequired = expectedEventsColumns.filter(col => !eventsColumns[col]);
      const foundRequired = expectedEventsColumns.filter(col => eventsColumns[col]);
      const foundOptional = optionalEventsColumns.filter(col => eventsColumns[col]);

      console.log(`\n   Required columns: ${foundRequired.length}/${expectedEventsColumns.length} present`);
      console.log(`   Optional columns: ${foundOptional.length}/${optionalEventsColumns.length} present`);

      if (missingRequired.length > 0) {
        console.log(`   ❌ Missing required: ${missingRequired.join(', ')}`);
        schema.critical_issues.push(`b2b_email_events missing required columns: ${missingRequired.join(', ')}`);
      } else {
        schema.assumptions_verified.push('b2b_email_events has all required columns');
      }

      if (foundOptional.length > 0) {
        console.log(`   ✅ Has optional: ${foundOptional.join(', ')}`);
      }

      console.log('\n');

    } catch (error) {
      schema.critical_issues.push(`Failed to query b2b_email_events schema: ${error.message}`);
      console.log(`❌ Error: ${error.message}\n`);
    }

    // KEY ARCHITECTURAL QUESTION: How is lead_id linked?
    console.log('4️⃣  CRITICAL QUESTION: How is lead_id linked?\n');

    const hasLeadIdOnEvents = schema.tables.b2b_email_events?.columns?.lead_id !== undefined;
    const hasLeadIdOnOutreach = schema.tables.b2b_outreach?.columns?.lead_id !== undefined;

    if (hasLeadIdOnEvents && hasLeadIdOnOutreach) {
      console.log('✅ OPTION A: lead_id exists on both b2b_outreach AND b2b_email_events');
      console.log('   → Can join events directly to leads\n');
      schema.assumptions_verified.push('lead_id denormalized on b2b_email_events');
    } else if (hasLeadIdOnOutreach && !hasLeadIdOnEvents) {
      console.log('✅ OPTION B: lead_id exists on b2b_outreach (standard)');
      console.log('   → Must join: events → outreach → leads');
      console.log('   → Scripts must use: e.outreach_id → o.id, then o.lead_id → l.id\n');
      schema.assumptions_verified.push('Standard join pattern through outreach_id');
    } else if (hasLeadIdOnEvents && !hasLeadIdOnOutreach) {
      console.log('⚠️  OPTION C: lead_id on events but NOT on outreach');
      console.log('   → Unusual architecture');
      console.log('   → Scripts can join directly\n');
      schema.assumptions_violated.push('Non-standard denormalization on events');
    } else {
      console.log('❌ OPTION D: lead_id not found on either table');
      console.log('   → Cannot link events to leads');
      console.log('   → Architecture is broken\n');
      schema.critical_issues.push('No way to link events to leads — architecture broken');
    }

    // Check for data
    console.log('5️⃣  DATA EXISTENCE CHECK\n');

    try {
      const leadCount = await sql(`SELECT COUNT(*) as count FROM b2b_leads WHERE source != 'qa_system_test';`);
      const outreachCount = await sql(`SELECT COUNT(*) as count FROM b2b_outreach;`);
      const eventCount = await sql(`SELECT COUNT(*) as count FROM b2b_email_events;`);

      console.log(`   Production leads: ${leadCount[0].count}`);
      console.log(`   Outreach records: ${outreachCount[0].count}`);
      console.log(`   Event records: ${eventCount[0].count}\n`);

      if (leadCount[0].count === 0) {
        schema.critical_issues.push('No production leads in database');
      }
      if (eventCount[0].count === 0) {
        schema.critical_issues.push('No events recorded in database');
      }
    } catch (error) {
      console.log(`   ⚠️  Could not count data: ${error.message}\n`);
    }

  } catch (error) {
    console.error('❌ SCHEMA VERIFICATION FAILED:', error.message);
    schema.critical_issues.push(`Database connection error: ${error.message}`);
  }

  // DETERMINE SAFETY STATUS
  schema.safe_to_proceed = schema.critical_issues.length === 0;

  // Write report
  const report = `# SCHEMA VERIFICATION AUDIT

**Generated**: ${schema.timestamp}

## VERIFICATION STATUS

${schema.safe_to_proceed ? '✅ **SAFE TO PROCEED** — Schema appears correct' : '❌ **CRITICAL ISSUES FOUND** — Do not proceed with other audits'}

## TABLES FOUND

${Object.entries(schema.tables).map(([name, info]) => `
### ${name}

- **Exists**: ✅
- **Column count**: ${info.column_count}
- **Columns**:
${Object.entries(info.columns).map(([colName, colInfo]) => `  - \`${colName}\` (${colInfo.type})${colInfo.nullable ? ' nullable' : ''}`).join('\n')}

`).join('\n')}

## ARCHITECTURAL QUESTIONS ANSWERED

### How is lead_id linked in the event chain?

${schema.assumptions_verified.includes('lead_id denormalized on b2b_email_events') ? `
✅ **lead_id exists on b2b_email_events**

This means:
- Events can be joined directly to leads
- Queries can use: \`WHERE lead_id = ...\`
- No need for intermediate outreach join (though it's still correct)
` : schema.assumptions_verified.includes('Standard join pattern through outreach_id') ? `
✅ **lead_id exists on b2b_outreach (standard pattern)**

This means:
- Events join to outreach via outreach_id
- Outreach joins to leads via lead_id
- Queries must use: \`e.outreach_id → o.id → o.lead_id\`
` : `
❌ **Cannot determine lead_id linkage**

This is a critical architectural issue.
`}

## ASSUMPTIONS VERIFIED

${schema.assumptions_verified.length === 0 ? '(none)' : schema.assumptions_verified.map(a => `✅ ${a}`).join('\n')}

## ASSUMPTIONS VIOLATED

${schema.assumptions_violated.length === 0 ? '(none)' : schema.assumptions_violated.map(a => `⚠️  ${a}`).join('\n')}

## CRITICAL ISSUES

${schema.critical_issues.length === 0 ? '(none)' : schema.critical_issues.map(a => `❌ ${a}`).join('\n')}

## NEXT STEPS

${schema.safe_to_proceed ? `
✅ **Schema is verified**

You can now:
1. Review this report for architectural understanding
2. Proceed to forensic audit (phase_forensic_audit.mjs)
3. Scripts can safely assume this schema structure

` : `
❌ **Schema has critical issues**

Do not proceed with other audits until these are resolved:
${schema.critical_issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n')}

After fixing, re-run this audit to verify.

`}

## IMPORTANT FOR AUDIT SCRIPT FIXES

Based on this schema, the audit scripts need to be corrected:

### If lead_id is denormalized on b2b_email_events:
\`\`\`sql
SELECT e.lead_id, COUNT(*) as click_count
FROM b2b_email_events e
WHERE e.event_type = 'clicked'
GROUP BY e.lead_id;
\`\`\`

### If lead_id is only on b2b_outreach:
\`\`\`sql
SELECT o.lead_id, COUNT(*) as click_count
FROM b2b_email_events e
JOIN b2b_outreach o ON e.outreach_id = o.id
WHERE e.event_type = 'clicked'
GROUP BY o.lead_id;
\`\`\`

Use whichever pattern matches your actual schema.
`;

  fs.writeFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/SCHEMA_VERIFICATION_AUDIT.md', report);

  console.log('=== SCHEMA VERIFICATION REPORT ===\n');
  console.log(report);

  console.log('\n=== NEXT STEP ===\n');
  if (schema.safe_to_proceed) {
    console.log('✅ Schema verified. Safe to proceed with forensic audit.');
  } else {
    console.log('❌ Schema has issues. Fix before running other audits.');
  }
}

schemaVerification().catch(console.error);
