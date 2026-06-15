const { neon } = require("@neondatabase/serverless");

async function auditDiscovery() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set");
    return;
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("=== DISCOVERY REALITY AUDIT ===\n");

  // SECTION 1: Check discovery_config table
  console.log("SECTION 1: ACTIVE DISCOVERY CONFIG");
  try {
    const config = await sql`SELECT * FROM discovery_config LIMIT 20`;
    console.log(`Found ${config.length} discovery configurations`);
    if (config.length > 0) {
      config.forEach((row) => {
        console.log(`  - ${row.niche}: ${JSON.stringify(row.locations)}`);
      });
    } else {
      console.log("  No discovery_config table or empty");
    }
  } catch (err) {
    console.log(`  discovery_config table: DOES NOT EXIST or ERROR\n`);
  }

  // SECTION 2: Check discovered_businesses table
  console.log("\nSECTION 2: DISCOVERED BUSINESSES BY CATEGORY");
  try {
    const discovered = await sql`
      SELECT category, COUNT(*) as count
      FROM discovered_businesses
      GROUP BY category
      ORDER BY count DESC
    `;
    const total = discovered.reduce((sum, row) => sum + row.count, 0);
    console.log(`Total categories with discoveries: ${discovered.length}`);
    console.log(`Total discovered businesses: ${total}`);
    console.log("Top categories:");
    discovered.slice(0, 10).forEach((row) => {
      console.log(`  - ${row.category}: ${row.count}`);
    });
    if (discovered.length > 10) {
      console.log(`  ... and ${discovered.length - 10} more`);
    }
  } catch (err) {
    console.log(`  Error querying discovered_businesses:`, err.message);
  }

  // SECTION 3: Check enriched_businesses
  console.log("\nSECTION 3: ENRICHED BUSINESSES");
  try {
    const enriched = await sql`SELECT COUNT(*) as count FROM enriched_businesses`;
    console.log(`Total enriched: ${enriched[0]?.count || 0}`);
  } catch (err) {
    console.log(`  Error:`, err.message);
  }

  // SECTION 4: Check qualified_businesses
  console.log("\nSECTION 4: QUALIFIED BUSINESSES");
  try {
    const qualified = await sql`SELECT COUNT(*) as count FROM qualified_businesses`;
    console.log(`Total qualified: ${qualified[0]?.count || 0}`);
  } catch (err) {
    console.log(`  Error:`, err.message);
  }

  // SECTION 5: Check b2b_leads
  console.log("\nSECTION 5: PROMOTED TO LEADS (b2b_leads)");
  try {
    const leads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log(`Total leads: ${leads[0]?.count || 0}`);
  } catch (err) {
    console.log(`  Error:`, err.message);
  }

  // SECTION 6: Category distribution in b2b_leads
  console.log("\nSECTION 6: CATEGORIES IN B2B_LEADS (Promoted)");
  try {
    const leadCategories = await sql`
      SELECT business_category, COUNT(*) as count
      FROM b2b_leads
      GROUP BY business_category
      ORDER BY count DESC
    `;
    console.log(`Total categories in leads: ${leadCategories.length}`);
    leadCategories.forEach((row) => {
      console.log(`  - ${row.business_category}: ${row.count}`);
    });
  } catch (err) {
    console.log(`  Error:`, err.message);
  }

  // SECTION 7: Orchestration logs
  console.log("\nSECTION 7: RECENT ORCHESTRATION ACTIVITY");
  try {
    const logs = await sql`
      SELECT started_at, discovery_count, leads_created
      FROM b2b_orchestration_logs
      ORDER BY started_at DESC
      LIMIT 5
    `;
    console.log(`Recent runs: ${logs.length}`);
    logs.forEach((row) => {
      const date = new Date(row.started_at).toISOString();
      console.log(`  - ${date}: ${row.discovery_count} discovered, ${row.leads_created} qualified`);
    });
  } catch (err) {
    console.log(`  Error:`, err.message);
  }

  console.log("\n=== END AUDIT ===");
}

auditDiscovery().catch(console.error);
