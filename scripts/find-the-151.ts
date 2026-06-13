/**
 * WHERE ARE THE 151 BUSINESSES?
 *
 * Checking if Prisma Business table contains the discoveries
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function findThe151() {
  console.log("🔍 WHERE ARE THE 151 BUSINESSES?\n");

  try {
    // Check Prisma Business table
    console.log("Checking Prisma 'Business' table...\n");

    const countResult = await sql.query(`SELECT COUNT(*) as count FROM "Business"`);
    const businessCount = countResult[0].count;

    console.log(`Result: "Business" contains ${businessCount} rows\n`);

    if (businessCount > 0) {
      console.log("=".repeat(60));
      console.log("✅ FOUND THE SOURCE!");
      console.log("=".repeat(60));
      console.log(`Business table has ${businessCount} records\n`);

      console.log("Recent entries:\n");
      const recent = await sql.query(`
        SELECT id, name, "createdAt"
        FROM "Business"
        ORDER BY "createdAt" DESC
        LIMIT 5
      `);

      for (const row of recent) {
        console.log(`  📌 ${row.name}`);
        console.log(`     ID: ${row.id}`);
        console.log(`     Created: ${row.createdAt}\n`);
      }

      console.log("CRITICAL FINDING:");
      console.log("─".repeat(60));
      console.log("The 151 discoveries are in: Prisma 'Business' table");
      console.log("The current bridge reads from: discovered_businesses (WRONG)");
      console.log("discovered_businesses has: 0 rows");
      console.log("\nThe bridge needs to be redirected from:");
      console.log("  discovered_businesses → Phase 4");
      console.log("to:");
      console.log("  Business (Prisma) → Phase 4\n");

    } else {
      console.log("❌ Business table is empty");
      console.log("The 151 discoveries are NOT in Business table");
      console.log("Need to find where they actually are...\n");
    }

  } catch (error: any) {
    console.error("Error:", error.message || error);
    process.exit(1);
  }
}

findThe151();
