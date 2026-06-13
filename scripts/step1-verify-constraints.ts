import { neon } from "@neondatabase/serverless";

async function verifyConstraints() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  console.log("🔒 STEP 1: VERIFYING SAFETY CONSTRAINTS\n");

  try {
    const constraints = await sql`
      SELECT
          conname as constraint_name,
          pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint
      WHERE conname IN (
          'uq_qualified_discovered_business',
          'uq_b2b_leads_qualified_business'
      )
    `;

    if (constraints.length === 0) {
      console.log("❌ NO CONSTRAINTS FOUND\n");
      console.log("Expected constraints:");
      console.log("  - uq_qualified_discovered_business");
      console.log("  - uq_b2b_leads_qualified_business\n");
      process.exit(1);
    }

    console.log("✅ CONSTRAINTS FOUND:\n");
    for (const c of constraints) {
      console.log(`  📌 ${c.constraint_name}`);
      console.log(`     ${c.constraint_def}\n`);
    }

    if (constraints.length === 2) {
      console.log("✅ ALL SAFETY CONSTRAINTS IN PLACE\n");
      console.log("Ready to proceed to STEP 2: Idempotency Test\n");
    } else {
      console.log("⚠️  Only found " + constraints.length + " constraint(s), expected 2\n");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Error verifying constraints:", error);
    process.exit(1);
  }
}

verifyConstraints();
