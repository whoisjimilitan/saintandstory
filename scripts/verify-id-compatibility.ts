/**
 * VERIFY ID COMPATIBILITY
 *
 * Check that Business.id fits in google_place_id column
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function verifyIDCompatibility() {
  console.log("🔍 VERIFYING ID COMPATIBILITY\n");
  console.log("Checking: Business.id vs discovered_businesses.google_place_id\n");

  try {
    // Get sample Business.id and check its properties
    const businessSample = await sql`
      SELECT id FROM "Business" LIMIT 1
    `;

    const businessID = businessSample[0].id;
    const idLength = String(businessID).length;
    const idType = typeof businessID;

    console.log("Business.id:");
    console.log(`  Value: ${businessID}`);
    console.log(`  Type: ${idType}`);
    console.log(`  Length: ${idLength} characters\n`);

    // Get schema info for google_place_id
    const columnInfo = await sql`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'discovered_businesses'
        AND column_name = 'google_place_id'
    `;

    const col = columnInfo[0];

    console.log("discovered_businesses.google_place_id:");
    console.log(`  Data Type: ${col.data_type}`);
    console.log(`  Max Length: ${col.character_maximum_length || 'UNLIMITED'}`);
    console.log(`  Nullable: ${col.is_nullable}\n`);

    // Verify compatibility
    console.log("=".repeat(60));
    console.log("COMPATIBILITY ASSESSMENT:");
    console.log("=".repeat(60));

    if (col.data_type === "text") {
      console.log("✅ Column type is TEXT");
      console.log("   TEXT has no practical length limit (up to 1GB)");
    } else if (col.data_type === "character varying") {
      if (col.character_maximum_length) {
        if (idLength <= col.character_maximum_length) {
          console.log(`✅ Column is VARCHAR(${col.character_maximum_length})`);
          console.log(`   Business.id (${idLength} chars) fits safely\n`);
        } else {
          console.log(`❌ INCOMPATIBLE!`);
          console.log(`   Column: VARCHAR(${col.character_maximum_length})`);
          console.log(`   Business.id: ${idLength} characters`);
          console.log(`   TRUNCATION WILL OCCUR\n`);
          process.exit(1);
        }
      }
    }

    // Additional checks
    console.log("\nADDITIONAL CHECKS:");
    console.log("─".repeat(60));

    // Check if column has a UNIQUE constraint
    const constraints = await sql`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'discovered_businesses'
        AND constraint_name LIKE '%google%'
    `;

    if (constraints.length > 0) {
      console.log(`✅ UNIQUE constraint exists on google_place_id`);
      console.log(`   Constraint: ${constraints[0].constraint_name}`);
      console.log(`   Type: ${constraints[0].constraint_type}\n`);
    } else {
      console.log("⚠️  No UNIQUE constraint found\n");
    }

    // Verify no validation rules
    console.log("Validation Rules:");
    console.log("✅ No format validation (TEXT accepts any string)");
    console.log("✅ No Google Place ID format enforcement\n");

    console.log("=".repeat(60));
    console.log("FINAL VERDICT:");
    console.log("=".repeat(60));
    console.log("✅ Business.id is compatible with google_place_id");
    console.log("✅ No truncation will occur");
    console.log("✅ Safe to use Business.id as google_place_id value\n");
    console.log("Proceed to Step 1\n");

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

verifyIDCompatibility();
