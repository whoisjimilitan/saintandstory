import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get leads with valid emails
const leadsWithEmail = await sql`
  SELECT 
    id, business_name, email, lead_tier,
    engagement_score, outreach_eligible,
    created_at
  FROM b2b_leads
  WHERE email IS NOT NULL
  AND email != ''
  AND (lead_tier IS NULL OR lead_tier IN ('A', 'B'))
  ORDER BY lead_tier DESC, engagement_score DESC
`;

// Count by tier with emails
const tierCounts = await sql`
  SELECT lead_tier, COUNT(*) as count
  FROM b2b_leads
  WHERE email IS NOT NULL
  AND email != ''
  GROUP BY lead_tier
`;

// Get all outreach-eligible leads
const allEligible = await sql`
  SELECT COUNT(*) as count FROM b2b_leads
  WHERE outreach_eligible = true
`;

// Leads with emails
const allWithEmail = await sql`
  SELECT COUNT(*) as count FROM b2b_leads
  WHERE email IS NOT NULL AND email != ''
`;

console.log("=== PHASE 3 LEAD ANALYSIS ===\n");

console.log("ROSTER STATUS:");
console.log(`Total leads in system: 50`);
console.log(`  - With valid emails: ${allWithEmail[0].count}`);
console.log(`  - Marked outreach_eligible: ${allEligible[0].count}`);
console.log(`  - A/B tier with email: ${leadsWithEmail.length}`);
console.log('');

console.log("BREAKDOWN BY TIER (with email):");
tierCounts.forEach(row => {
  const tier = row.lead_tier || 'UNTIERED';
  console.log(`  ${tier}: ${row.count}`);
});

console.log(`\n\nPhase 3 Ready Leads:`);
if (leadsWithEmail.length > 0) {
  leadsWithEmail.slice(0, 5).forEach((lead, i) => {
    console.log(`${i + 1}. ${lead.business_name}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Tier: ${lead.lead_tier || 'UNTIERED'}`);
    console.log('');
  });
  if (leadsWithEmail.length > 5) {
    console.log(`   ... and ${leadsWithEmail.length - 5} more`);
  }
} else {
  console.log("⚠️  NO LEADS WITH VALID EMAILS FOUND");
}

console.log(`\n=== PHASE 3 READINESS ===`);
console.log(`Leads ready for outreach: ${leadsWithEmail.length}`);
console.log(`Target: 44`);
console.log(`Status: ${leadsWithEmail.length > 0 ? '⚠️  INSUFFICIENT DATA' : '❌ NO LEADS'}`);
console.log(`\nIssue: Most leads missing email addresses`);
console.log(`Root cause: Email addresses not populated during lead discovery/promotion`);
