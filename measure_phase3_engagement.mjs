import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== PHASE 3 ENGAGEMENT METRICS ===\n");

// Get Phase 3 campaign baseline
const campaign = await sql`
  SELECT 
    COUNT(*) as total_sent,
    COUNT(DISTINCT lead_id) as unique_leads,
    COUNT(DISTINCT resend_email_id) as unique_emails
  FROM phase3_campaign
  WHERE status = 'sent'
`;

console.log("PHASE 3 CAMPAIGN STATUS:");
console.log(`Emails sent: ${campaign[0].total_sent}`);
console.log(`Unique leads: ${campaign[0].unique_leads}`);
console.log(`\nWaiting for engagement data from Resend webhooks...`);

// Check for email events
const emailEvents = await sql`
  SELECT 
    event_type, 
    COUNT(*) as count,
    MAX(created_at) as latest
  FROM b2b_email_events
  WHERE created_at > NOW() - INTERVAL '2 hours'
  GROUP BY event_type
  ORDER BY count DESC
`;

console.log(`\n\nRECENT EMAIL EVENTS (last 2 hours):`);
if (emailEvents.length > 0) {
  emailEvents.forEach(evt => {
    console.log(`${evt.event_type}: ${evt.count}`);
  });
} else {
  console.log(`No events captured yet. Webhooks may be delayed.`);
}

// Check for open events
const opens = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type = 'open'
  AND created_at > NOW() - INTERVAL '24 hours'
`;

// Check for click events
const clicks = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type = 'click'
  AND created_at > NOW() - INTERVAL '24 hours'
`;

// Check for reply/bounce events
const replies = await sql`
  SELECT COUNT(*) as count FROM b2b_email_events
  WHERE event_type IN ('reply', 'bounce', 'complaint')
  AND created_at > NOW() - INTERVAL '24 hours'
`;

console.log(`\n\nPHASE 3 ENGAGEMENT METRICS (24h window):`);
console.log(`Opens: ${opens[0].count}`);
console.log(`Clicks: ${clicks[0].count}`);
console.log(`Interactions: ${replies[0].count}`);

// Calculate rates
const totalSent = campaign[0].total_sent;
const openRate = totalSent > 0 ? ((opens[0].count / totalSent) * 100).toFixed(1) : 0;
const clickRate = totalSent > 0 ? ((clicks[0].count / totalSent) * 100).toFixed(1) : 0;

console.log(`\nESTIMATED RATES:`);
console.log(`Open rate: ${openRate}%`);
console.log(`Click rate: ${clickRate}%`);

// Get lead engagement scores updated
const engagedLeads = await sql`
  SELECT COUNT(DISTINCT lead_id) as count
  FROM phase3_campaign pc
  WHERE EXISTS (
    SELECT 1 FROM b2b_email_events bee
    WHERE bee.event_type IN ('open', 'click')
    AND bee.lead_id = pc.lead_id
  )
`;

console.log(`\nLeads with engagement: ${engagedLeads[0].count}/${campaign[0].unique_leads}`);

// Check for qualified opportunities (lead tier upgrades)
const tierA = await sql`
  SELECT COUNT(*) as count FROM b2b_leads
  WHERE lead_tier = 'A'
  AND updated_at > NOW() - INTERVAL '24 hours'
`;

const tierB = await sql`
  SELECT COUNT(*) as count FROM b2b_leads
  WHERE lead_tier = 'B'
  AND updated_at > NOW() - INTERVAL '24 hours'
`;

console.log(`\n\nQUALIFIED OPPORTUNITIES:`);
console.log(`Tier A (Hot): ${tierA[0].count}`);
console.log(`Tier B (Warm): ${tierB[0].count}`);
console.log(`Total qualified: ${tierA[0].count + tierB[0].count}`);

console.log(`\n\n=== NEXT ACTIONS ===`);
console.log(`1. Campaign live and tracking engagement`);
console.log(`2. Monitoring opens and clicks via Resend webhooks`);
console.log(`3. Heat scores updating in real-time`);
console.log(`4. Leads qualifying to Tier A/B as engagement increases`);
console.log(`5. Next review: 24h from send time`);
