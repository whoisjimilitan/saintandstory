import { neon } from '@neondatabase/serverless';

const dbUrl = "postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(dbUrl);

async function task1() {
  try {
    console.log("\n🔍 TASK 1 — DISCOVERY DATA AVAILABILITY\n");
    
    const res = await sql`
      SELECT 
        id,
        business_name,
        review_rating,
        pain_point,
        pain_point_review,
        source,
        created_at
      FROM b2b_leads
      WHERE source = 'discovery'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log(`Found ${res.length} recent discovered leads:\n`);
    
    res.forEach((lead, i) => {
      console.log(`[${i+1}] ${lead.business_name}`);
      console.log(`    ID: ${lead.id}`);
      console.log(`    review_rating: ${lead.review_rating ?? 'NULL'}`);
      console.log(`    pain_point: ${lead.pain_point ?? 'NULL'}`);
      console.log(`    pain_point_review: ${lead.pain_point_review ? lead.pain_point_review.substring(0, 60) + '...' : 'NULL'}`);
      console.log(`    created_at: ${lead.created_at}`);
      console.log();
    });

    // CLASSIFY
    console.log("📋 CLASSIFICATION:\n");
    
    let allNull = res.every(l => l.review_rating === null && l.pain_point === null);
    let someNull = res.some(l => l.review_rating === null || l.pain_point === null);
    let someData = res.some(l => l.review_rating !== null || l.pain_point !== null);

    if (allNull) {
      console.log("Case A or B or C:");
      console.log("  - ALL discovered leads have NULL review_rating AND NULL pain_point");
      console.log("  - This suggests: Google API never provided this data");
      console.log("  - OR: Parser dropped it");
      console.log("  - OR: DB insert doesn't include these fields");
    } else if (someData && someNull) {
      console.log("Case D (PARTIAL):");
      console.log("  - Some leads HAVE review_rating/pain_point, others NULL");
      console.log("  - Suggests: inconsistent data or selective insertion");
    } else if (someData) {
      console.log("✅ Case WORKING:");
      console.log("  - All leads have review_rating and/or pain_point populated");
    }

    console.log("\n✅ Task 1 complete\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

task1();
