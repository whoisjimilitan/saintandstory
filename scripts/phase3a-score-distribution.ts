/**
 * PHASE 3A: SCORE DISTRIBUTION AUDIT
 *
 * Determine: healthy distribution or concentrated band?
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function scoreDistributionAudit() {
  console.log("📊 PHASE 3A: SCORE DISTRIBUTION AUDIT\n");

  try {
    // Get all scores
    const allScores = await sql`
      SELECT
        qb.id,
        db.business_name,
        qb.opportunity_score as score,
        qb.score_breakdown
      FROM qualified_businesses qb
      JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      ORDER BY qb.opportunity_score DESC
    `;

    const scores = allScores.map((s: any) => parseFloat(s.score));

    // Calculate statistics
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

    console.log("1️⃣  OVERALL STATISTICS\n");
    console.log(`Total businesses: ${scores.length}`);
    console.log(`Minimum score: ${min.toFixed(2)}`);
    console.log(`Maximum score: ${max.toFixed(2)}`);
    console.log(`Average score: ${avg.toFixed(2)}`);
    console.log(`Range: ${(max - min).toFixed(2)}\n`);

    // Distribution by bucket
    console.log("2️⃣  DISTRIBUTION BY SCORE BUCKET\n");
    const bucketSize = 5;
    const buckets: { [key: number]: number } = {};

    for (const score of scores) {
      const bucket = Math.floor(score / bucketSize) * bucketSize;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }

    const sortedBuckets = Object.keys(buckets)
      .map(Number)
      .sort((a, b) => a - b);

    for (const bucket of sortedBuckets) {
      const count = buckets[bucket];
      const pct = ((count / scores.length) * 100).toFixed(1);
      const bar = "█".repeat(Math.ceil(count / 2));
      console.log(
        `${bucket.toString().padStart(3)}-${(bucket + bucketSize - 1).toString().padStart(3)}: ${count.toString().padStart(3)} (${pct}%) ${bar}`
      );
    }

    console.log("\n3️⃣  TOP 20 HIGHEST SCORING BUSINESSES\n");
    console.log(`Rank | Score | Business Name`);
    console.log("-".repeat(60));

    for (let i = 0; i < Math.min(20, allScores.length); i++) {
      const b = allScores[i];
      const scoreNum = parseFloat(b.score);
      console.log(
        `${(i + 1).toString().padStart(2)}   | ${scoreNum.toFixed(2)} | ${b.business_name.substring(0, 40)}`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("VERDICT:");
    console.log("=".repeat(60));

    const range = max - min;
    if (range < 10) {
      console.log(
        "⚠️  NARROW DISTRIBUTION (range < 10)"
      );
      console.log("    All businesses clustered in tight band");
      console.log("    Suggests: Scoring may have limited differentiation\n");
    } else if (range < 30) {
      console.log("⚠️  MODERATE DISTRIBUTION (range 10-30)");
      console.log("    Limited spread across score spectrum");
      console.log("    Suggests: Weak signal differentiation\n");
    } else {
      console.log("✅ HEALTHY DISTRIBUTION (range > 30)");
      console.log("   Good spread indicates scoring is working\n");
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

scoreDistributionAudit();
