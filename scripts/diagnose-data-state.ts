import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function diagnoseState() {
  console.log("📊 CURRENT DATABASE STATE\n");

  const tables = [
    { name: "discovered_businesses", table: "discovered_businesses" },
    { name: "enriched_businesses", table: "enriched_businesses" },
    { name: "qualified_businesses", table: "qualified_businesses" },
    { name: "b2b_leads", table: "b2b_leads" },
    { name: "reviews", table: "reviews" },
    { name: "b2b_outreach", table: "b2b_outreach" },
    { name: "b2b_standing_orders", table: "b2b_standing_orders" },
  ];

  try {
    // Use raw query for each table
    const discovered = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const enriched = await sql`SELECT COUNT(*)::int as count FROM enriched_businesses`;
    const qualified = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const leads = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;
    const outreach = await sql`SELECT COUNT(*)::int as count FROM b2b_outreach`;
    const standing = await sql`SELECT COUNT(*)::int as count FROM b2b_standing_orders`;

    console.log(`  discovered_businesses          : ${discovered[0].count.toString().padStart(6)} rows`);
    console.log(`  enriched_businesses            : ${enriched[0].count.toString().padStart(6)} rows`);
    console.log(`  qualified_businesses           : ${qualified[0].count.toString().padStart(6)} rows`);
    console.log(`  b2b_leads                      : ${leads[0].count.toString().padStart(6)} rows`);
    console.log(`  b2b_outreach                   : ${outreach[0].count.toString().padStart(6)} rows`);
    console.log(`  b2b_standing_orders            : ${standing[0].count.toString().padStart(6)} rows`);

    console.log("\n" + "=".repeat(60));

    // Check if there's Prisma data anywhere
    console.log("\nChecking for potential Prisma business sources...\n");

    // Check discovery config
    const configs = await sql`SELECT COUNT(*)::int as count FROM discovery_config`;
    console.log(`  discovery_config               : ${configs[0].count} rows`);

    // Check postcode discovery jobs
    const jobs = await sql`SELECT COUNT(*)::int as count FROM postcode_discovery_jobs`;
    console.log(`  postcode_discovery_jobs        : ${jobs[0].count} rows`);

    // Check research missions
    const missions = await sql`SELECT COUNT(*)::int as count FROM research_missions`;
    console.log(`  research_missions              : ${missions[0].count} rows`);

  } catch (error) {
    console.error("Error:", error);
  }
}

diagnoseState();
