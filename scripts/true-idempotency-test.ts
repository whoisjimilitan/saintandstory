/**
 * TRUE IDEMPOTENCY TEST
 *
 * Take a Business.id that ALREADY EXISTS in discovered_businesses
 * Call runFullPipeline() directly on it again
 * Verify ZERO new rows are created
 */

import { neon } from "@neondatabase/serverless";
import { runFullPipeline, RawBusinessDiscovery } from "../lib/four-layer-pipeline";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function trueIdempotencyTest() {
  console.log("🧪 TRUE IDEMPOTENCY TEST\n");
  console.log("Reprocessing a PREVIOUSLY DISCOVERED Business\n");

  try {
    // Find an already-discovered business
    console.log("1. Finding an already-discovered Business...\n");
    const discovered = await sql`
      SELECT google_place_id
      FROM discovered_businesses
      LIMIT 1
    `;

    if (!discovered || discovered.length === 0) {
      console.log("❌ No discovered businesses found");
      process.exit(1);
    }

    const testBusinessID = discovered[0].google_place_id;
    console.log(`   Selected: ${testBusinessID}\n`);

    // Get the Prisma Business record
    const prismaRecord = await sql`
      SELECT
        id, name, niche, "createdAt", website, phone,
        address, location, "sourcePayload"
      FROM "Business"
      WHERE id = ${testBusinessID}
    `;

    if (!prismaRecord || prismaRecord.length === 0) {
      console.log("❌ Business record not found");
      process.exit(1);
    }

    const business = prismaRecord[0];
    console.log(`2. Business Details:`);
    console.log(`   Name: ${business.name}`);
    console.log(`   ID: ${business.id}\n`);

    // Get baseline counts
    console.log(`3. Baseline counts:\n`);
    const dbBefore = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const qbBefore = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const blBefore = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    console.log(`   discovered_businesses: ${dbBefore[0].count}`);
    console.log(`   qualified_businesses:  ${qbBefore[0].count}`);
    console.log(`   b2b_leads:             ${blBefore[0].count}\n`);

    // Get reviews (if Review table exists)
    let reviews: any[] = [];
    try {
      reviews = await sql`
        SELECT rating, text, author
        FROM "Review"
        WHERE "businessId" = ${business.id}
        LIMIT 50
      `;
    } catch (err) {
      // Review table may not exist or have different schema
      console.log("   (Review table not available or different schema)\n");
    }

    // Construct RawBusinessDiscovery
    const rawDiscovery: RawBusinessDiscovery = {
      placeId: business.id,
      name: business.name,
      address: business.address || "",
      postcode: business.location,
      category: business.niche || "Unknown",
      source: "prisma_business",
      reviews: (reviews as any[]).map((r: any) => ({
        rating: r.rating,
        text: r.text,
        author: r.author,
        time: r.time?.getTime() || Date.now(),
      })),
      rawData: {
        prismaBusinessId: business.id,
        website: business.website,
        phone: business.phone,
        niche: business.niche,
      },
    };

    // Reprocess the same business
    console.log(`4. Calling runFullPipeline() on SAME business...\n`);
    const result = await runFullPipeline(sql, rawDiscovery);
    console.log(`   Result: ${JSON.stringify(result)}\n`);

    // Get after counts
    const dbAfter = await sql`SELECT COUNT(*)::int as count FROM discovered_businesses`;
    const qbAfter = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const blAfter = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const dbDelta = dbAfter[0].count - dbBefore[0].count;
    const qbDelta = qbAfter[0].count - qbBefore[0].count;
    const blDelta = blAfter[0].count - blBefore[0].count;

    console.log(`5. After counts:\n`);
    console.log(`   discovered_businesses: Δ ${dbDelta}`);
    console.log(`   qualified_businesses:  Δ ${qbDelta}`);
    console.log(`   b2b_leads:             Δ ${blDelta}\n`);

    // Verdict
    console.log("=".repeat(60));
    console.log("VERDICT:");
    console.log("=".repeat(60));

    if (dbDelta === 0 && qbDelta === 0 && blDelta === 0) {
      console.log("✅ TRUE IDEMPOTENCY PASSED");
      console.log("✅ Reprocessing same Business created ZERO new rows");
      console.log("✅ Safe for nightly reprocessing\n");
      process.exit(0);
    } else {
      console.log("❌ TRUE IDEMPOTENCY FAILED");
      console.log(`   Unexpected deltas: DB=${dbDelta}, QB=${qbDelta}, BL=${blDelta}`);
      console.log("   Reprocessing should create zero rows\n");
      process.exit(1);
    }

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

trueIdempotencyTest();
