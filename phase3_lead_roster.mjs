import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get leads marked for Phase 3 (all A/B tier)
const leads = await sql`
  SELECT 
    id, business_name, contact_email, 
    lead_tier, opportunity_score, heat_score,
    created_at
  FROM b2b_leads
  WHERE (lead_tier IS NULL OR lead_tier IN ('A', 'B'))
  AND contact_email IS NOT NULL
  AND contact_email != ''
  ORDER BY lead_tier DESC, opportunity_score DESC
`;

// Count by tier
const tierCounts = await sql`
  SELECT lead_tier, COUNT(*) as count
  FROM b2b_leads
  WHERE (lead_tier IS NULL OR lead_tier IN ('A', 'B'))
  AND contact_email IS NOT NULL
  GROUP BY lead_tier
  ORDER BY lead_tier
`;

console.log("=== PHASE 3 LEAD ROSTER ===\n");
console.log(`Total leads ready for outreach: ${leads.length}`);
console.log(`\nBreakdown by tier:`);

tierCounts.forEach(row => {
  const tier = row.lead_tier || 'UNTIERED';
  console.log(`  ${tier}: ${row.count}`);
});

console.log(`\n\nTop 10 Leads (by opportunity score):`);
console.log('');

leads.slice(0, 10).forEach((lead, i) => {
  console.log(`${i + 1}. ${lead.business_name}`);
  console.log(`   Email: ${lead.contact_email}`);
  console.log(`   Tier: ${lead.lead_tier || 'UNTIERED'}`);
  console.log(`   Opportunity: ${lead.opportunity_score || 'N/A'}`);
  console.log('');
});

console.log(`\n=== PHASE 3 STATUS ===`);
console.log(`Leads ready: ${leads.length}`);
console.log(`Target: 44`);
console.log(`Status: ${leads.length >= 44 ? '✅ READY' : '⚠️  BELOW TARGET'}`);

// Store roster for Phase 3
await sql`
  CREATE TABLE IF NOT EXISTS phase3_outreach_roster (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL,
    business_name TEXT,
    contact_email TEXT,
    lead_tier TEXT,
    opportunity_score NUMERIC,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

// Check if already populated
const existingCount = await sql`SELECT COUNT(*) as count FROM phase3_outreach_roster`;
console.log(`\nExisting Phase 3 roster entries: ${existingCount[0].count}`);
