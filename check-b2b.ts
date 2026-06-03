import { neon } from "@neondatabase/serverless";

async function check() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  
  const sql = neon(databaseUrl);
  
  try {
    console.log("Checking b2b_leads table existence...");
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'b2b_leads'
      )
    `;
    console.log("b2b_leads table exists:", result[0]);
    
    const columns = await sql`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'b2b_leads' 
      ORDER BY ordinal_position
    `;
    console.log("\nAll columns in b2b_leads:");
    (columns as any[]).forEach((c) => console.log(`  - ${c.column_name}: ${c.data_type}`));
  } catch (e: any) {
    console.error("✗ Error:", e.message);
  }
}

check().catch(console.error).finally(() => process.exit(0));
