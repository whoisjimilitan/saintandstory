import { neon } from "@neondatabase/serverless";

async function test() {
  const DATABASE_URL = 'postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  
  const sql = neon(DATABASE_URL);
  
  try {
    console.log("Testing B2B query...");
    const leads = await sql`
      SELECT l.*,
        o.last_sent, o.email_count, o.replied
      FROM b2b_leads l
      LEFT JOIN LATERAL (
        SELECT MAX(sent_at) as last_sent, COUNT(*) as email_count, bool_or(replied) as replied
        FROM b2b_outreach WHERE lead_id = l.id
      ) o ON true
      LIMIT 3
    `;
    
    console.log(`Found ${leads.length} leads`);
    if (leads.length > 0) {
      console.log("Sample lead keys:", Object.keys(leads[0]));
      console.log("Sample lead:", JSON.stringify(leads[0], null, 2));
    }
  } catch (e: any) {
    console.error("Query error:", e.message);
    console.error("Full error:", e);
  }
}

test().catch(console.error).finally(() => process.exit(0));
