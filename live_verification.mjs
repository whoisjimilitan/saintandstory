import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function verify() {
  console.log("=== LIVE INTELLIGENCE CHAIN VERIFICATION ===\n");

  // 1. Check if at least one lead has non-zero opportunity score
  console.log("1. OPPORTUNITY SCORE - CHECKING FOR REAL VALUES\n");
  
  const oppScores = await sql`
    SELECT 
      bl.id,
      bl.business_name,
      qb.opportunity_score,
      bl.business_category
    FROM b2b_leads bl
    LEFT JOIN qualified_businesses qb ON bl.qualified_business_id = qb.id
    WHERE bl.status NOT IN ('dead')
    ORDER BY qb.opportunity_score DESC NULLS LAST
    LIMIT 5
  `;

  console.log(`Total leads with opportunity data: ${oppScores.filter(l => l.opportunity_score).length}`);
  
  if (oppScores.length > 0) {
    console.log("\nTop 5 by opportunity score:");
    oppScores.forEach((lead, i) => {
      console.log(`  ${i + 1}. ${lead.business_name}`);
      console.log(`     Category: ${lead.business_category}`);
      console.log(`     Opportunity Score: ${lead.opportunity_score || 'NULL'}`);
    });
  }

  // 2. Check heat score calculation from actual data
  console.log("\n2. HEAT SCORE CALCULATION - CHECKING REAL VALUES\n");

  const heatScores = await sql`
    SELECT DISTINCT ON (lead_id) 
      lead_id,
      heat_score,
      engagement_score,
      qualification_score,
      intent_score,
      recorded_at
    FROM b2b_heat_score_history
    ORDER BY lead_id, recorded_at DESC
    LIMIT 5
  `;

  console.log(`Heat score snapshots found: ${heatScores.length}`);
  
  if (heatScores.length > 0) {
    console.log("\nSample heat scores:");
    heatScores.forEach((hs, i) => {
      console.log(`  ${i + 1}. Heat Score: ${hs.heat_score} (Qual: ${hs.qualification_score}, Eng: ${hs.engagement_score}, Intent: ${hs.intent_score})`);
    });
  }

  // 3. Check if leads have engagement data
  console.log("\n3. ENGAGEMENT DATA - CHECKING FOR REAL VALUES\n");

  const engagement = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN engagement_score > 0 THEN 1 END) as with_engagement,
      MAX(engagement_score) as max_score,
      AVG(engagement_score)::NUMERIC(5,2) as avg_score,
      COUNT(DISTINCT id) as leads_tracked
    FROM b2b_leads
    WHERE status NOT IN ('dead')
  `;

  console.log(`Total active leads: ${engagement[0].total}`);
  console.log(`Leads with engagement data: ${engagement[0].with_engagement}`);
  console.log(`Max engagement score: ${engagement[0].max_score}`);
  console.log(`Avg engagement score: ${engagement[0].avg_score}`);

  // 4. Check email events
  console.log("\n4. EMAIL ENGAGEMENT EVENTS\n");

  const emailEvents = await sql`
    SELECT
      event_type,
      COUNT(*) as count,
      MAX(timestamp) as latest
    FROM b2b_email_events
    GROUP BY event_type
    ORDER BY count DESC
  `;

  if (emailEvents.length > 0) {
    console.log("Email events recorded:");
    emailEvents.forEach(evt => {
      console.log(`  ${evt.event_type}: ${evt.count} (latest: ${new Date(evt.latest).toLocaleString()})`);
    });
  } else {
    console.log("No email events recorded yet (awaiting Resend webhooks)");
  }

  // 5. Check outreach activity
  console.log("\n5. OUTREACH ACTIVITY - DISCOVERY → QUALIFICATION → LEAD → OUTREACH\n");

  const discovery = await sql`
    SELECT COUNT(*) as count FROM discovered_businesses
  `;

  const qualified = await sql`
    SELECT COUNT(*) as count FROM qualified_businesses
  `;

  const leads = await sql`
    SELECT COUNT(*) as count FROM b2b_leads WHERE status NOT IN ('dead')
  `;

  const outreach = await sql`
    SELECT
      COUNT(*) as total_emails,
      COUNT(CASE WHEN sent_at IS NOT NULL THEN 1 END) as sent,
      COUNT(CASE WHEN replied = true THEN 1 END) as replied,
      MAX(sent_at) as latest_sent
    FROM b2b_outreach
  `;

  console.log(`Discovered: ${discovery[0].count}`);
  console.log(`Qualified: ${qualified[0].count}`);
  console.log(`Leads created: ${leads[0].count}`);
  console.log(`Outreach emails: ${outreach[0].total_emails} (sent: ${outreach[0].sent}, replied: ${outreach[0].replied})`);
  if (outreach[0].latest_sent) {
    console.log(`Latest email sent: ${new Date(outreach[0].latest_sent).toLocaleString()}`);
  }

  // 6. Check standing orders (conversions)
  console.log("\n6. CONVERSIONS - STANDING ORDERS CREATED\n");

  const standingOrders = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN active = true THEN 1 END) as active,
      SUM(price)::NUMERIC(10,2) as total_revenue,
      MAX(created_at) as latest
    FROM b2b_standing_orders
  `;

  console.log(`Standing orders: ${standingOrders[0].total} (active: ${standingOrders[0].active})`);
  console.log(`Total revenue: £${standingOrders[0].total_revenue || 0}`);
  if (standingOrders[0].latest) {
    console.log(`Latest: ${new Date(standingOrders[0].latest).toLocaleString()}`);
  }

  // 7. Check category data
  console.log("\n7. CATEGORY DISTRIBUTION\n");

  const categories = await sql`
    SELECT
      business_category,
      COUNT(*) as lead_count,
      COUNT(CASE WHEN engagement_score > 0 THEN 1 END) as engaged
    FROM b2b_leads
    WHERE status NOT IN ('dead')
    GROUP BY business_category
    ORDER BY lead_count DESC
    LIMIT 5
  `;

  console.log("Top 5 categories:");
  categories.forEach((cat, i) => {
    console.log(`  ${i + 1}. ${cat.business_category}: ${cat.lead_count} leads (${cat.engaged} engaged)`);
  });

  // 8. Check mission data
  console.log("\n8. DISCOVERY MISSIONS\n");

  const missions = await sql`
    SELECT
      id,
      name,
      mission_type,
      status,
      discoveries_found,
      businesses_qualified,
      leads_created,
      created_at
    FROM research_missions
    WHERE status = 'completed'
    ORDER BY created_at DESC
    LIMIT 3
  `;

  if (missions.length > 0) {
    console.log("Recent completed missions:");
    missions.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name}`);
      console.log(`     Type: ${m.mission_type}`);
      console.log(`     Discovered: ${m.discoveries_found}, Qualified: ${m.businesses_qualified}, Leads: ${m.leads_created}`);
    });
  } else {
    console.log("No completed missions yet");
  }

  // 9. Check lead recency
  console.log("\n9. LEAD RECENCY - IS SYSTEM LIVE?\n");

  const recency = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as last_7_days,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24_hours,
      MAX(created_at) as newest
    FROM b2b_leads
    WHERE status NOT IN ('dead')
  `;

  console.log(`Total leads: ${recency[0].total}`);
  console.log(`Created in last 24h: ${recency[0].last_24_hours}`);
  console.log(`Created in last 7d: ${recency[0].last_7_days}`);
  console.log(`Newest lead: ${new Date(recency[0].newest).toLocaleString()}`);

  // 10. Check last activity across system
  console.log("\n10. SYSTEM ACTIVITY TIMELINE\n");

  const timeline = await sql`
    SELECT 
      'Discovered' as activity,
      MAX(discovered_at) as latest
    FROM discovered_businesses
    UNION ALL
    SELECT 
      'Qualified',
      MAX(qualified_at)
    FROM qualified_businesses
    UNION ALL
    SELECT 
      'Lead Created',
      MAX(created_at)
    FROM b2b_leads
    UNION ALL
    SELECT 
      'Email Sent',
      MAX(sent_at)
    FROM b2b_outreach
    UNION ALL
    SELECT 
      'Engagement Event',
      MAX(timestamp)
    FROM b2b_email_events
  `;

  console.log("Latest activity by type:");
  timeline.forEach(t => {
    if (t.latest) {
      console.log(`  ${t.activity}: ${new Date(t.latest).toLocaleString()}`);
    } else {
      console.log(`  ${t.activity}: No data`);
    }
  });

  console.log("\n=== ANALYSIS COMPLETE ===\n");
}

verify().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
