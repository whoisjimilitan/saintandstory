import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function backfillDiscoveryPipeline() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       PHASE A: BACKFILL DISCOVERY PIPELINE FOR 45 LEADS   ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const unlinkedLeads = await sql`
    SELECT 
      id,
      business_name,
      business_category,
      email,
      phone,
      website,
      postcode,
      pain_point
    FROM b2b_leads 
    WHERE source != 'qa_system_test' 
      AND qualified_business_id IS NULL
    ORDER BY business_category ASC
  `;

  console.log(`Processing ${unlinkedLeads.length} leads...\n`);

  let created = 0;

  for (const lead of unlinkedLeads) {
    // Create discovered_business
    const discoveredResult = await sql`
      INSERT INTO discovered_businesses (
        google_place_id,
        business_name,
        address,
        postcode,
        category,
        source,
        raw_data
      ) VALUES (
        ${'manual_' + lead.id.substring(0, 12)},
        ${lead.business_name},
        ${lead.business_name},
        ${lead.postcode},
        ${lead.business_category},
        'manual_lead_backfill',
        ${ JSON.stringify({ email: lead.email, phone: lead.phone, website: lead.website, pain_point: lead.pain_point })}
      )
      RETURNING id
    `;

    const discovered_id = discoveredResult[0].id;

    // Create enriched_business
    const enrichedResult = await sql`
      INSERT INTO enriched_businesses (
        discovered_business_id,
        google_place_id,
        ai_observations
      ) VALUES (
        ${discovered_id},
        ${'manual_' + lead.id.substring(0, 12)},
        ${lead.pain_point || 'Manual lead backfill'}
      )
      RETURNING id
    `;

    const enriched_id = enrichedResult[0].id;

    // Calculate opportunity score based on data completeness
    let opportunityScore = 50;
    if (lead.phone) opportunityScore += 15;
    if (lead.email) opportunityScore += 15;
    if (lead.website) opportunityScore += 10;
    if (lead.postcode) opportunityScore += 5;
    opportunityScore = Math.min(opportunityScore, 99);

    // Create qualified_business
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
        ${'manual_' + lead.id.substring(0, 12)},
        ${opportunityScore},
        ${ JSON.stringify({ category: lead.business_category, data_completeness: lead.phone && lead.email ? 'high' : 'medium', backfill: true })},
        'medium',
        'Manual lead backfill from existing B2B lead',
        2500.00
      )
      RETURNING id
    `;

    const qualified_id = qualifiedResult[0].id;

    // Update lead
    await sql`
      UPDATE b2b_leads
      SET 
        discovered_business_id = ${discovered_id},
        qualified_business_id = ${qualified_id},
        promoted_from_qualified_at = NOW()
      WHERE id = ${lead.id}
    `;

    created++;
    if (created % 5 === 0 || created === unlinkedLeads.length) {
      console.log(`  ✓ ${created}/${unlinkedLeads.length} processed`);
    }
  }

  // Verify
  const verified = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  console.log(`\n✓ VERIFIED: ${verified[0].count}/45 leads linked\n`);

  // Show summary by category
  console.log("Leads by Category with Opportunity Scores:\n");

  const summary = await sql`
    SELECT 
      l.business_category,
      COUNT(*) as count,
      AVG(CAST(qb.opportunity_score AS FLOAT)) as avg_score,
      MIN(CAST(qb.opportunity_score AS FLOAT)) as min_score,
      MAX(CAST(qb.opportunity_score AS FLOAT)) as max_score
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE l.source != 'qa_system_test'
    GROUP BY l.business_category
    ORDER BY count DESC
  `;

  for (const cat of summary) {
    const avg = parseFloat(cat.avg_score) || 0;
    const min = parseFloat(cat.min_score) || 0;
    const max = parseFloat(cat.max_score) || 0;
    console.log(`${cat.business_category}: ${cat.count} leads, avg score ${avg.toFixed(1)} (${min.toFixed(0)}-${max.toFixed(0)})`);
  }

  console.log("\n✅ PHASE A COMPLETE: All leads now linked to qualified_businesses");
}

backfillDiscoveryPipeline().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
