import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function testCommandCenter() {
  console.log("Testing Command Center Data\n");

  // Test: Get hottest prospects
  console.log("HOTTEST PROSPECTS:\n");
  const hottest = await sql`
    SELECT 
      l.id,
      l.business_name,
      l.engagement_score,
      qb.opportunity_score
    FROM b2b_leads l
    LEFT JOIN qualified_businesses qb ON l.qualified_business_id = qb.id
    WHERE l.source != 'qa_system_test'
    ORDER BY CAST(l.engagement_score AS INT) DESC,
             CAST(qb.opportunity_score AS FLOAT) DESC
    LIMIT 10
  `;

  for (const lead of hottest) {
    const eng = lead.engagement_score || 0;
    const opp = parseFloat(lead.opportunity_score) || 0;
    const heat = (eng * 0.4 + opp * 0.4).toFixed(1);
    console.log(`${lead.business_name}: heat ${heat}, eng ${eng}, opp ${opp.toFixed(1)}`);
  }

  // Test: Pending follow-ups
  console.log("\n\nPENDING FOLLOW-UPS BY PATTERN:\n");
  const pending = await sql`
    SELECT 
      l.business_name,
      COUNT(e.id) as event_count,
      MAX(CASE WHEN e.event_type = 'opened' THEN 1 ELSE 0 END) as has_opened,
      MAX(CASE WHEN e.event_type = 'clicked' THEN 1 ELSE 0 END) as has_clicked
    FROM b2b_leads l
    LEFT JOIN b2b_email_events e ON l.id = e.lead_id
    WHERE l.source != 'qa_system_test'
      AND l.engagement_score > 0
    GROUP BY l.id, l.business_name
    LIMIT 5
  `;

  if (pending.length === 0) {
    console.log("(No engagement events yet - awaiting real outreach)");
  } else {
    for (const lead of pending) {
      console.log(`${lead.business_name}: ${lead.event_count} events`);
    }
  }

  // Test: Category performance
  console.log("\n\nCATEGORY PERFORMANCE:\n");
  const categories = await sql`
    SELECT 
      l.business_category,
      COUNT(DISTINCT l.id) as leads,
      COUNT(DISTINCT o.id) as outreach,
      COUNT(DISTINCT e.id) as events
    FROM b2b_leads l
    LEFT JOIN b2b_outreach o ON l.id = o.lead_id
    LEFT JOIN b2b_email_events e ON l.id = e.lead_id
    WHERE l.source != 'qa_system_test'
    GROUP BY l.business_category
    ORDER BY leads DESC
  `;

  for (const cat of categories) {
    console.log(`${cat.business_category}: ${cat.leads} leads, ${cat.outreach} outreach, ${cat.events} events`);
  }

  // Test: Revenue attribution readiness
  console.log("\n\nREVENUE ATTRIBUTION READINESS:\n");
  const revenue = await sql`
    SELECT 
      COUNT(DISTINCT l.id) as leads_with_linkage,
      COUNT(DISTINCT so.id) as standing_orders,
      SUM(so.price) as total_revenue
    FROM b2b_leads l
    LEFT JOIN b2b_standing_orders so ON l.id = so.lead_id
    WHERE l.source != 'qa_system_test'
  `;

  console.log(`Leads: ${revenue[0].leads_with_linkage}`);
  console.log(`Standing Orders: ${revenue[0].standing_orders}`);
  console.log(`Revenue Attributed: £${revenue[0].total_revenue || 0}`);

  console.log("\n✅ Command Center data ready for dashboard display");
}

testCommandCenter().catch(err => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
