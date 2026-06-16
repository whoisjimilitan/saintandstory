import { neon } from "@neondatabase/serverless";

async function checkOutcomeData() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("=".repeat(60));
  console.log("OUTCOME DATA REALITY CHECK");
  console.log("=".repeat(60));

  // Check if columns exist
  console.log("\n1. Checking if Outcome Case columns exist in b2b_leads...");
  try {
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'b2b_leads' 
      AND column_name IN ('blocked_outcome', 'operational_cause', 'logistics_friction', 'logistics_fit_score', 'desired_outcome')
    `;
    console.log("Found columns:", result.map(r => r.column_name));
  } catch (e) {
    console.error("Error checking columns:", e);
  }

  // Total leads
  console.log("\n2. Total leads in database...");
  try {
    const result = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log("Total leads:", result[0]?.count || 0);
  } catch (e) {
    console.error("Error:", e);
  }

  // Check pattern_records table
  console.log("\n3. Checking pattern_records table...");
  try {
    const result = await sql`SELECT COUNT(*) as count FROM pattern_records`;
    console.log("Total patterns:", result[0]?.count || 0);
  } catch (e) {
    console.error("Error:", e);
  }

  // Check if any outcome data exists
  console.log("\n4. Looking for outcome-related data...");
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM b2b_leads 
      WHERE notes LIKE '%outcome%' OR notes LIKE '%blocked%'
    `;
    console.log("Leads with outcome-related notes:", result[0]?.count || 0);
  } catch (e) {
    console.error("Error:", e);
  }
}

checkOutcomeData().catch(console.error);
