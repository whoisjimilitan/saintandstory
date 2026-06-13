import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function checkDuplicates() {
  console.log("Checking for duplicate google_place_id values...\n");

  const dupes = await sql`
    SELECT
      google_place_id,
      COUNT(*) as count
    FROM discovered_businesses
    GROUP BY google_place_id
    HAVING COUNT(*) > 1
  `;

  if (dupes.length === 0) {
    console.log("✅ NO DUPLICATES FOUND");
    console.log("Every Business.id appears exactly once in discovered_businesses\n");
  } else {
    console.log("❌ DUPLICATES FOUND:\n");
    for (const d of dupes) {
      console.log(`  ${d.google_place_id}: ${d.count} rows`);
    }
  }

  // Count totals
  const dbCount = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
  const qbCount = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
  const blCount = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

  console.log(`\nCurrent counts:`);
  console.log(`  discovered_businesses: ${dbCount[0].count}`);
  console.log(`  qualified_businesses: ${qbCount[0].count}`);
  console.log(`  b2b_leads: ${blCount[0].count}\n`);
}

checkDuplicates();
