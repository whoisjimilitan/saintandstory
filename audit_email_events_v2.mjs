import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== EMAIL EVENT PIPELINE AUDIT ===\n");

// Event counts by type
const eventCounts = await sql`
  SELECT event_type, COUNT(*) as count
  FROM b2b_email_events
  GROUP BY event_type
  ORDER BY count DESC
`;

console.log("1. EVENT TYPES RECEIVED");
eventCounts.forEach(row => {
  console.log(`   ${row.event_type}: ${row.count}`);
});

// Total event count
const totalEvents = await sql`SELECT COUNT(*) as count FROM b2b_email_events`;
console.log(`\n   TOTAL EVENTS: ${totalEvents[0].count}`);

// Latest event timestamp
const latestEvent = await sql`
  SELECT MAX(created_at) as latest FROM b2b_email_events
`;

const latestTimestamp = latestEvent[0].latest 
  ? new Date(latestEvent[0].latest).toISOString() 
  : 'NEVER';

console.log(`\n2. LATEST EVENT TIMESTAMP`);
console.log(`   ${latestTimestamp}`);

// Events by hour (distribution)
console.log(`\n3. EVENT DISTRIBUTION BY HOUR`);
const byHour = await sql`
  SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as count
  FROM b2b_email_events
  GROUP BY DATE_TRUNC('hour', created_at)
  ORDER BY hour DESC
  LIMIT 10
`;

byHour.forEach(row => {
  console.log(`   ${new Date(row.hour).toISOString()}: ${row.count}`);
});

// Last 20 events
console.log(`\n4. LAST 20 EVENTS`);
const lastEvents = await sql`
  SELECT 
    event_type, 
    lead_id, 
    outreach_id,
    timestamp,
    created_at
  FROM b2b_email_events
  ORDER BY created_at DESC
  LIMIT 20
`;

lastEvents.forEach((evt, i) => {
  console.log(`\n   ${i + 1}. ${evt.event_type.toUpperCase()}`);
  console.log(`      Lead ID: ${evt.lead_id}`);
  console.log(`      Outreach ID: ${evt.outreach_id}`);
  console.log(`      Event Time: ${evt.timestamp}`);
  console.log(`      Stored: ${evt.created_at}`);
});

// Event lag check (time between event and storage)
console.log(`\n5. EVENT LAG ANALYSIS`);
const lagStats = await sql`
  SELECT 
    AVG(EXTRACT(EPOCH FROM (created_at - timestamp))) as avg_lag_seconds,
    MAX(EXTRACT(EPOCH FROM (created_at - timestamp))) as max_lag_seconds,
    MIN(EXTRACT(EPOCH FROM (created_at - timestamp))) as min_lag_seconds
  FROM b2b_email_events
`;

console.log(`   Avg lag: ${Math.round(lagStats[0].avg_lag_seconds)} seconds`);
console.log(`   Max lag: ${Math.round(lagStats[0].max_lag_seconds)} seconds`);
console.log(`   Min lag: ${Math.round(lagStats[0].min_lag_seconds)} seconds`);

// Webhook endpoint check
console.log(`\n6. WEBHOOK ENDPOINT STATUS`);
const webhookFile = "app/api/webhooks/email/route.ts";
console.log(`   Endpoint: /api/webhooks/email`);
console.log(`   Location: ${webhookFile}`);
console.log(`   Status: VERIFY MANUALLY`);

// Unique coverage
console.log(`\n7. EVENT COVERAGE`);
const uniqueLeads = await sql`SELECT COUNT(DISTINCT lead_id) FROM b2b_email_events`;
const uniqueOutreach = await sql`SELECT COUNT(DISTINCT outreach_id) FROM b2b_email_events`;

console.log(`   Unique leads with events: ${uniqueLeads[0].count}`);
console.log(`   Unique emails tracked: ${uniqueOutreach[0].count}`);

// Phase 3 campaign targeting
const phase3Leads = await sql`
  SELECT COUNT(DISTINCT lead_id) as count FROM phase3_campaign
`;

const phase3Events = await sql`
  SELECT COUNT(DISTINCT bee.lead_id) as count
  FROM b2b_email_events bee
  WHERE EXISTS (
    SELECT 1 FROM phase3_campaign pc
    WHERE pc.lead_id = bee.lead_id
  )
`;

console.log(`\n8. PHASE 3 ATTRIBUTION`);
console.log(`   Phase 3 leads sent to: ${phase3Leads[0].count}`);
console.log(`   Phase 3 leads with events: ${phase3Events[0].count}`);
console.log(`   Coverage: ${Math.round((phase3Events[0].count / phase3Leads[0].count) * 100)}%`);

console.log(`\n\n=== EMAIL EVENT PIPELINE STATUS ===`);
if (totalEvents[0].count === 0) {
  console.log("❌ FAIL - No events received from Resend webhooks");
} else {
  console.log(`✅ PASS - ${totalEvents[0].count} events captured in database`);
  console.log(`   - ${eventCounts.filter(e => e.event_type === 'opened')[0].count} opens`);
  console.log(`   - ${eventCounts.filter(e => e.event_type === 'clicked')[0].count} clicks`);
}
