/**
 * PROMOTION FUNNEL AUDIT
 *
 * Verify that 0 new leads is expected behavior, not a scoring/promotion bug
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function promotionFunnelAudit() {
  console.log("🔍 PROMOTION FUNNEL AUDIT\n");
  console.log("Analyzing: 151 qualified businesses → 0 new leads\n");

  try {
    // 1. Get all scores to analyze
    console.log("1️⃣  FETCHING SCORE DATA\n");
    const allScores = await sql`
      SELECT opportunity_score as score
      FROM qualified_businesses
      ORDER BY opportunity_score DESC
    `;

    console.log(`Total qualified businesses: ${allScores.length}\n`);

    // 2. Tier distribution
    console.log("2️⃣  QUALIFICATION TIER DISTRIBUTION\n");
    const tierA = allScores.filter((s: any) => s.score >= 80).length;
    const tierB = allScores.filter((s: any) => s.score >= 60 && s.score < 80).length;
    const tierC = allScores.filter((s: any) => s.score >= 40 && s.score < 60).length;
    const tierD = allScores.filter((s: any) => s.score < 40).length;

    console.log(`Tier A (80+): ${tierA} businesses`);
    if (tierA > 0) {
      const aScores = allScores.filter((s: any) => s.score >= 80).map((s: any) => s.score);
      console.log(`  Range: ${Math.min(...aScores)} - ${Math.max(...aScores)}`);
    }

    console.log(`Tier B (60-79): ${tierB} businesses`);
    if (tierB > 0) {
      const bScores = allScores.filter((s: any) => s.score >= 60 && s.score < 80).map((s: any) => s.score);
      console.log(`  Range: ${Math.min(...bScores)} - ${Math.max(...bScores)}`);
    }

    console.log(`Tier C (40-59): ${tierC} businesses`);
    if (tierC > 0) {
      const cScores = allScores.filter((s: any) => s.score >= 40 && s.score < 60).map((s: any) => s.score);
      console.log(`  Range: ${Math.min(...cScores)} - ${Math.max(...cScores)}`);
    }

    console.log(`Tier D (0-39): ${tierD} businesses`);
    if (tierD > 0) {
      const dScores = allScores.filter((s: any) => s.score < 40).map((s: any) => s.score);
      console.log(`  Range: ${Math.min(...dScores)} - ${Math.max(...dScores)}`);
    }
    console.log("");

    // 3. Overall statistics
    console.log("3️⃣  SCORE STATISTICS\n");
    const scores = allScores.map((s: any) => s.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = (scores.reduce((a: number, b: any) => a + b.score, 0) / scores.length).toFixed(2);

    console.log(`Minimum score: ${min}`);
    console.log(`Maximum score: ${max}`);
    console.log(`Average score: ${avg}\n`);

    // 4. Score bucket distribution
    console.log("4️⃣  SCORE BUCKET DISTRIBUTION\n");
    const bucket80 = allScores.filter((s: any) => s.score >= 80).length;
    const bucket60 = allScores.filter((s: any) => s.score >= 60 && s.score < 80).length;
    const bucket40 = allScores.filter((s: any) => s.score >= 40 && s.score < 60).length;
    const bucket20 = allScores.filter((s: any) => s.score >= 20 && s.score < 40).length;
    const bucket0 = allScores.filter((s: any) => s.score < 20).length;

    console.log(`80+    : ${bucket80.toString().padStart(3)} (${(bucket80 / 151 * 100).toFixed(1)}%)`);
    console.log(`60-79  : ${bucket60.toString().padStart(3)} (${(bucket60 / 151 * 100).toFixed(1)}%)`);
    console.log(`40-59  : ${bucket40.toString().padStart(3)} (${(bucket40 / 151 * 100).toFixed(1)}%)`);
    console.log(`20-39  : ${bucket20.toString().padStart(3)} (${(bucket20 / 151 * 100).toFixed(1)}%)`);
    console.log(`0-19   : ${bucket0.toString().padStart(3)} (${(bucket0 / 151 * 100).toFixed(1)}%)\n`);

    // 5. Promotion at different thresholds
    console.log("5️⃣  PROMOTION COUNTS AT DIFFERENT THRESHOLDS\n");
    const thresholds = [20, 30, 40, 50, 60, 70, 80];

    for (const t of thresholds) {
      const count = allScores.filter((s: any) => s.score >= t).length;
      const pct = (count / 151 * 100).toFixed(1);
      console.log(`Threshold >= ${t}: ${count.toString().padStart(3)} businesses (${pct}%)`);
    }
    console.log("");

    // 6. Current promotion result
    console.log("6️⃣  ACTUAL PROMOTION RESULT\n");
    const promoted = await sql`
      SELECT COUNT(*)::int as count
      FROM b2b_leads
      WHERE source = 'discovery_promoted'
    `;

    console.log(`New leads created: ${promoted[0].count}`);
    console.log(`Current threshold: 40 (minScore parameter in promoteToLead())\n`);

    // 7. Verdict
    console.log("=".repeat(60));
    console.log("AUDIT VERDICT:");
    console.log("=".repeat(60));

    const aboveThreshold = tierA + tierB + tierC;

    if (aboveThreshold === 0) {
      console.log("✅ EXPECTED BEHAVIOR");
      console.log(`   All 151 businesses score below 40`);
      console.log(`   0 new leads is CORRECT\n`);
      console.log("RECOMMENDATION: Discovery pool is weak.");
      console.log("Consider: adjusting scoring model or expanding search criteria\n");
    } else {
      console.log("⚠️  UNEXPECTED BEHAVIOR");
      console.log(`   ${aboveThreshold} businesses score >= 40`);
      console.log(`   But only 0 were promoted to leads`);
      console.log(`   ISSUE: Check promoteToLead() logic\n`);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

promotionFunnelAudit();
