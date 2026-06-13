import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function selectSignalChainTestLeads() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   PHASE B: SELECT 5 REAL PRODUCTION LEADS FOR VALIDATION  ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Select 5 leads with good data (email, diverse categories)
  // Pick one from each major category
  const categories = ['dental-practices', 'event-organisers', 'estate-agents', 'legal', 'pharmacies'];
  const selectedLeads = [];

  for (const category of categories) {
    const lead = await sql`
      SELECT 
        l.id,
        l.business_name,
        l.business_category,
        l.email,
        l.phone,
        l.postcode,
        qb.opportunity_score
      FROM b2b_leads l
      LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
      WHERE l.source != 'qa_system_test' 
        AND l.email IS NOT NULL
        AND l.business_category = ${category}
      LIMIT 1
    `;

    if (lead.length > 0) {
      selectedLeads.push(lead[0]);
    }
  }

  console.log(`Selected ${selectedLeads.length} leads for signal chain validation:\n`);

  for (let i = 0; i < selectedLeads.length; i++) {
    const lead = selectedLeads[i];
    const score = parseFloat(lead.opportunity_score) || 0;
    console.log(`${i + 1}. ${lead.business_name}`);
    console.log(`   ID: ${lead.id}`);
    console.log(`   Category: ${lead.business_category}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Phone: ${lead.phone || 'N/A'}`);
    console.log(`   Opportunity Score: ${score.toFixed(1)}`);
    console.log();
  }

  // Document the selection
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("NEXT STEPS:\n");
  console.log("1. Send recognition emails to these 5 leads");
  console.log("2. Verify each stage of the signal chain:");
  console.log("   • Email sent");
  console.log("   • Message ID stored");
  console.log("   • Webhook received");
  console.log("   • Event recorded");
  console.log("   • Engagement score updated");
  console.log("   • Heat score updated");
  console.log("   • Dashboard reflects changes\n");
  console.log("✅ PHASE B: Lead selection complete\n");
}

selectSignalChainTestLeads().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
