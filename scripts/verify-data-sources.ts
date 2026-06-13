import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function verifySources() {
  console.log("DATA SOURCE VERIFICATION\n");
  console.log("Checking exact row counts...\n");

  try {
    const business = await sql`SELECT COUNT(*)::int as count FROM business`;
    const discovered = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const qualified = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const leads = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const b = business[0].count;
    const d = discovered[0].count;
    const q = qualified[0].count;
    const l = leads[0].count;

    console.log("RESULTS:");
    console.log("=".repeat(40));
    console.log(`business:               ${b}`);
    console.log(`discovered_businesses:  ${d}`);
    console.log(`qualified_businesses:   ${q}`);
    console.log(`b2b_leads:              ${l}`);
    console.log("=".repeat(40));

  } catch (error: any) {
    if (error.message?.includes("does not exist")) {
      console.log("ERROR: One or more tables do not exist\n");
      console.log("Attempting to identify which tables exist...\n");

      const tables = [
        { name: "business", query: `SELECT COUNT(*) FROM business` },
        { name: "discovered_businesses", query: `SELECT COUNT(*) FROM discovered_businesses` },
        { name: "qualified_businesses", query: `SELECT COUNT(*) FROM qualified_businesses` },
        { name: "b2b_leads", query: `SELECT COUNT(*) FROM b2b_leads` },
      ];

      for (const t of tables) {
        try {
          const result = await sql.query(t.query);
          console.log(`✓ ${t.name} exists`);
        } catch {
          console.log(`✗ ${t.name} DOES NOT EXIST`);
        }
      }
    } else {
      console.error("Error:", error);
    }
  }
}

verifySources();
