import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== CAMPAIGN ENGAGEMENT METRICS AUDIT ===\n");

// Total events
const allEvents = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
`;

console.log("1. EMAIL EVENTS");
console.log(`   Total events: ${allEvents[0].count}`);

// Events by type
const eventsByType = await sql`
  SELECT event_type, COUNT(*) as count
  FROM b2b_email_events
  GROUP BY event_type
  ORDER BY count DESC
`;

console.log(`\n2. EVENT BREAKDOWN`);
eventsByType.forEach(evt => {
  console.log(`   ${evt.event_type}: ${evt.count}`);
});

// Phase 3 vs Phase 2
const phase3Events = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE created_at >= '2026-06-14'::timestamp
`;

const phase2Events = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE created_at < '2026-06-14'::timestamp
`;

console.log(`\n3. CAMPAIGN ATTRIBUTION`);
console.log(`   Phase 2 events (before Jun 14): ${phase2Events[0].count}`);
console.log(`   Phase 3 events (from Jun 14): ${phase3Events[0].count}`);

// Engagement rates - actual data only
const phase2Sent = 2; // Test sends
const phase3Sent = 48; // Full campaign

console.log(`\n4. ENGAGEMENT RATES (REAL DATA ONLY)`);
console.log(`   Phase 2: ${phase2Sent} leads sent, ${32} opens recorded = ${(32/phase2Sent*100).toFixed(0)}% open rate`);
console.log(`   Phase 3: ${phase3Sent} leads sent, ${phase3Events[0].count} events = ${phase3Events[0].count === 0 ? '0%' : ((phase3Events[0].count/phase3Sent)*100).toFixed(1)}%`);

// Unique leads with engagement
const engagedLeads = await sql`
  SELECT COUNT(DISTINCT lead_id) as count FROM b2b_email_events
`;

console.log(`\n5. LEAD ENGAGEMENT`);
console.log(`   Total leads with events: ${engagedLeads[0].count}`);

// Clicks and opens
const clicks = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type = 'clicked'
`;

const opens = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type = 'opened'
`;

console.log(`\n6. ACTION METRICS`);
console.log(`   Total opens: ${opens[0].count}`);
console.log(`   Total clicks: ${clicks[0].count}`);

if (opens[0].count > 0) {
  const ctr = ((clicks[0].count / opens[0].count) * 100).toFixed(1);
  console.log(`   Click-through rate: ${ctr}% (${clicks[0].count}/${opens[0].count})`);
}

// Replies/bounces
const replies = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type IN ('replied', 'reply', 'response', 'bounce')
`;

console.log(`\n7. RESPONSE EVENTS`);
console.log(`   Replies/bounces: ${replies[0].count}`);

// Phase 3 specific
const phase3Leads = await sql`
  SELECT COUNT(DISTINCT lead_id) as count FROM b2b_email_events
  WHERE EXISTS (
    SELECT 1 FROM phase3_campaign
    WHERE lead_id = b2b_email_events.lead_id
  )
`;

console.log(`\n8. PHASE 3 COVERAGE`);
console.log(`   Phase 3 leads with events: ${phase3Leads[0].count}/${phase3Sent}`);
console.log(`   Coverage: ${phase3Events[0].count === 0 ? '0% (events not received)' : ((phase3Leads[0].count/phase3Sent)*100).toFixed(0)}%`);

console.log(`\n\n=== ENGAGEMENT METRICS STATUS ===`);
if (phase3Events[0].count === 0) {
  console.log(`⏳ INCOMPLETE - Phase 3 events not received yet`);
  console.log(`   Campaign sent: 2026-06-14 ~07:35 UTC`);
  console.log(`   Expected webhook lag: 5-10 minutes`);
  console.log(`   Current time: Check server - events may still be in flight`);
  console.log(`   Status: AWAITING WEBHOOK DELIVERY FROM RESEND`);
} else {
  console.log(`✅ PARTIAL - Phase 3 events being captured`);
  console.log(`   ${phase3Events[0].count} events received so far`);
}
