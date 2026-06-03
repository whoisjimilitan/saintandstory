import { neon } from "@neondatabase/serverless";

async function check() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Checking b2b_leads data...");
    const leads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log(`Total leads: ${leads[0]?.count || 0}`);
    
    if ((leads[0]?.count || 0) > 0) {
      const sample = await sql`SELECT * FROM b2b_leads LIMIT 1`;
      console.log("\nSample lead:");
      console.log(JSON.stringify(sample[0], null, 2));
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

check().catch(console.error).finally(() => process.exit(0));
