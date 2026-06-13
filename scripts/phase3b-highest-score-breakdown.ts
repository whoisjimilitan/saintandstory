/**
 * PHASE 3B: HIGHEST SCORING BUSINESS BREAKDOWN
 *
 * Trace: What actually drives the highest scores?
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function highestScoreBreakdown() {
  console.log("🔍 PHASE 3B: HIGHEST SCORING BUSINESS BREAKDOWN\n");

  try {
    // Get the highest scoring business
    const highest = await sql`
      SELECT
        qb.id,
        qb.opportunity_score as score,
        qb.score_breakdown,
        db.business_name,
        db.address,
        db.postcode,
        db.category,
        db.raw_data,
        eb.website,
        eb.phone,
        eb.review_count,
        eb.average_rating,
        eb.review_summary
      FROM qualified_businesses qb
      JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      JOIN enriched_businesses eb ON qb.enriched_business_id = eb.id
      ORDER BY qb.opportunity_score DESC
      LIMIT 1
    `;

    if (!highest || highest.length === 0) {
      console.log("❌ No businesses found");
      return;
    }

    const b = highest[0];

    console.log("1️⃣  BUSINESS DETAILS\n");
    console.log(`Name: ${b.business_name}`);
    console.log(`Address: ${b.address}`);
    console.log(`Category: ${b.category}`);
    console.log(`Score: ${parseFloat(b.score).toFixed(2)}\n`);

    console.log("2️⃣  ENRICHMENT DATA\n");
    console.log(`Website: ${b.website || "NONE"}`);
    console.log(`Phone: ${b.phone || "NONE"}`);
    console.log(`Reviews: ${b.review_count}`);
    console.log(`Rating: ${b.average_rating || "NONE"}`);
    console.log(`Review Summary: ${b.review_summary ? JSON.stringify(b.review_summary) : "NONE"}\n`);

    console.log("3️⃣  SCORE BREAKDOWN\n");
    const breakdown = b.score_breakdown;

    if (breakdown) {
      console.log(JSON.stringify(breakdown, null, 2));
      console.log("");
    }

    console.log("4️⃣  SCORING ANALYSIS\n");

    // Check which score components exist
    const components = breakdown || {};

    const hasBusinessType = components.businessTypeScore !== undefined;
    const hasMaturity = components.maturityScore !== undefined;
    const hasComplexity = components.serviceComplexityScore !== undefined;
    const hasTransport = components.transportDependenceScore !== undefined;
    const hasReview = components.reviewSignalsScore !== undefined;
    const hasDigital = components.digitalMaturityScore !== undefined;
    const hasPain = components.painSignalBonus !== undefined;

    console.log("Scoring Components Present:");
    console.log(`  businessTypeScore: ${hasBusinessType ? `${components.businessTypeScore} ✓` : "MISSING ❌"}`);
    console.log(`  maturityScore: ${hasMaturity ? `${components.maturityScore} ✓` : "MISSING ❌"}`);
    console.log(`  serviceComplexityScore: ${hasComplexity ? `${components.serviceComplexityScore} ✓` : "MISSING ❌"}`);
    console.log(
      `  transportDependenceScore: ${hasTransport ? `${components.transportDependenceScore} ✓` : "MISSING ❌"}`
    );
    console.log(`  reviewSignalsScore: ${hasReview ? `${components.reviewSignalsScore} ✓` : "MISSING ❌"}`);
    console.log(`  digitalMaturityScore: ${hasDigital ? `${components.digitalMaturityScore} ✓` : "MISSING ❌"}`);
    console.log(`  painSignalBonus: ${hasPain ? `${components.painSignalBonus} ✓` : "MISSING ❌"}\n`);

    // Check for zeroes
    const zeros = [];
    if (components.businessTypeScore === 0) zeros.push("businessTypeScore");
    if (components.maturityScore === 0) zeros.push("maturityScore");
    if (components.serviceComplexityScore === 0) zeros.push("serviceComplexityScore");
    if (components.transportDependenceScore === 0) zeros.push("transportDependenceScore");
    if (components.reviewSignalsScore === 0) zeros.push("reviewSignalsScore");
    if (components.digitalMaturityScore === 0) zeros.push("digitalMaturityScore");
    if (components.painSignalBonus === 0) zeros.push("painSignalBonus");

    console.log("Components scoring ZERO:");
    if (zeros.length > 0) {
      for (const z of zeros) {
        console.log(`  ❌ ${z}`);
      }
    } else {
      console.log("  None - all components have positive values");
    }
    console.log("");

    console.log("=".repeat(60));
    console.log("VERDICT:");
    console.log("=".repeat(60));

    const sum = Object.values(components)
      .filter((v) => typeof v === "number")
      .reduce((a: number, b: any) => a + b, 0);

    console.log(`Breakdown sum: ${sum.toFixed(2)}`);
    console.log(`Actual score: ${parseFloat(b.score).toFixed(2)}`);

    if (zeros.length >= 4) {
      console.log("\n⚠️  MULTIPLE ZERO COMPONENTS");
      console.log(
        "    Suggests: Scoring components not being populated or not calculating"
      );
      console.log("    This business has limited enrichment data\n");
    } else {
      console.log("\n✅ Score breakdown looks complete");
      console.log(
        "   Components are being calculated\n"
      );
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

highestScoreBreakdown();
