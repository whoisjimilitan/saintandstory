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

  const leadsWithoutOpportunity = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND opportunity_score IS NULL
  `;

  const leadsWithOpportunity = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND opportunity_score IS NOT NULL
  `;

  console.log(`Total production leads: ${leadsCount[0].count}`);
  console.log(`Leads with opportunity_score: ${leadsWithOpportunity[0].count}`);
  console.log(`Leads WITHOUT opportunity_score: ${leadsWithoutOpportunity[0].count}`);
  console.log(`Status: ${leadsWithoutOpportunity[0].count > 0 ? '❌ BROKEN' : '✓ OK'}\n`);

  // 2. Sample leads to understand structure
  console.log("STAGE 2: Sample Lead Data\n");

  const sampleLeads = await sql`
    SELECT 
      id,
      business_name,
      qualified_business_id,
      opportunity_score,
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
    console.log(`  opportunity_score: ${lead.opportunity_score || 'NULL'}`);
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
      created_at
    FROM qualified_businesses
    LIMIT 3
  `;

  console.log("Sample qualified_businesses:\n");
  for (const qb of sampleQualified) {
    console.log(`${qb.business_name}: score=${qb.opportunity_score}`);
  }

  // 4. Check for any relationship between leads and qualified_businesses
  console.log("\n\nSTAGE 4: Relationship Analysis\n");

  const leadsWithQualifiedRef = await sql`
    SELECT COUNT(*) as count FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NOT NULL
  `;

  console.log(`Leads with qualified_business_id set: ${leadsWithQualifiedRef[0].count}`);

  if (leadsWithQualifiedRef[0].count > 0) {
    console.log("\nLeads that ARE linked:\n");
    const linkedLeads = await sql`
      SELECT 
        l.business_name,
        l.qualified_business_id,
        qb.business_name as qualified_name,
        qb.opportunity_score
      FROM b2b_leads l
      LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
      WHERE l.source != 'qa_system_test' AND l.qualified_business_id IS NOT NULL
      LIMIT 5
    `;

    for (const link of linkedLeads) {
      console.log(`Lead: ${link.business_name}`);
      console.log(`  → Qualified: ${link.qualified_name}`);
      console.log(`  → Opportunity Score: ${link.opportunity_score || 'NULL'}\n`);
    }
  } else {
    console.log("No leads have qualified_business_id set.\n");
  }

  // 5. Check for potential match by business name
  console.log("STAGE 5: Potential Matching Strategy\n");

  const unlinkedLeads = await sql`
    SELECT id, business_name FROM b2b_leads 
    WHERE source != 'qa_system_test' AND qualified_business_id IS NULL
    LIMIT 5
  `;

  console.log(`Sample unlinked leads:\n`);

  for (const lead of unlinkedLeads) {
    const potentialMatches = await sql`
      SELECT id, business_name, opportunity_score FROM qualified_businesses 
      WHERE business_name ILIKE ${lead.business_name}
      LIMIT 3
    `;

    console.log(`Lead: "${lead.business_name}"`);
    if (potentialMatches.length > 0) {
      console.log(`  Potential matches in qualified_businesses:`);
      for (const match of potentialMatches) {
        console.log(`    ✓ "${match.business_name}" (score: ${match.opportunity_score})`);
      }
    } else {
      console.log(`  No exact matches found in qualified_businesses`);
    }
    console.log();
  }

  // 6. Investigate how leads were created
  console.log("STAGE 6: Lead Creation History\n");

  const leadCreationProcess = await sql`
    SELECT 
      COUNT(*) as count,
      source,
      MIN(created_at) as oldest,
      MAX(created_at) as newest
    FROM b2b_leads
    WHERE source != 'qa_system_test'
    GROUP BY source
  `;

  console.log("Leads by source:\n");
  for (const row of leadCreationProcess) {
    console.log(`Source: ${row.source}`);
    console.log(`  Count: ${row.count}`);
    console.log(`  Created: ${row.oldest} to ${row.newest}\n`);
  }

  // 7. Summary and recommendations
  console.log("STAGE 7: Root Cause Analysis\n");

  const totalProduction = leadsCount[0].count;
  const totalMissing = leadsWithoutOpportunity[0].count;
  const percentageMissing = ((totalMissing / totalProduction) * 100).toFixed(0);

  console.log(`FINDING: ${percentageMissing}% of production leads (${totalMissing}/${totalProduction}) are missing opportunity_score\n`);

  if (totalMissing === totalProduction) {
    console.log("ROOT CAUSE: Leads were created without linking to qualified_businesses.\n");
    console.log("REPAIR STRATEGY:");
    console.log("  Option A: Match by business_name (if names are consistent)");
    console.log("  Option B: Match by category + location + pain_point (if available)");
    console.log("  Option C: Manual mapping if data is inconsistent\n");
  }

  // 8. Check if we can reconstruct relationships
  console.log("STAGE 8: Reconstruction Feasibility\n");

  const matchAttempt = await sql`
    SELECT 
      l.id as lead_id,
      l.business_name as lead_name,
      qb.id as qb_id,
      qb.business_name as qb_name,
      qb.opportunity_score
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON LOWER(l.business_name) = LOWER(qb.business_name)
    WHERE l.source != 'qa_system_test' AND l.qualified_business_id IS NULL
    ORDER BY l.created_at DESC
    LIMIT 10
  `;

  const matchableLeads = matchAttempt.filter(m => m.qb_id !== null).length;
  const unmatchableLeads = matchAttempt.length - matchableLeads;

  console.log(`Sample of 10 unlinked leads:`);
  console.log(`  Could be matched by name: ${matchableLeads}`);
  console.log(`  Cannot be matched by name: ${unmatchableLeads}\n`);

  if (matchableLeads > 0) {
    console.log(`Example matches:\n`);
    for (const match of matchAttempt.filter(m => m.qb_id !== null).slice(0, 3)) {
      console.log(`  "${match.lead_name}" → "${match.qb_name}" (score: ${match.opportunity_score})`);
    }
    console.log();
  }

  // Final assessment
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("PHASE A ASSESSMENT\n");

  if (leadsWithoutOpportunity[0].count > 0) {
    console.log("❌ BROKEN: Opportunity score linkage is missing.\n");
    console.log("IMPACT:");
    console.log("  • Heat scores show 0/100 even with engagement");
    console.log("  • Qualification component is always 0");
    console.log("  • Cannot rank prospects by business fit\n");
    console.log("RECOMMENDATION:");
    console.log(`  1. Match ${totalMissing} unlinked leads to qualified_businesses`);
    console.log("  2. Populate qualified_business_id foreign key");
    console.log("  3. Verify heat score calculation uses new data");
    console.log("  4. Validate heat scores increase from 0\n");
  } else {
    console.log("✓ OK: All leads are linked to qualified_businesses.\n");
  }
}

auditOpportunityScoreLinkage().catch(err => {
  console.error("AUDIT ERROR:", err.message);
  process.exit(1);
});
