import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function debug() {
  console.log("=== DEBUGGING QUALIFICATION SCORE LINKAGE ===\n");

  // Check if leads are properly linked to qualified_businesses
  console.log("1. LEAD → QUALIFIED_BUSINESSES LINKAGE\n");

  const leadLinks = await sql`
    SELECT
      bl.id as lead_id,
      bl.business_name,
      bl.qualified_business_id,
      bl.discovered_business_id,
      qb.opportunity_score
    FROM b2b_leads bl
    LEFT JOIN qualified_businesses qb ON bl.qualified_business_id = qb.id
    WHERE bl.status NOT IN ('dead')
    LIMIT 5
  `;

  leadLinks.forEach(lead => {
    console.log(`Lead: ${lead.business_name}`);
    console.log(`  qualified_business_id: ${lead.qualified_business_id}`);
    console.log(`  discovered_business_id: ${lead.discovered_business_id}`);
    console.log(`  opportunity_score: ${lead.opportunity_score}`);
    console.log();
  });

  // Check qualified_businesses structure
  console.log("2. QUALIFIED_BUSINESSES DATA\n");

  const qbStats = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN opportunity_score > 0 THEN 1 END) as with_score,
      MIN(opportunity_score) as min_score,
      MAX(opportunity_score) as max_score,
      ROUND(AVG(opportunity_score)::numeric, 1) as avg_score
    FROM qualified_businesses
  `;

  console.log(`Total qualified businesses: ${qbStats[0].total}`);
  console.log(`With opportunity_score: ${qbStats[0].with_score}`);
  console.log(`Score range: ${qbStats[0].min_score} - ${qbStats[0].max_score}`);
  console.log(`Average score: ${qbStats[0].avg_score}`);

  // Check sample qualified businesses with scores
  console.log("\n3. SAMPLE QUALIFIED BUSINESSES\n");

  const samples = await sql`
    SELECT id, discovered_business_id, opportunity_score
    FROM qualified_businesses
    WHERE opportunity_score > 0
    ORDER BY opportunity_score DESC
    LIMIT 5
  `;

  samples.forEach((qb, idx) => {
    console.log(`${idx + 1}. QB ID: ${qb.id}`);
    console.log(`   Discovered Business ID: ${qb.discovered_business_id}`);
    console.log(`   Opportunity Score: ${qb.opportunity_score}`);
  });
}

debug().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
