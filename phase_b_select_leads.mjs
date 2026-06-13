import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function selectSignalChainTestLeads() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   PHASE B: SELECT 5 REAL PRODUCTION LEADS FOR VALIDATION  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Select 5 leads with good data (email, diverse categories)
  const selectedLeads = await sql`
    SELECT 
      l.id,
      l.business_name,
      l.business_category,
      l.email,
      l.phone,
      l.postcode,
      qb.opportunity_score,
      qb.confidence
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE l.source != 'qa_system_test' 
      AND l.email IS NOT NULL
      AND l.business_category != 'test'
    GROUP BY l.business_category
    ORDER BY l.business_category
    LIMIT 5
  `;

  console.log(`Selected ${selectedLeads.length} leads for signal chain validation:\n`);

  for (let i = 0; i < selectedLeads.length; i++) {
    const lead = selectedLeads[i];
    console.log(`${i + 1}. ${lead.business_name}`);
    console.log(`   ID: ${lead.id}`);
    console.log(`   Category: ${lead.business_category}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Opportunity Score: ${lead.opportunity_score}`);
    console.log();
  }

  // Save to a file for reference
  const selectedIds = selectedLeads.map(l => l.id);
  console.log(`Selected IDs:\n`);
  for (const id of selectedIds) {
    console.log(`  ${id}`);
  }

  console.log(`\n✅ PHASE B: Leads selected. Ready for email outreach validation.\n`);
}

selectSignalChainTestLeads().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
