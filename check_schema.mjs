import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function checkSchema() {
  console.log("=== DATABASE SCHEMA CHECK ===\n");

  // Check b2b_leads columns
  console.log("1. b2b_leads table columns:");
  const leadsInfo = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'b2b_leads'
    ORDER BY column_name
  `;
  leadsInfo.forEach(col => {
    console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });

  // Check b2b_email_events table
  console.log("\n2. b2b_email_events table columns:");
  const eventsInfo = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'b2b_email_events'
    ORDER BY column_name
  `;
  eventsInfo.forEach(col => {
    console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });

  // Count records in key tables
  console.log("\n3. Record counts:");
  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM b2b_leads WHERE status NOT IN ('dead')) as total_leads,
      (SELECT COUNT(*) FROM b2b_leads WHERE engagement_score > 0) as leads_with_engagement,
      (SELECT COUNT(*) FROM b2b_email_events) as total_email_events,
      (SELECT COUNT(*) FROM b2b_outreach WHERE replied = true) as replied_emails,
      (SELECT COUNT(*) FROM qualified_businesses) as qualified_businesses,
      (SELECT COUNT(*) FROM b2b_heat_score_history) as heat_score_snapshots
  `;
  console.log(JSON.stringify(counts[0], null, 2));

  // Sample b2b_leads data
  console.log("\n4. Sample b2b_leads (first 3):");
  const sampleLeads = await sql`
    SELECT id, business_name, status, engagement_score, created_at
    FROM b2b_leads
    WHERE status NOT IN ('dead')
    ORDER BY created_at DESC
    LIMIT 3
  `;
  sampleLeads.forEach(lead => {
    console.log(`  ${lead.business_name} (${lead.id}): engagement_score=${lead.engagement_score}, status=${lead.status}`);
  });
}

checkSchema().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
