import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== LEAD QUALIFICATION ENGINE ===\n");

// Get all Phase 3 leads with their engagement data
const qualifications = await sql`
  SELECT 
    pc.lead_id,
    pc.business_name,
    pc.email,
    COUNT(CASE WHEN bee.event_type = 'opened' THEN 1 END) as opens,
    COUNT(CASE WHEN bee.event_type = 'clicked' THEN 1 END) as clicks,
    CASE 
      WHEN COUNT(CASE WHEN bee.event_type = 'clicked' THEN 1 END) > 0 
        AND COUNT(CASE WHEN bee.event_type = 'opened' THEN 1 END) > 0
      THEN 'A'
      WHEN COUNT(CASE WHEN bee.event_type = 'opened' THEN 1 END) > 0 
        OR COUNT(CASE WHEN bee.event_type = 'clicked' THEN 1 END) > 0
      THEN 'B'
      ELSE 'C'
    END as tier,
    CASE 
      WHEN COUNT(CASE WHEN bee.event_type = 'clicked' THEN 1 END) > 0 
        AND COUNT(CASE WHEN bee.event_type = 'opened' THEN 1 END) > 0
      THEN 'Opened AND clicked'
      WHEN COUNT(CASE WHEN bee.event_type = 'clicked' THEN 1 END) > 0
      THEN 'Clicked only'
      WHEN COUNT(CASE WHEN bee.event_type = 'opened' THEN 1 END) > 0
      THEN 'Opened only'
      ELSE 'No engagement'
    END as qualification_reason
  FROM phase3_campaign pc
  LEFT JOIN b2b_email_events bee ON pc.lead_id = bee.lead_id
  WHERE pc.status = 'sent'
  GROUP BY pc.lead_id, pc.business_name, pc.email
  ORDER BY tier ASC, opens DESC, clicks DESC
`;

console.log("TIER QUALIFICATION RESULTS\n");

// Count by tier
const tierA = qualifications.filter(q => q.tier === 'A');
const tierB = qualifications.filter(q => q.tier === 'B');
const tierC = qualifications.filter(q => q.tier === 'C');

console.log(`SUMMARY:`);
console.log(`  Tier A (Hot):        ${tierA.length} leads`);
console.log(`  Tier B (Warm):       ${tierB.length} leads`);
console.log(`  Tier C (Cold):       ${tierC.length} leads`);
console.log(`  Total qualified:     ${qualifications.length} leads\n`);

// Tier A details
if (tierA.length > 0) {
  console.log(`\nTIER A — HOT LEADS (Opened + Clicked)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  tierA.slice(0, 10).forEach((lead, i) => {
    console.log(`\n${i + 1}. ${lead.business_name}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Engagement: ${lead.opens} opens, ${lead.clicks} clicks`);
    console.log(`   Reason: ${lead.qualification_reason}`);
  });
  if (tierA.length > 10) {
    console.log(`\n... and ${tierA.length - 10} more Tier A leads`);
  }
}

// Tier B details
if (tierB.length > 0) {
  console.log(`\n\nTIER B — WARM LEADS (Opened OR Clicked)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  tierB.slice(0, 10).forEach((lead, i) => {
    console.log(`\n${i + 1}. ${lead.business_name}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Engagement: ${lead.opens} opens, ${lead.clicks} clicks`);
    console.log(`   Reason: ${lead.qualification_reason}`);
  });
  if (tierB.length > 10) {
    console.log(`\n... and ${tierB.length - 10} more Tier B leads`);
  }
}

// Tier C summary
console.log(`\n\nTIER C — COLD LEADS (No Engagement)`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`${tierC.length} leads with no opens or clicks`);

// Save qualifications to database
console.log(`\n\n=== WRITING QUALIFICATIONS TO DATABASE ===`);

let updated = 0;
for (const qual of qualifications) {
  try {
    await sql`
      UPDATE b2b_leads
      SET lead_tier = ${qual.tier}
      WHERE id = ${qual.lead_id}
    `;
    updated++;
  } catch (e) {
    console.error(`Failed to update ${qual.lead_id}: ${e.message}`);
  }
}

console.log(`Updated ${updated} lead tier assignments`);

console.log(`\n\n=== LEAD QUALIFICATION STATUS ===`);
console.log(`✅ PASS - Lead qualification complete`);
console.log(`   Tier A: ${tierA.length}`);
console.log(`   Tier B: ${tierB.length}`);
console.log(`   Tier C: ${tierC.length}`);
