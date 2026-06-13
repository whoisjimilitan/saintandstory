import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function checkSchema() {
  // Check if b2b_email_events table exists
  const tables = await sql`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'b2b_%'
  `;

  console.log("=== B2B TABLES ===");
  tables.forEach(t => console.log(`  ${t.tablename}`));

  // Check b2b_email_events structure
  console.log("\n=== b2b_email_events COLUMNS ===");
  try {
    const emailEventsInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'b2b_email_events'
      ORDER BY column_name
    `;
    if (emailEventsInfo.length > 0) {
      emailEventsInfo.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log("  (table exists but may have no data)");
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // Check counts
  console.log("\n=== DATA COUNTS ===");
  try {
    const leadCount = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log(`  b2b_leads: ${leadCount[0].count} records`);
  } catch (e) {
    console.log(`  b2b_leads ERROR: ${e.message}`);
  }

  try {
    const eventCount = await sql`SELECT COUNT(*) as count FROM b2b_email_events`;
    console.log(`  b2b_email_events: ${eventCount[0].count} records`);
  } catch (e) {
    console.log(`  b2b_email_events ERROR: ${e.message}`);
  }

  try {
    const heatCount = await sql`SELECT COUNT(*) as count FROM b2b_heat_score_history`;
    console.log(`  b2b_heat_score_history: ${heatCount[0].count} records`);
  } catch (e) {
    console.log(`  b2b_heat_score_history ERROR: ${e.message}`);
  }

  // Check qualified_businesses
  try {
    const qualCount = await sql`SELECT COUNT(*) as count FROM qualified_businesses`;
    console.log(`  qualified_businesses: ${qualCount[0].count} records`);
  } catch (e) {
    console.log(`  qualified_businesses ERROR: ${e.message}`);
  }

  // Check for opportunity_score on any table
  console.log("\n=== SEARCHING FOR opportunity_score COLUMN ===");
  const oppScoreTables = await sql`
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'opportunity_score'
  `;
  if (oppScoreTables.length > 0) {
    console.log("  Found in tables:");
    oppScoreTables.forEach(t => console.log(`    ${t.table_name}`));
  } else {
    console.log("  NOT FOUND in any table");
  }

  // Check for engagement_score on any table
  console.log("\n=== SEARCHING FOR engagement_score COLUMN ===");
  const engageTables = await sql`
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'engagement_score'
  `;
  if (engageTables.length > 0) {
    console.log("  Found in tables:");
    engageTables.forEach(t => console.log(`    ${t.table_name}`));
  } else {
    console.log("  NOT FOUND in any table");
  }
}

checkSchema().catch(err => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
