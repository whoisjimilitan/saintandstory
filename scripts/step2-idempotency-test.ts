import { neon } from "@neondatabase/serverless";
import { runFullPipeline, RawBusinessDiscovery } from "../lib/four-layer-pipeline";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function idempotencyTest() {
  console.log("🧪 STEP 2: IDEMPOTENCY TEST\n");
  console.log("Testing: Same business through Phase 4 twice\n");

  try {
    // Get baseline counts
    console.log("📊 Getting baseline counts...\n");
    const baselineQB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const baselineBL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const qbBefore = baselineQB[0].count;
    const blBefore = baselineBL[0].count;

    console.log(`  qualified_businesses: ${qbBefore}`);
    console.log(`  b2b_leads: ${blBefore}\n`);

    // Select one test business from discovered_businesses
    console.log("🔍 Selecting test business from discovered_businesses...\n");
    const testBiz = await sql`
      SELECT
        id,
        google_place_id,
        business_name,
        address,
        postcode,
        category,
        source,
        raw_data
      FROM discovered_businesses
      LIMIT 1
    `;

    if (!testBiz || testBiz.length === 0) {
      console.log("❌ No discovered businesses found\n");
      process.exit(1);
    }

    const business = testBiz[0];
    console.log(`  ✓ Business: ${business.business_name}`);
    console.log(`  ✓ Place ID: ${business.google_place_id}`);
    console.log(`  ✓ Category: ${business.category}\n`);

    // Get reviews for this business
    console.log("📖 Fetching reviews...\n");
    const reviews = await sql`
      SELECT rating, text, author, time
      FROM reviews
      WHERE discovered_business_id = ${business.id}
      LIMIT 20
    `;

    console.log(`  ✓ Found ${reviews.length} reviews\n`);

    // Build RawBusinessDiscovery adapter
    const rawDiscovery: RawBusinessDiscovery = {
      placeId: business.google_place_id,
      name: business.business_name,
      address: business.address || "",
      postcode: business.postcode,
      category: business.category,
      source: business.source || "discovery",
      reviews: (reviews as any[]).map((r: any) => ({
        rating: r.rating,
        text: r.text,
        author: r.author,
        time: r.time,
      })),
      rawData: business.raw_data,
    };

    // RUN #1
    console.log("▶️  RUN #1: Processing through runFullPipeline()...\n");
    const result1 = await runFullPipeline(sql, rawDiscovery);
    console.log(`  Result: ${JSON.stringify(result1)}\n`);

    // Get counts after RUN #1
    const afterRun1QB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const afterRun1BL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const qbAfterRun1 = afterRun1QB[0].count;
    const blAfterRun1 = afterRun1BL[0].count;
    const qbDelta1 = qbAfterRun1 - qbBefore;
    const blDelta1 = blAfterRun1 - blBefore;

    console.log("📊 After RUN #1:");
    console.log(`  qualified_businesses: ${qbAfterRun1} (Δ +${qbDelta1})`);
    console.log(`  b2b_leads: ${blAfterRun1} (Δ +${blDelta1})\n`);

    // RUN #2 - IDENTICAL INPUT
    console.log("▶️  RUN #2: Processing SAME business again...\n");
    const result2 = await runFullPipeline(sql, rawDiscovery);
    console.log(`  Result: ${JSON.stringify(result2)}\n`);

    // Get counts after RUN #2
    const afterRun2QB = await sql`SELECT COUNT(*)::int as count FROM qualified_businesses`;
    const afterRun2BL = await sql`SELECT COUNT(*)::int as count FROM b2b_leads`;

    const qbAfterRun2 = afterRun2QB[0].count;
    const blAfterRun2 = afterRun2BL[0].count;
    const qbDelta2 = qbAfterRun2 - qbAfterRun1;
    const blDelta2 = blAfterRun2 - blAfterRun1;

    console.log("📊 After RUN #2:");
    console.log(`  qualified_businesses: ${qbAfterRun2} (Δ +${qbDelta2})`);
    console.log(`  b2b_leads: ${blAfterRun2} (Δ +${blDelta2})\n`);

    // VERDICT
    console.log("=".repeat(60));
    console.log("IDEMPOTENCY TEST VERDICT:");
    console.log("=".repeat(60));

    if (qbDelta2 === 0 && blDelta2 === 0) {
      console.log("✅ IDEMPOTENT - Second run created zero new rows");
      console.log("✅ Pipeline is safe for bridge deployment\n");
      process.exit(0);
    } else {
      console.log("❌ NOT IDEMPOTENT - Second run created new rows");
      console.log(`   qualified_businesses: +${qbDelta2} (EXPECTED: 0)`);
      console.log(`   b2b_leads: +${blDelta2} (EXPECTED: 0)\n`);
      console.log("❌ STOP - Do not proceed with bridge\n");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Error during idempotency test:", error);
    process.exit(1);
  }
}

idempotencyTest();
