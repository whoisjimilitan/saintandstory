import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(databaseUrl);

async function audit() {
  try {
    // 1. Standing orders
    console.log("=== STANDING ORDERS ===\n");
    const soCount = await sql`SELECT COUNT(*) as count FROM b2b_standing_orders`;
    console.log(`Total b2b_standing_orders: ${soCount[0].count}`);
    
    const soActive = await sql`SELECT COUNT(*) as count FROM b2b_standing_orders WHERE active = true`;
    console.log(`Active standing orders: ${soActive[0].count}`);
    
    // 2. Discovery tables
    console.log("\n=== DISCOVERY PIPELINE ===\n");
    const discovered = await sql`SELECT COUNT(*) as count FROM discovered_businesses`;
    console.log(`discovered_businesses: ${discovered[0].count}`);
    
    const enriched = await sql`SELECT COUNT(*) as count FROM enriched_businesses`;
    console.log(`enriched_businesses: ${enriched[0].count}`);
    
    const qualified = await sql`SELECT COUNT(*) as count FROM qualified_businesses`;
    console.log(`qualified_businesses: ${qualified[0].count}`);
    
    // 3. Check what tables actually exist
    console.log("\n=== ALL B2B TABLES IN DATABASE ===\n");
    const allTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'b2b_%'
      ORDER BY table_name
    `;
    
    allTables.forEach(t => {
      console.log(`✅ ${t.table_name}`);
    });
    
    // 4. Outreach by status
    console.log("\n=== OUTREACH STATUS ===\n");
    const outreachStatus = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE sent_at IS NOT NULL) as sent,
        COUNT(*) FILTER (WHERE replied = true) as replied,
        COUNT(*) FILTER (WHERE follow_up_1_at IS NOT NULL) as has_followup
      FROM b2b_outreach
    `;
    
    const os = outreachStatus[0];
    console.log(`Total outreach records: ${os.total}`);
    console.log(`Emails sent: ${os.sent}`);
    console.log(`Replies received: ${os.replied}`);
    console.log(`Follow-ups scheduled: ${os.has_followup}`);
    
    // 5. Last outreach activity
    console.log("\n=== LAST OUTREACH ACTIVITY ===\n");
    const lastActivity = await sql`
      SELECT 
        sent_at, follow_up_1_at, replied_at, email_type
      FROM b2b_outreach
      WHERE sent_at IS NOT NULL
      ORDER BY sent_at DESC
      LIMIT 1
    `;
    
    if (lastActivity.length > 0) {
      const activity = lastActivity[0];
      console.log(`Last email sent: ${activity.sent_at}`);
      console.log(`Type: ${activity.email_type}`);
      console.log(`Replied: ${activity.replied_at ? activity.replied_at : 'No'}`);
    } else {
      console.log("No outreach activity recorded");
    }
    
  } catch (error) {
    console.error("❌ DATABASE ERROR:", error.message);
    process.exit(1);
  }
}

audit();
