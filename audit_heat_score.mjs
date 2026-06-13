import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function auditHeatScore() {
  console.log("=== HEAT SCORE DATA AUDIT ===\n");

  // 1. Count leads with non-zero engagement_score
  console.log("1. ENGAGEMENT TRACKING STATUS");
  const engagementStats = await sql`
    SELECT
      COUNT(*) as total_leads,
      COUNT(CASE WHEN engagement_score > 0 THEN 1 END) as leads_with_engagement,
      COUNT(CASE WHEN engagement_score = 0 THEN 1 END) as leads_no_engagement,
      MIN(engagement_score) as min_engagement,
      MAX(engagement_score) as max_engagement,
      ROUND(AVG(engagement_score)::numeric, 2) as avg_engagement
    FROM b2b_leads
    WHERE status NOT IN ('dead')
  `;
  console.log(JSON.stringify(engagementStats[0], null, 2));

  // 2. Check if engagement is coming from real events
  console.log("\n2. EMAIL ENGAGEMENT EVENTS (Resend webhooks)");
  const emailEvents = await sql`
    SELECT
      COUNT(*) as total_events,
      COUNT(DISTINCT lead_id) as leads_with_events,
      COUNT(DISTINCT event_type) as event_types,
      jsonb_object_agg(event_type, count) as breakdown
    FROM (
      SELECT event_type, COUNT(*) as count
      FROM b2b_email_events
      GROUP BY event_type
    ) subq
  `;
  console.log(JSON.stringify(emailEvents[0], null, 2));

  // 3. Check opportunity_score distribution (qualification component)
  console.log("\n3. OPPORTUNITY SCORE DISTRIBUTION (Business Fit)");
  const oppStats = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN opportunity_score >= 75 THEN 1 END) as high,
      COUNT(CASE WHEN opportunity_score >= 50 AND opportunity_score < 75 THEN 1 END) as medium,
      COUNT(CASE WHEN opportunity_score < 50 THEN 1 END) as low,
      MIN(opportunity_score) as min_score,
      MAX(opportunity_score) as max_score,
      ROUND(AVG(opportunity_score)::numeric, 2) as avg_score
    FROM b2b_leads
    WHERE status NOT IN ('dead')
  `;
  console.log(JSON.stringify(oppStats[0], null, 2));

  // 4. Top 20 prospects by engagement score (proxy for heat)
  console.log("\n4. TOP 20 PROSPECTS (by engagement score - real data)");
  const top20 = await sql`
    SELECT
      id,
      business_name,
      opportunity_score,
      engagement_score,
      status,
      created_at,
      last_engagement_at,
      reply_status
    FROM b2b_leads
    WHERE status NOT IN ('dead')
    ORDER BY engagement_score DESC, opportunity_score DESC
    LIMIT 20
  `;
  
  console.log(`\nFound ${top20.length} leads:\n`);
  top20.forEach((lead, idx) => {
    // Calculate heat score components
    const qualif = Math.min(40, (lead.opportunity_score || 0) * 0.4);
    const engage = Math.min(40, (lead.engagement_score || 0) * 0.4);
    const intent = lead.engagement_score > 0 ? Math.min(20, 5 + (lead.reply_status ? 5 : 0)) : 0;
    const total = qualif + engage + intent;
    const badge = total >= 75 ? '🔥 HOT' : total >= 50 ? '🔥 WARM' : total >= 25 ? '🟡 COOL' : '⚪ COLD';
    
    console.log(`${String(idx+1).padStart(2)}. ${lead.business_name}`);
    console.log(`   ID: ${lead.id}`);
    console.log(`   Qualification: ${qualif.toFixed(1)}/40 (opp: ${lead.opportunity_score})`);
    console.log(`   Engagement: ${engage.toFixed(1)}/40 (score: ${lead.engagement_score})`);
    console.log(`   Intent: ${intent.toFixed(1)}/20 (reply: ${lead.reply_status ? 'YES' : 'NO'})`);
    console.log(`   Total Heat: ${total.toFixed(1)}/100 ${badge}`);
    console.log(`   Last Engagement: ${lead.last_engagement_at ? new Date(lead.last_engagement_at).toLocaleDateString() : 'None'}`);
    console.log();
  });

  // 5. Heat score distribution estimate
  console.log("\n5. HEAT SCORE DISTRIBUTION (calculated from real data)");
  const distribution = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN (opportunity_score * 0.4 + engagement_score * 0.4) >= 75 THEN 1 END) as hot_75_plus,
      COUNT(CASE WHEN (opportunity_score * 0.4 + engagement_score * 0.4) >= 50 AND (opportunity_score * 0.4 + engagement_score * 0.4) < 75 THEN 1 END) as warm_50_74,
      COUNT(CASE WHEN (opportunity_score * 0.4 + engagement_score * 0.4) >= 25 AND (opportunity_score * 0.4 + engagement_score * 0.4) < 50 THEN 1 END) as cool_25_49,
      COUNT(CASE WHEN (opportunity_score * 0.4 + engagement_score * 0.4) < 25 THEN 1 END) as cold_0_24
    FROM b2b_leads
    WHERE status NOT IN ('dead')
  `;
  
  const dist = distribution[0];
  console.log(`Total Leads: ${dist.total}`);
  console.log(`🔥 HOT (75+): ${dist.hot_75_plus} (${((dist.hot_75_plus / dist.total) * 100).toFixed(1)}%)`);
  console.log(`🔥 WARM (50-74): ${dist.warm_50_74} (${((dist.warm_50_74 / dist.total) * 100).toFixed(1)}%)`);
  console.log(`🟡 COOL (25-49): ${dist.cool_25_49} (${((dist.cool_25_49 / dist.total) * 100).toFixed(1)}%)`);
  console.log(`⚪ COLD (0-24): ${dist.cold_0_24} (${((dist.cold_0_24 / dist.total) * 100).toFixed(1)}%)`);

  // 6. Check if heat score history table has real data
  console.log("\n6. HEAT SCORE HISTORY TABLE (daily snapshots)");
  const historyStats = await sql`
    SELECT
      COUNT(*) as total_snapshots,
      COUNT(DISTINCT lead_id) as unique_leads_tracked,
      MIN(recorded_at) as first_snapshot,
      MAX(recorded_at) as latest_snapshot,
      (MAX(recorded_at) - MIN(recorded_at)) as date_range
    FROM b2b_heat_score_history
  `;
  console.log(JSON.stringify(historyStats[0], null, 2));

  // Check if there are actual snapshot variations
  console.log("\n7. HEAT SCORE MOVEMENT (snapshot variance check)");
  const movement = await sql`
    SELECT
      lead_id,
      COUNT(*) as snapshots,
      MAX(heat_score) - MIN(heat_score) as score_variance,
      MAX(heat_score) as highest_score,
      MIN(heat_score) as lowest_score
    FROM b2b_heat_score_history
    WHERE heat_score > 0
    GROUP BY lead_id
    HAVING COUNT(*) > 1
    ORDER BY score_variance DESC
    LIMIT 10
  `;
  
  if (movement.length > 0) {
    console.log(`Found ${movement.length} leads with score variations (real movement):\n`);
    movement.forEach((m, idx) => {
      console.log(`${idx+1}. Lead ${m.lead_id}`);
      console.log(`   Snapshots: ${m.snapshots}`);
      console.log(`   Variance: ${m.score_variance} points (high: ${m.highest_score}, low: ${m.lowest_score})`);
    });
  } else {
    console.log("No snapshot variance yet (first activation day)");
  }

  // 8. Recent engagement events to show real-time tracking
  console.log("\n8. RECENT ENGAGEMENT EVENTS (last 48 hours)");
  const recent = await sql`
    SELECT
      event_type,
      COUNT(*) as count,
      MAX(created_at) as latest,
      COUNT(DISTINCT lead_id) as unique_leads
    FROM b2b_email_events
    WHERE created_at > NOW() - INTERVAL '48 hours'
    GROUP BY event_type
    ORDER BY created_at DESC
  `;
  
  if (recent.length > 0) {
    console.log("Recent events (last 48 hours):\n");
    recent.forEach(r => {
      console.log(`${r.event_type.toUpperCase()}: ${r.count} events (${r.unique_leads} unique leads)`);
      console.log(`  Latest: ${new Date(r.latest).toLocaleString()}`);
    });
  } else {
    console.log("No recent engagement events in last 48 hours");
  }

  console.log("\n=== END AUDIT ===");
}

auditHeatScore().catch(console.error);
