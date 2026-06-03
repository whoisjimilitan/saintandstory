/**
 * Debug Script: Verify business slugs in database
 *
 * Run this to see:
 * 1. All businesses in b2b_leads table
 * 2. Generated slug for each business
 * 3. Verify which slug format matches /prospect/{slug} URLs
 *
 * Usage:
 *   npx tsx debug-slugs.ts
 */

import { neon } from "@neondatabase/serverless";

// Same generateSlug function from lib/prospect-pages.ts
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to dashes
    .replace(/-+/g, "-"); // Deduplicate dashes
}

async function debug() {
  if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable not set");
    console.error("Set it before running this script:");
    console.error("  export DATABASE_URL='postgresql://...'");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log("\n🔍 BUSINESS SLUG DEBUG\n");
    console.log("Connecting to database...\n");

    // Fetch businesses
    const businesses = await sql`
      SELECT id, business_name, business_category, city
      FROM b2b_leads
      WHERE business_name IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 50
    `;

    if (businesses.length === 0) {
      console.log("❌ NO BUSINESSES FOUND IN b2b_leads TABLE");
      console.log("\nThis explains the 404 — there's no data to query.");
      console.log(
        "You need to run the B2B discovery process to populate b2b_leads."
      );
      process.exit(1);
    }

    console.log(`✅ Found ${businesses.length} businesses\n`);
    console.log("BUSINESS NAME → SLUG MAPPING:");
    console.log("─".repeat(70));

    businesses.forEach((b: any, i: number) => {
      const slug = generateSlug(b.business_name);
      const url = `/prospect/${slug}`;
      const category = b.business_category || "Unknown";

      console.log(`${i + 1}. "${b.business_name}"`);
      console.log(`   Category: ${category}`);
      console.log(`   Slug: ${slug}`);
      console.log(`   URL: ${url}`);
      console.log("");
    });

    console.log("─".repeat(70));
    console.log("\n✅ TEST URLS:");
    console.log("Pick any business from above and test:");

    const firstSlug = generateSlug(
      (businesses[0] as any).business_name
    );
    console.log(`  https://saintandstoryltd.co.uk/prospect/${firstSlug}`);

    if (businesses.length > 1) {
      const secondSlug = generateSlug(
        (businesses[1] as any).business_name
      );
      console.log(`  https://saintandstoryltd.co.uk/prospect/${secondSlug}`);
    }

    console.log(
      "\n📝 If these URLs return 404, check Vercel logs for [PROSPECT] entries.\n"
    );
  } catch (error) {
    console.error("ERROR:", error);
    process.exit(1);
  }
}

debug();
