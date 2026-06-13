import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function auditOpportunityScoreLinkage() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║        PHASE A: OPPORTUNITY SCORE LINKAGE AUDIT           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // 1. Check current state of leads
  console.log("STAGE 1: Current Lead State\n");

  const leadsCount = await sql`
    SELECT COUNT(*) as count FROM b2b_leads WHERE source != 'qa_system_test'
  `;

  const leadsWithQualified = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  const leadsWithoutQualified = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NULL
  `;

  console.log(`Total production leads: ${leadsCount[0].count}`);
  console.log(`Leads linked to qualified_businesses: ${leadsWithQualified[0].count}`);
  console.log(`Leads NOT linked: ${leadsWithoutQualified[0].count}`);
  console.log(`Status: ${leadsWithoutQualified[0].count > 0 ? '❌ BROKEN' : '✓ OK'}\n`);

  // 2. Sample leads to understand structure
  console.log("STAGE 2: Sample Lead Data\n");

  const sampleLeads = await sql`
    SELECT 
      id,
      business_name,
      qualified_business_id,
      engagement_score,
      created_at
    FROM b2b_leads 
    WHERE source != 'qa_system_test'
    LIMIT 3
  `;

  for (const lead of sampleLeads) {
    console.log(`Lead: ${lead.business_name}`);
    console.log(`  ID: ${lead.id}`);
    console.log(`  qualified_business_id: ${lead.qualified_business_id || 'NULL'}`);
    console.log(`  engagement_score: ${lead.engagement_score}`);
    console.log();
  }

  // 3. Check qualified_businesses table
  console.log("STAGE 3: Qualified Businesses Available\n");

  const qualifiedCount = await sql`
    SELECT COUNT(*) as count FROM qualified_businesses
  `;

  const qualifiedWithScores = await sql`
    SELECT COUNT(*) as count FROM qualified_businesses 
    WHERE opportunity_score IS NOT NULL
  `;

  console.log(`Total qualified_businesses: ${qualifiedCount[0].count}`);
  console.log(`With opportunity_score: ${qualifiedWithScores[0].count}\n`);

  // Sample qualified_businesses
  const sampleQualified = await sql`
    SELECT 
      id,
      business_name,
      opportunity_score,
      qualified_at
    FROM qualified_businesses
    ORDER BY qualified_at DESC
    LIMIT 3
  `;

  console.log("Sample qualified_businesses:\n");
  for (const qb of sampleQualified) {
    console.log(`${qb.business_name}: score=${qb.opportunity_score}`);
  }

  // 4. Check lead_promotions table
  console.log("\n\nSTAGE 4: Lead Promotion Records\n");

  const promotions = await sql`
    SELECT COUNT(*) as count FROM lead_promotions
  `;

  console.log(`Total promotions recorded: ${promotions[0].count}`);

  if (promotions[0].count > 0) {
    const samplePromos = await sql`
      SELECT 
        lp.qualified_business_id,
        lp.lead_id,
        qb.business_name,
        qb.opportunity_score,
        lp.promoted_at
      FROM lead_promotions lp
      LEFT JOIN qualified_businesses qb ON lp.qualified_business_id = qb.id
      LEFT JOIN b2b_leads l ON lp.lead_id = l.id
      LIMIT 5
    `;

    console.log("\nSample promotions:\n");
    for (const promo of samplePromos) {
      console.log(`${qb.business_name} → Lead ID ${promo.lead_id}`);
    }
  }

  // 5. Check for matching relationship
  console.log("\n\nSTAGE 5: Relationship Analysis\n");

  const leadsWithQualifiedRef = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  console.log(`Leads with qualified_business_id set: ${leadsWithQualifiedRef[0].count}`);

  // 6. Try to match by business name
  console.log("\n\nSTAGE 6: Name-Based Matching Feasibility\n");

  const unlinkedSample = await sql`
    SELECT id, business_name FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NULL
    LIMIT 5
  `;

  console.log(`Testing name-based matching:\n`);

  let matchableCount = 0;
  let unmatchableCount = 0;

  for (const lead of unlinkedSample) {
    const potentialMatches = await sql`
      SELECT id, business_name, opportunity_score FROM qualified_businesses 
      WHERE LOWER(TRIM(business_name)) = LOWER(TRIM(${lead.business_name}))
      LIMIT 1
    `;

    if (potentialMatches.length > 0) {
      console.log(`✓ "${lead.business_name}" → "${potentialMatches[0].business_name}" (score: ${potentialMatches[0].opportunity_score})`);
      matchableCount++;
    } else {
      console.log(`✗ "${lead.business_name}" (no match)`);
      unmatchableCount++;
    }
  }

  console.log(`\nMatching results:`);
  console.log(`  Matchable: ${matchableCount}/${unlinkedSample.length}`);
  console.log(`  Unmatchable: ${unmatchableCount}/${unlinkedSample.length}`);

  // 7. Summary and recommendations
  console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("PHASE A ASSESSMENT\n");

  const totalProduction = leadsCount[0].count;
  const totalMissing = leadsWithoutQualified[0].count;
  const percentageMissing = totalProduction > 0 ? ((totalMissing / totalProduction) * 100).toFixed(0) : 0;

  if (totalMissing > 0) {
    console.log(`❌ BROKEN: ${percentageMissing}% of production leads (${totalMissing}/${totalProduction}) are not linked to qualified_businesses\n`);
    console.log("IMPACT:");
    console.log("  • Heat score qualification component is missing");
    console.log("  • All heat scores show 0/100 even if engagement exists");
    console.log("  • Cannot rank prospects by business fit\n");
    console.log("ROOT CAUSE: Leads created without qualified_business_id linkage\n");
    console.log("REPAIR OPTIONS:");
    console.log("  1. Match leads to qualified_businesses by exact business name");
    console.log("  2. Use lead_promotions table to find original qualified_business_id");
    console.log("  3. Manual matching if data is inconsistent\n");
    console.log("RECOMMENDATION:");
    console.log(`  Attempt automated matching for ${matchableCount} leads by business name`);
    console.log(`  Manual review for ${unmatchableCount} leads with no matches\n`);
  } else {
    console.log("✓ OK: All leads are linked to qualified_businesses.\n");
  }
}

auditOpportunityScoreLinkage().catch(err => {
  console.error("AUDIT ERROR:", err.message);
  process.exit(1);
});
