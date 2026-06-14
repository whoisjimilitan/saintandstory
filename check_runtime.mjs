import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== ORCHESTRATION LOGS ===");
try {
  const logs = await sql`
    SELECT run_id, started_at, status
    FROM b2b_orchestration_logs
    ORDER BY started_at DESC
    LIMIT 5
  `;
  
  if (logs.length > 0) {
    logs.forEach(log => {
      console.log(`✓ Run: ${log.run_id} | Time: ${log.started_at} | Status: ${log.status}`);
    });
  } else {
    console.log("✗ No orchestration logs found");
  }
} catch (e) {
  console.log(`✗ Error: ${e.message}`);
}

console.log("\n=== DISCOVERY (Last 24h) ===");
try {
  const discovery = await sql`
    SELECT COUNT(*) as total
    FROM discovered_businesses
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`✓ New businesses: ${discovery[0].total}`);
} catch (e) {
  console.log(`✗ Error: ${e.message}`);
}

console.log("\n=== LEADS (Last 24h) ===");
try {
  const leads = await sql`
    SELECT COUNT(*) as total, MAX(created_at) as latest
    FROM b2b_leads
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`✓ New leads: ${leads[0].total}`);
  if (leads[0].latest) console.log(`  Latest: ${leads[0].latest}`);
} catch (e) {
  console.log(`✗ Error: ${e.message}`);
}

console.log("\n=== EMAIL OUTREACH (Last 24h) ===");
try {
  const outreach = await sql`
    SELECT COUNT(*) as total, MAX(sent_at) as last_sent
    FROM b2b_outreach
    WHERE sent_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`✓ Emails sent: ${outreach[0].total}`);
  if (outreach[0].last_sent) console.log(`  Last sent: ${outreach[0].last_sent}`);
} catch (e) {
  console.log(`✗ Error: ${e.message}`);
}

console.log("\n=== ENGAGEMENT EVENTS (Last 24h) ===");
try {
  const engagement = await sql`
    SELECT COUNT(*) as total, MAX(created_at) as last_event
    FROM b2b_email_events
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `;
  console.log(`✓ Events: ${engagement[0].total}`);
  if (engagement[0].last_event) console.log(`  Latest: ${engagement[0].last_event}`);
} catch (e) {
  console.log(`✗ Error: ${e.message}`);
}
