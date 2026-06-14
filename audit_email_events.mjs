import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== EMAIL EVENT PIPELINE AUDIT ===\n");

// Check if table exists
const tableCheck = await sql`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'b2b_email_events'
  ) as exists
`;

console.log("1. TABLE EXISTENCE");
console.log(`   b2b_email_events table: ${tableCheck[0].exists ? '✅ EXISTS' : '❌ MISSING'}\n`);

if (!tableCheck[0].exists) {
  console.log("❌ CRITICAL: b2b_email_events table does not exist");
  console.log("Cannot proceed with event audit.");
  process.exit(1);
}

// Event counts by type
const eventCounts = await sql`
  SELECT event_type, COUNT(*) as count
  FROM b2b_email_events
  GROUP BY event_type
  ORDER BY count DESC
`;

console.log("2. EVENT TYPES RECEIVED");
if (eventCounts.length === 0) {
  console.log("   ⚠️  No events received yet");
} else {
  eventCounts.forEach(row => {
    console.log(`   ${row.event_type}: ${row.count}`);
  });
}

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

console.log(`\n3. LATEST EVENT TIMESTAMP`);
console.log(`   ${latestTimestamp}`);

// Last 20 events
console.log(`\n4. LAST 20 EVENTS (RAW DATA)`);
const lastEvents = await sql`
  SELECT 
    id, lead_id, email_id, event_type, 
    created_at, metadata
  FROM b2b_email_events
  ORDER BY created_at DESC
  LIMIT 20
`;

if (lastEvents.length === 0) {
  console.log("   ⚠️  No events found in database");
} else {
  lastEvents.forEach((evt, i) => {
    console.log(`\n   ${i + 1}. ${evt.event_type.toUpperCase()}`);
    console.log(`      ID: ${evt.id}`);
    console.log(`      Lead: ${evt.lead_id}`);
    console.log(`      Email: ${evt.email_id}`);
    console.log(`      Time: ${evt.created_at}`);
    if (evt.metadata) {
      console.log(`      Metadata: ${JSON.stringify(evt.metadata).substring(0, 100)}`);
    }
  });
}

// Check webhook validation
const webhookLogs = await sql`
  SELECT COUNT(*) as count FROM information_schema.tables
  WHERE table_name = 'webhook_logs'
`;

console.log(`\n5. WEBHOOK VALIDATION LOGS`);
if (webhookLogs[0].count === 0) {
  console.log("   ⚠️  No webhook_logs table found");
  console.log("   Cannot verify webhook signatures or validation");
} else {
  const validationStats = await sql`
    SELECT 
      status, COUNT(*) as count
    FROM webhook_logs
    GROUP BY status
  `;
  
  validationStats.forEach(row => {
    console.log(`   ${row.status}: ${row.count}`);
  });
}

// Event table schema
console.log(`\n6. TABLE SCHEMA`);
const schema = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'b2b_email_events'
  ORDER BY ordinal_position
`;

schema.forEach(col => {
  console.log(`   ${col.column_name}: ${col.data_type}`);
});

// Error/validation check
console.log(`\n7. VALIDATION SUMMARY`);
const uniqueLeads = await sql`SELECT COUNT(DISTINCT lead_id) FROM b2b_email_events`;
const uniqueEmails = await sql`SELECT COUNT(DISTINCT email_id) FROM b2b_email_events`;

console.log(`   Unique leads with events: ${uniqueLeads[0].count}`);
console.log(`   Unique emails tracked: ${uniqueEmails[0].count}`);

console.log(`\n\n=== EMAIL EVENT PIPELINE STATUS ===`);
if (totalEvents[0].count === 0) {
  console.log("❌ FAIL - No events received from Resend webhooks");
} else {
  console.log("✅ PASS - Events being captured in database");
}
