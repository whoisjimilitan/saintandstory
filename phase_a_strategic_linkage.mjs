import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function createStrategicLinkage() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       PHASE A: STRATEGIC QUALIFIED_BUSINESS LINKAGE       ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get lead count by category
  console.log("STAGE 1: Lead Distribution by Category\n");
  const leadsByCategory = await sql`
    SELECT business_category, COUNT(*) as count
    FROM b2b_leads
    WHERE source != 'qa_system_test'
    GROUP BY business_category
    ORDER BY count DESC
  `;

  console.log("Leads by category:\n");
  for (const cat of leadsByCategory) {
    console.log(`  ${cat.business_category}: ${cat.count} leads`);
  }

  // Get qualified_business count by category
  console.log("\n\nSTAGE 2: Qualified Business Distribution by Category\n");
  const qualifiedByCategory = await sql`
    SELECT db.category, COUNT(*) as count, AVG(qb.opportunity_score) as avg_score
    FROM qualified_businesses qb
    LEFT JOIN discovered_businesses db ON qb.discovered_business_id = db.id
    WHERE db.category IS NOT NULL
    GROUP BY db.category
    ORDER BY count DESC
  `;

  console.log("Qualified businesses by category:\n");
  for (const cat of qualifiedByCategory) {
    console.log(`  ${cat.category}: ${cat.count} businesses, avg score ${cat.avg_score.toFixed(1)}`);
  }

  // Create linkages: for each lead category, assign qualified_businesses with matching category
  console.log("\n\nSTAGE 3: Creating Linkages by Category\n");

  let linkedCount = 0;

  for (const leadCat of leadsByCategory) {
    const category = leadCat.business_category;
    console.log(`\nProcessing category: ${category}`);

    // Get all leads in this category (unlinked)
    const leadsInCategory = await sql`
      SELECT id FROM b2b_leads
      WHERE business_category = ${category} 
        AND source != 'qa_system_test'
        AND qualified_business_id IS NULL
      ORDER BY created_at ASC
    `;

    console.log(`  Leads to link: ${leadsInCategory.length}`);

    // Get all qualified_businesses with matching category, ordered by score (descending)
    const qualifiedInCategory = await sql`
      SELECT qb.id, qb.opportunity_score
      FROM qualified_businesses qb
      LEFT JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      WHERE db.category = ${category}
      ORDER BY qb.opportunity_score DESC
    `;

    console.log(`  Available qualified: ${qualifiedInCategory.length}`);

    // Link leads to qualified_businesses in round-robin fashion (distribute across opportunities)
    for (let i = 0; i < leadsInCategory.length; i++) {
      const lead = leadsInCategory[i];
      // Cycle through qualified_businesses to distribute them
      const qualifiedIndex = i % qualifiedInCategory.length;
      const qualified = qualifiedInCategory[qualifiedIndex];

      await sql`
        UPDATE b2b_leads 
        SET qualified_business_id = ${qualified.id},
            promoted_from_qualified_at = NOW()
        WHERE id = ${lead.id}
      `;

      linkedCount++;
      if (i < 2 || i === leadsInCategory.length - 1) {
        console.log(`    ✓ Lead linked to qualified (score: ${qualified.opportunity_score})`);
      }
    }
  }

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`LINKAGE COMPLETE: ${linkedCount} leads linked\n`);

  // Verify linkage
  const nowLinked = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  const stillUnlinked = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NULL
  `;

  console.log(`Now linked: ${nowLinked[0].count}/45`);
  console.log(`Still unlinked: ${stillUnlinked[0].count}/45\n`);

  // Show sample linked leads with opportunity scores
  console.log("\nVERIFICATION: Sample Linked Leads\n");

  const sampleLinked = await sql`
    SELECT 
      l.business_name,
      l.business_category,
      qb.opportunity_score,
      qb.confidence
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE l.source != 'qa_system_test' AND l.qualified_business_id IS NOT NULL
    ORDER BY l.business_category, qb.opportunity_score DESC
    LIMIT 10
  `;

  for (const lead of sampleLinked) {
    console.log(`${lead.business_name}`);
    console.log(`  Category: ${lead.business_category}`);
    console.log(`  Opportunity Score: ${lead.opportunity_score}`);
    console.log(`  Confidence: ${lead.confidence}\n`);
  }

  console.log("✅ PHASE A LINKAGE COMPLETE\n");
}

createStrategicLinkage().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
