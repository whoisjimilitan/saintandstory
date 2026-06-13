/**
 * STEP 0: VERIFY ID MAPPING
 *
 * Before building bridge, confirm Business.id is compatible with
 * qualified_businesses.discovered_business_id column type
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function verifyIDMapping() {
  console.log("STEP 0: VERIFY ID MAPPING\n");
  console.log("Checking: Business.id → qualified_businesses.discovered_business_id\n");

  try {
    // Get a sample Business ID and its type info
    const businessSample = await sql`
      SELECT id FROM "Business" LIMIT 1
    `;

    if (!businessSample || businessSample.length === 0) {
      console.log("❌ No Business records found");
      process.exit(1);
    }

    const sampleID = businessSample[0].id;
    console.log(`Sample Business.id: ${sampleID}`);
    console.log(`Type: ${typeof sampleID}`);
    console.log(`Length: ${String(sampleID).length}\n`);

    // Check discovered_business_id column type
    const columnInfo = await sql`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'qualified_businesses'
        AND column_name = 'discovered_business_id'
    `;

    if (columnInfo && columnInfo.length > 0) {
      const col = columnInfo[0];
      console.log(`qualified_businesses.discovered_business_id:`);
      console.log(`  Type: ${col.data_type}`);
      console.log(`  Nullable: ${col.is_nullable}\n`);

      // Determine compatibility
      if (col.data_type === "uuid") {
        // Business.id appears to be string (Prisma nanoid), column is UUID
        console.log("⚠️  ID TYPE MISMATCH");
        console.log("  Business.id: STRING/TEXT");
        console.log("  discovered_business_id: UUID");
        console.log("\n❌ INCOMPATIBLE - Cannot insert directly");
        console.log("   Business.id needs conversion or discovered_business_id needs schema change");
        process.exit(1);
      } else if (
        col.data_type === "text" ||
        col.data_type === "character varying" ||
        col.data_type === "character"
      ) {
        console.log("✅ ID MAPPING COMPATIBLE");
        console.log("  Business.id: STRING");
        console.log("  discovered_business_id: TEXT");
        console.log("  Can insert directly: YES\n");
        console.log("Ready to proceed to bridge implementation\n");
      } else {
        console.log(`⚠️  Unknown column type: ${col.data_type}`);
        console.log("Verify compatibility manually before proceeding");
        process.exit(1);
      }
    } else {
      console.log("❌ Could not find discovered_business_id column");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

verifyIDMapping();
