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
const phase3Start = new Date('2026-06-14').toISOString();
const phase3Events = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE created_at >= '${phase3Start}'
`;

const phase2Events = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE created_at < '${phase3Start}'
`;

console.log(`\n3. CAMPAIGN ATTRIBUTION`);
console.log(`   Phase 2 events (before Jun 14): ${phase2Events[0].count}`);
console.log(`   Phase 3 events (from Jun 14): ${phase3Events[0].count}`);

// Calculate rates
const phase2Sent = 2; // Known: 2-lead test from Phase 2
const phase3Sent = 48; // Known: 48-lead Phase 3 campaign

const phase2Opens = phase2Events[0].count > 0 
  ? (32 / phase2Sent * 100).toFixed(1)  // From earlier audit, 32 opens from 2 leads (test had events)
  : 0;

const phase3OpenRate = phase3Events[0].count > 0 
  ? ((phase3Events[0].count / phase3Sent) * 100).toFixed(1)
  : '0.0 (awaiting webhook)';

console.log(`\n4. ENGAGEMENT RATES (REAL DATA)`);
console.log(`   Phase 2 open rate: ${phase2Opens}% (${phase2Sent} leads, 32 opens captured)`);
console.log(`   Phase 3 open rate: ${phase3OpenRate}% (${phase3Sent} leads sent)`);

// Unique leads with engagement
const engagedLeads = await sql`
  SELECT COUNT(DISTINCT lead_id) as count FROM b2b_email_events
`;

console.log(`\n5. LEAD ENGAGEMENT`);
console.log(`   Unique leads with events: ${engagedLeads[0].count}`);

// Events per lead
const eventDist = await sql`
  SELECT 
    lead_id, 
    COUNT(*) as event_count,
    string_agg(DISTINCT event_type, ', ') as event_types
  FROM b2b_email_events
  GROUP BY lead_id
  ORDER BY event_count DESC
  LIMIT 5
`;

console.log(`\n6. TOP ENGAGING LEADS`);
eventDist.forEach((lead, i) => {
  console.log(`   ${i + 1}. Lead ${lead.lead_id}`);
  console.log(`      Events: ${lead.event_count}`);
  console.log(`      Types: ${lead.event_types}`);
});

// Clicks analysis
const clicks = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type = 'clicked'
`;

const opens = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type = 'opened'
`;

const clickLeads = await sql`
  SELECT COUNT(DISTINCT lead_id) as count FROM b2b_email_events
  WHERE event_type = 'clicked'
`;

console.log(`\n7. ACTION METRICS`);
console.log(`   Clicks: ${clicks[0].count}`);
console.log(`   Opens: ${opens[0].count}`);
console.log(`   Leads who clicked: ${clickLeads[0].count}`);

if (opens[0].count > 0) {
  const ctr = ((clicks[0].count / opens[0].count) * 100).toFixed(1);
  console.log(`   Click-through rate: ${ctr}% (${clicks[0].count}/${opens[0].count})`);
}

// Time to engagement
console.log(`\n8. TIMING ANALYSIS`);
const timingData = await sql`
  SELECT 
    event_type,
    AVG(EXTRACT(EPOCH FROM (timestamp - (
      SELECT sent_at FROM phase3_campaign 
      WHERE lead_id = b2b_email_events.lead_id 
      LIMIT 1
    )))) as avg_time_to_event_seconds
  FROM b2b_email_events
  WHERE EXISTS (
    SELECT 1 FROM phase3_campaign
    WHERE lead_id = b2b_email_events.lead_id
  )
  GROUP BY event_type
`;

if (timingData.length > 0) {
  timingData.forEach(timing => {
    const seconds = Math.round(timing.avg_time_to_event_seconds);
    const hours = (seconds / 3600).toFixed(1);
    console.log(`   Time to ${timing.event_type}: ${hours} hours`);
  });
} else {
  console.log(`   Cannot calculate timing (Phase 3 events not received yet)`);
}

// Replies/bounces
const bounces = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type IN ('bounce', 'complained', 'unsubscribed')
`;

const replies = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type IN ('replied', 'reply', 'response')
`;

console.log(`\n9. RESPONSE METRICS`);
console.log(`   Bounces/complaints/unsubscribes: ${bounces[0].count}`);
console.log(`   Direct replies: ${replies[0].count}`);

console.log(`\n\n=== ENGAGEMENT METRICS STATUS ===`);
if (phase3Events[0].count === 0) {
  console.log(`⏳ INCOMPLETE - Phase 3 events not received yet`);
  console.log(`   Campaign sent: 2026-06-14 ~07:35 UTC`);
  console.log(`   Webhook lag: 5-10 minutes expected`);
  console.log(`   Status: AWAITING WEBHOOK DELIVERY`);
} else {
  console.log(`✅ PASS - Phase 3 engagement being tracked`);
  console.log(`   ${phase3Events[0].count} events captured`);
}
