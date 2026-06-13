import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function backfillDiscoveryPipeline() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       PHASE A: BACKFILL DISCOVERY PIPELINE FOR 45 LEADS   ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get all unlinked leads
  const unlinkedLeads = await sql`
    SELECT 
      id,
      business_name,
      business_category,
      email,
      phone,
      website,
      city,
      postcode,
      pain_point
    FROM b2b_leads 
    WHERE source != 'qa_system_test' 
      AND discovered_business_id IS NULL
    ORDER BY business_category, created_at ASC
  `;

  console.log(`Processing ${unlinkedLeads.length} leads\n`);

  let createdDiscovered = 0;
  let createdEnriched = 0;
  let createdQualified = 0;
  let linkedLeads = 0;

  for (const lead of unlinkedLeads) {
    console.log(`${lead.business_name}...`);

    // Create discovered_business
    const discoveredResult = await sql`
      INSERT INTO discovered_businesses (
        google_place_id,
        business_name,
        address,
        postcode,
        city,
        category,
        website,
        phone,
        email,
        source
      ) VALUES (
        ${'manual_' + lead.id},
        ${lead.business_name},
        ${lead.business_name},
        ${lead.postcode},
        ${lead.city},
        ${lead.business_category},
        ${lead.website},
        ${lead.phone},
        ${lead.email},
        'manual_lead_backfill'
      )
      RETURNING id
    `;

    createdDiscovered++;
    const discovered_id = discoveredResult[0].id;

    // Create enriched_business
    const enrichedResult = await sql`
      INSERT INTO enriched_businesses (
        discovered_business_id,
        google_place_id,
        ai_observations
      ) VALUES (
        ${discovered_id},
        ${'manual_' + lead.id},
        ${lead.pain_point || 'No observations'}
      )
      RETURNING id
    `;

    createdEnriched++;
    const enriched_id = enrichedResult[0].id;

    // Create qualified_business with baseline opportunity score
    // Score based on category and data completeness
    let opportunityScore = 45;
    if (lead.phone) opportunityScore += 10;
    if (lead.email) opportunityScore += 10;
    if (lead.website) opportunityScore += 10;
    if (lead.city) opportunityScore += 5;

    const qualifiedResult = await sql`
      INSERT INTO qualified_businesses (
        enriched_business_id,
        discovered_business_id,
        google_place_id,
        opportunity_score,
        score_breakdown,
        confidence,
        qualification_reason,
        estimated_monthly_value
      ) VALUES (
        ${enriched_id},
        ${discovered_id},
        ${'manual_' + lead.id},
        ${opportunityScore},
        ${ JSON.stringify({ manual: true, category: lead.business_category, data_completeness: lead.phone && lead.email ? 'high' : 'medium' })},
        'medium',
        'Manual lead backfill',
        2500.00
      )
      RETURNING id
    `;

    createdQualified++;
    const qualified_id = qualifiedResult[0].id;

    // Update lead with linkages
    await sql`
      UPDATE b2b_leads
      SET 
        discovered_business_id = ${discovered_id},
        qualified_business_id = ${qualified_id},
        promoted_from_qualified_at = NOW()
      WHERE id = ${lead.id}
    `;

    linkedLeads++;
    console.log(`  ✓ Created pipeline, score: ${opportunityScore}`);
  }

  console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`BACKFILL COMPLETE:\n`);
  console.log(`  Discovered businesses created: ${createdDiscovered}`);
  console.log(`  Enriched businesses created: ${createdEnriched}`);
  console.log(`  Qualified businesses created: ${createdQualified}`);
  console.log(`  Leads linked: ${linkedLeads}\n`);

  // Verify
  const nowLinked = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  console.log(`✓ Verification: ${nowLinked[0].count}/45 leads now linked\n`);

  // Show sample with opportunity scores
  console.log("SAMPLE LINKED LEADS:\n");

  const sample = await sql`
    SELECT 
      l.business_name,
      l.business_category,
      qb.opportunity_score
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE l.source != 'qa_system_test'
    ORDER BY l.business_category
    LIMIT 10
  `;

  for (const lead of sample) {
    const score = parseFloat(lead.opportunity_score) || 0;
    console.log(`${lead.business_name}: ${score.toFixed(1)} (${lead.business_category})`);
  }

  console.log("\n✅ PHASE A COMPLETE");
}

backfillDiscoveryPipeline().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
