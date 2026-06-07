import { neon } from '@neondatabase/serverless';

// Try neondb instead of brotherjimi
const dbUrl = "postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function runAudit() {
  const sql = neon(dbUrl);
  
  try {
    console.log("\n🔍 === PRODUCTION STATE AUDIT (neondb) ===\n");

    // 1. Check tables
    console.log("1️⃣ CHECKING DATABASE TABLES...");
    try {
      const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%lead%'`;
      console.log("Tables found:", res.map(r => r.table_name).join(", ") || "NONE");
    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }

    // 2. Lead state distribution
    console.log("\n2️⃣ LEAD STATE DISTRIBUTION...");
    try {
      const res = await sql`SELECT lead_state, COUNT(*) as count FROM b2b_leads GROUP BY lead_state ORDER BY count DESC`;
      if (res.length > 0) {
        console.log("✅ lead_state column EXISTS");
        res.forEach(row => console.log(`   ${row.lead_state || 'NULL'}: ${row.count} leads`));
      } else {
        console.log("⚠️  No leads with different states");
      }
    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }

    // 3. Recent leads
    console.log("\n3️⃣ RECENT 20 LEADS WITH STATE...");
    try {
      const res = await sql`SELECT id, business_name, lead_state, transitioned_at FROM b2b_leads ORDER BY created_at DESC LIMIT 20`;
      console.log(`✅ Found ${res.length} leads`);
      res.slice(0, 5).forEach((row, i) => {
        console.log(`   [${i+1}] ID=${row.id}, name="${row.business_name}", state=${row.lead_state || 'NULL'}, transitioned=${row.transitioned_at || 'NULL'}`);
      });
      if (res.length > 5) console.log(`   ... and ${res.length - 5} more`);
    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }

    // 4. Discovery integrity
    console.log("\n4️⃣ DISCOVERY LEADS (review_rating, pain_point)...");
    try {
      const res = await sql`SELECT id, business_name, review_rating, pain_point, source FROM b2b_leads WHERE source = 'discovery' ORDER BY created_at DESC LIMIT 10`;
      console.log(`✅ Found ${res.length} discovered leads`);
      if (res.length === 0) {
        console.log("⚠️  No leads with source='discovery' yet");
      } else {
        res.forEach((row, i) => {
          console.log(`   [${i+1}] ${row.business_name}`);
          console.log(`       review_rating: ${row.review_rating ?? 'NULL'} ${row.review_rating === null ? '❌' : '✅'}`);
          console.log(`       pain_point: ${row.pain_point ? '✅ ' + row.pain_point.substring(0, 30) : '❌'}`);
        });
      }
    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }

    // 5. Scoring validation
    console.log("\n5️⃣ RECENT 10 LEADS - SCORING INPUT VALIDATION...");
    try {
      const res = await sql`SELECT id, business_name, review_rating, pain_point, lead_state, source FROM b2b_leads ORDER BY created_at DESC LIMIT 10`;
      console.log(`✅ Analyzing ${res.length} recent leads`);
      let nullReview = 0, nullPain = 0;
      res.forEach((row, i) => {
        if (row.review_rating === null) nullReview++;
        if (!row.pain_point) nullPain++;
        console.log(`   [${i+1}] ${row.business_name} (${row.source})`);
        console.log(`       review_rating: ${row.review_rating ?? 'NULL'} | pain_point: ${row.pain_point ? '✅' : '❌'} | state: ${row.lead_state || 'NULL'}`);
      });
      console.log(`\n   SUMMARY:`);
      console.log(`   - ${nullReview}/10 have NULL review_rating`);
      console.log(`   - ${nullPain}/10 have NULL pain_point`);
    } catch (err) {
      console.log("❌ ERROR:", err.message);
    }

    console.log("\n✅ Audit complete\n");

  } catch (error) {
    console.error("❌ Fatal:", error);
  }
}

runAudit();
