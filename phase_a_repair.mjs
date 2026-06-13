import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function repairOpportunityScoreLinkage() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           PHASE A: REPAIR OPPORTUNITY LINKAGE             ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Get all unlinked leads
  const unlinkedLeads = await sql`
    SELECT 
      id,
      business_name,
      discovered_business_id
    FROM b2b_leads 
    WHERE source != 'qa_system_test' 
      AND qualified_business_id IS NULL
    ORDER BY created_at ASC
  `;

  console.log(`Found ${unlinkedLeads.length} unlinked leads\n`);

  let linked = 0;
  let unmatched = 0;
  const unmatchedLeads = [];

  // Attempt to link each lead
  for (const lead of unlinkedLeads) {
    let qualifiedBusinessId = null;

    // Strategy 1: If discovered_business_id exists, find its qualified_business
    if (lead.discovered_business_id) {
      const qb = await sql`
        SELECT id FROM qualified_businesses 
        WHERE discovered_business_id = ${lead.discovered_business_id}
        LIMIT 1
      `;

      if (qb.length > 0) {
        qualifiedBusinessId = qb[0].id;
      }
    }

    // Strategy 2: Match by business_name in discovered_businesses
    if (!qualifiedBusinessId) {
      const match = await sql`
        SELECT qb.id
        FROM qualified_businesses qb
        LEFT JOIN discovered_businesses db ON qb.discovered_business_id = db.id
        WHERE LOWER(TRIM(db.business_name)) = LOWER(TRIM(${lead.business_name}))
        LIMIT 1
      `;

      if (match.length > 0) {
        qualifiedBusinessId = match[0].id;
      }
    }

    if (qualifiedBusinessId) {
      // Update the lead with qualified_business_id
      await sql`
        UPDATE b2b_leads 
        SET qualified_business_id = ${qualifiedBusinessId}
        WHERE id = ${lead.id}
      `;
      linked++;
      console.log(`✓ ${lead.business_name} → linked to qualified_business`);
    } else {
      unmatched++;
      unmatchedLeads.push(lead.business_name);
      console.log(`✗ ${lead.business_name} → NO MATCH`);
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`REPAIR RESULTS:\n`);
  console.log(`✓ Linked: ${linked}/${unlinkedLeads.length}`);
  console.log(`✗ Unmatched: ${unmatched}/${unlinkedLeads.length}`);

  if (unmatchedLeads.length > 0) {
    console.log(`\nUnmatched leads:`);
    for (const name of unmatchedLeads) {
      console.log(`  • ${name}`);
    }
  }

  // Verify linkage
  console.log(`\n\nVERIFICATION:\n`);

  const nowLinked = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  const stillUnlinked = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NULL
  `;

  console.log(`Now linked: ${nowLinked[0].count}`);
  console.log(`Still unlinked: ${stillUnlinked[0].count}`);

  // Show sample leads with their qualified_business scores
  console.log(`\n\nSAMPLE LINKED LEADS:\n`);

  const sampleLinked = await sql`
    SELECT 
      l.business_name,
      l.id,
      qb.opportunity_score,
      db.business_name as source_business,
      qb.confidence
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    LEFT JOIN discovered_businesses db ON qb.discovered_business_id = db.id
    WHERE l.source != 'qa_system_test' AND l.qualified_business_id IS NOT NULL
    LIMIT 5
  `;

  for (const lead of sampleLinked) {
    console.log(`${lead.business_name}`);
    console.log(`  Opportunity Score: ${lead.opportunity_score}`);
    console.log(`  Source: ${lead.source_business}`);
    console.log(`  Confidence: ${lead.confidence}\n`);
  }

  console.log(`\n✅ PHASE A REPAIR COMPLETE`);
}

repairOpportunityScoreLinkage().catch(err => {
  console.error("REPAIR ERROR:", err.message);
  process.exit(1);
});
