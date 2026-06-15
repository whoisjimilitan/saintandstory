import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(databaseUrl);

async function audit() {
  try {
    console.log("=== B2B LEADS DATA AUDIT ===\n");
    
    // 1. Total lead count
    const countResult = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    const totalLeads = countResult[0].count;
    console.log(`Total b2b_leads: ${totalLeads}\n`);
    
    if (totalLeads === 0) {
      console.log("❌ NO LEADS IN DATABASE\n");
      process.exit(0);
    }
    
    // 2. Leads by status
    console.log("=== LEADS BY STATUS ===\n");
    const byStatus = await sql`
      SELECT status, COUNT(*) as count
      FROM b2b_leads
      GROUP BY status
      ORDER BY count DESC
    `;
    
    byStatus.forEach(s => {
      console.log(`${s.status}: ${s.count}`);
    });
    
    // 3. Leads by source
    console.log("\n=== LEADS BY SOURCE ===\n");
    const bySource = await sql`
      SELECT source, COUNT(*) as count
      FROM b2b_leads
      GROUP BY source
      ORDER BY count DESC
    `;
    
    bySource.forEach(s => {
      console.log(`${s.source}: ${s.count}`);
    });
    
    // 4. Leads by tier
    console.log("\n=== LEADS BY TIER ===\n");
    const byTier = await sql`
      SELECT lead_tier, COUNT(*) as count
      FROM b2b_leads
      GROUP BY lead_tier
      ORDER BY count DESC NULLS LAST
    `;
    
    byTier.forEach(t => {
      const tier = t.lead_tier || 'NULL';
      console.log(`${tier}: ${t.count}`);
    });
    
    // 5. Engagement score distribution
    console.log("\n=== ENGAGEMENT SCORE DISTRIBUTION ===\n");
    const engagement = await sql`
      SELECT 
        CASE 
          WHEN engagement_score IS NULL THEN 'NULL'
          WHEN engagement_score >= 80 THEN '80-100'
          WHEN engagement_score >= 60 THEN '60-79'
          WHEN engagement_score >= 40 THEN '40-59'
          WHEN engagement_score >= 20 THEN '20-39'
          ELSE '0-19'
        END as score_range,
        COUNT(*) as count,
        MIN(engagement_score) as min_score,
        MAX(engagement_score) as max_score,
        ROUND(AVG(engagement_score)::numeric, 2) as avg_score
      FROM b2b_leads
      GROUP BY score_range
      ORDER BY 
        CASE score_range
          WHEN '80-100' THEN 1
          WHEN '60-79' THEN 2
          WHEN '40-59' THEN 3
          WHEN '20-39' THEN 4
          WHEN '0-19' THEN 5
          ELSE 6
        END
    `;
    
    engagement.forEach(e => {
      console.log(`${e.score_range}: ${e.count} (min=${e.min_score}, max=${e.max_score}, avg=${e.avg_score})`);
    });
    
    // 6. Email sent tracking
    console.log("\n=== EMAIL SENT TRACKING ===\n");
    const emailSent = await sql`
      SELECT 
        email_sent_at IS NOT NULL as has_email_sent,
        COUNT(*) as count
      FROM b2b_leads
      GROUP BY has_email_sent
    `;
    
    emailSent.forEach(e => {
      console.log(`Emails sent: ${e.has_email_sent}: ${e.count}`);
    });
    
    // 7. Sample records
    console.log("\n=== SAMPLE RECORDS (Latest 5) ===\n");
    const samples = await sql`
      SELECT 
        id, business_name, business_category, email, status, source, 
        engagement_score, lead_tier, created_at
      FROM b2b_leads
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    samples.forEach((s, idx) => {
      console.log(`Record ${idx + 1}:`);
      console.log(`  business_name: ${s.business_name}`);
      console.log(`  category: ${s.business_category}`);
      console.log(`  email: ${s.email}`);
      console.log(`  status: ${s.status}`);
      console.log(`  source: ${s.source}`);
      console.log(`  engagement_score: ${s.engagement_score}`);
      console.log(`  lead_tier: ${s.lead_tier}`);
      console.log(`  created_at: ${s.created_at}`);
      console.log();
    });
    
    // 8. Outreach activity
    console.log("\n=== OUTREACH ACTIVITY ===\n");
    const outreachCount = await sql`SELECT COUNT(*) as count FROM b2b_outreach`;
    console.log(`Total b2b_outreach records: ${outreachCount[0].count}`);
    
    const outreachEventCount = await sql`SELECT COUNT(*) as count FROM b2b_outreach_events`;
    console.log(`Total b2b_outreach_events: ${outreachEventCount[0].count}`);
    
    // 9. Standing orders
    console.log("\n=== STANDING ORDERS ===\n");
    const soCount = await sql`SELECT COUNT(*) as count FROM b2b_standing_orders`;
    console.log(`Total b2b_standing_orders: ${soCount[0].count}`);
    
    const soActive = await sql`SELECT COUNT(*) as count FROM b2b_standing_orders WHERE active = true`;
    console.log(`Active standing orders: ${soActive[0].count}`);
    
  } catch (error) {
    console.error("❌ DATABASE ERROR:", error.message);
    process.exit(1);
  }
}

audit();
