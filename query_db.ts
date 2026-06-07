import { neon } from "@neondatabase/serverless";

async function main() {
  const dbUrl = "postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  const sql = neon(dbUrl);

  try {
    console.log("\n📊 PRODUCTION LEAD STATUS DISTRIBUTION\n");

    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM b2b_leads
      GROUP BY status
      ORDER BY count DESC
    `;

    console.log("Status Distribution:");
    console.log("===================");
    statusCounts.forEach((row: any) => {
      console.log(`${String(row.status).toUpperCase().padEnd(20)} : ${row.count}`);
    });

    const total = await sql`SELECT COUNT(*) as total FROM b2b_leads`;
    console.log("===================");
    console.log(`TOTAL LEADS        : ${total[0].total}`);

    const recognized = await sql`SELECT COUNT(*) as count FROM b2b_leads WHERE status = 'recognized'`;
    console.log(`\nLEADS WITH 'recognized' STATUS: ${recognized[0].count}`);
    
    const newLeads = await sql`SELECT COUNT(*) as count FROM b2b_leads WHERE status = 'new'`;
    console.log(`LEADS WITH 'new' STATUS: ${newLeads[0].count}`);
    
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

main();
