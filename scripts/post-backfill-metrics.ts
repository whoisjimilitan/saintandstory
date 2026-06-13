import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function postBackfillMetrics() {
  console.log("POST-BACKFILL METRICS AUDIT\n");

  // Overall counts
  const db = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
  const qb = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
  const bl = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

  console.log("Overall Counts:");
  console.log(`  discovered_businesses: ${db[0].count}`);
  console.log(`  qualified_businesses:  ${qb[0].count}`);
  console.log(`  b2b_leads:             ${bl[0].count}\n`);

  // Qualification sources
  console.log("Qualification Sources:");
  const sources = await sql`
    SELECT source, COUNT(*)::int as count
    FROM discovered_businesses
    GROUP BY source
  `;

  for (const s of sources) {
    console.log(`  ${s.source}: ${s.count}`);
  }

  console.log("");

  // Check for duplicates
  console.log("Data Integrity:");
  const dupes = await sql`
    SELECT COUNT(*) as count
    FROM (
      SELECT google_place_id, COUNT(*)
      FROM discovered_businesses
      GROUP BY google_place_id
      HAVING COUNT(*) > 1
    ) dupes
  `;

  console.log(`  Duplicate google_place_id: ${dupes[0].count}`);

  // Sample of new data
  console.log("\nSample of newly discovered businesses:");
  const samples = await sql`
    SELECT business_name, source
    FROM discovered_businesses
    WHERE source = 'prisma_business'
    ORDER BY discovered_at DESC
    LIMIT 5
  `;

  for (const s of samples) {
    console.log(`  - ${s.business_name}`);
  }
}

postBackfillMetrics();
