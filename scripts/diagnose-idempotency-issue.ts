import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function diagnose() {
  console.log("🔍 DIAGNOSING IDEMPOTENCY ISSUE\n");

  // Check what's in discovered_businesses
  console.log("1. Sample discovered_businesses rows:\n");
  const discovered = await sql`
    SELECT id, google_place_id, business_name, source
    FROM discovered_businesses
    LIMIT 5
  `;

  for (const row of discovered) {
    console.log(`  google_place_id: ${row.google_place_id}`);
    console.log(`  business_name: ${row.business_name}`);
    console.log(`  source: ${row.source}\n`);
  }

  // Check what Business.id values look like
  console.log("2. Sample Business.id values:\n");
  const businesses = await sql`
    SELECT id, name
    FROM "Business"
    LIMIT 5
  `;

  for (const row of businesses) {
    console.log(`  Business.id: ${row.id}`);
    console.log(`  name: ${row.name}\n`);
  }

  // Check if any Business.id matches discovered_businesses.google_place_id
  console.log("3. Checking for matches between Business.id and google_place_id:\n");
  const matches = await sql`
    SELECT
      b.id as business_id,
      b.name,
      db.google_place_id,
      db.business_name
    FROM "Business" b
    INNER JOIN discovered_businesses db
      ON db.google_place_id = b.id
    LIMIT 5
  `;

  if (matches.length > 0) {
    console.log(`Found ${matches.length} matches:\n`);
    for (const m of matches) {
      console.log(`  Match: ${m.business_id} = ${m.google_place_id}`);
    }
  } else {
    console.log("❌ NO MATCHES FOUND");
    console.log("This means Business.id is NOT being stored in google_place_id\n");
  }

  // Check what values ARE being stored
  console.log("4. What values are actually in google_place_id:\n");
  const samples = await sql`
    SELECT DISTINCT google_place_id
    FROM discovered_businesses
    LIMIT 10
  `;

  for (const row of samples) {
    console.log(`  ${row.google_place_id}`);
  }
}

diagnose();
