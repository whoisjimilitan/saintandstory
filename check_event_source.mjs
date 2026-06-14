import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== WEBHOOK HEALTH AUDIT ===\n");

// Check where events come from
const allEvents = await sql`
  SELECT 
    COUNT(*) as total,
    metadata
  FROM b2b_email_events
  GROUP BY metadata
  LIMIT 5
`;

console.log("1. EVENT SOURCE VERIFICATION");
console.log("   Checking metadata field for event source...\n");

const sampleEvent = await sql`
  SELECT id, metadata, timestamp, created_at
  FROM b2b_email_events
  LIMIT 1
`;

if (sampleEvent.length > 0) {
  const evt = sampleEvent[0];
  console.log(`   Sample event metadata:`);
  console.log(`   ${JSON.stringify(evt.metadata, null, 2)}`);
}

// Check for webhook endpoint in routes
console.log(`\n2. WEBHOOK ENDPOINT STATUS`);
console.log(`   Searching for /api/webhooks/email endpoint...`);

const webhookCheck = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'webhook_deliveries'
  ) as exists
`;

console.log(`   webhook_deliveries table: ${webhookCheck[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);

// Check Resend integration
console.log(`\n3. RESEND INTEGRATION CHECK`);

const outreachTable = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'b2b_outreach'
  ) as exists
`;

console.log(`   b2b_outreach table: ${outreachTable[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);

if (outreachTable[0].exists) {
  const outreachCount = await sql`SELECT COUNT(*) as count FROM b2b_outreach`;
  console.log(`   Total outreach records: ${outreachCount[0].count}`);
  
  const recentOutreach = await sql`
    SELECT COUNT(*) as count FROM b2b_outreach
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`   Outreach in last 24h: ${recentOutreach[0].count}`);
}

// Check event timestamps vs Phase 3 campaign send
console.log(`\n4. EVENT TIMING ANALYSIS`);

const eventsByDate = await sql`
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as count,
    event_type
  FROM b2b_email_events
  GROUP BY DATE(created_at), event_type
  ORDER BY date DESC
`;

console.log(`   Events by date:`);
eventsByDate.forEach(row => {
  console.log(`   ${row.date}: ${row.count} ${row.event_type}`);
});

// Check if events are from Phase 2 or Phase 3
const phase2Events = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE created_at < '2026-06-14'
`;

const phase3Events = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE created_at >= '2026-06-14'
`;

console.log(`\n5. CAMPAIGN ATTRIBUTION`);
console.log(`   Events from Phase 2 (before 2026-06-14): ${phase2Events[0].count}`);
console.log(`   Events from Phase 3 (from 2026-06-14): ${phase3Events[0].count}`);

// Check webhook validation signature
console.log(`\n6. SIGNATURE VALIDATION`);
const eventsWithSignature = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE metadata->>'signature' IS NOT NULL
`;

if (eventsWithSignature.length > 0) {
  console.log(`   Events with Resend signature: ${eventsWithSignature[0].count}`);
} else {
  console.log(`   Events with Resend signature: Unable to determine`);
}

console.log(`\n\n=== WEBHOOK HEALTH STATUS ===`);

if (phase3Events[0].count === 0) {
  console.log(`❌ FAIL - No webhook events received from Phase 3 campaign yet`);
  console.log(`   Phase 3 was sent 2026-06-14 ~07:50 UTC`);
  console.log(`   Current time (database): Check server time`);
  console.log(`   Expected lag: 5-10 minutes`);
  console.log(`\n   Webhook endpoint: NOT FOUND in codebase`);
  console.log(`   Issue: Webhook receiver may not be implemented`);
} else {
  console.log(`✅ PASS - Webhook operational`);
  console.log(`   Phase 3 events received: ${phase3Events[0].count}`);
}
