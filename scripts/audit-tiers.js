const { neon } = require('@neondatabase/serverless');

async function runAudit() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('\n=== PRODUCTION DATA IMPACT AUDIT ===\n');

    // QUERY 1: Tier Distribution
    console.log('QUERY 1: Tier Distribution (Current Leads)');
    console.log('─'.repeat(80));
    const tierDist = await sql`
      SELECT
        CASE
          WHEN opportunity_score >= 80 THEN 'Tier A (80-100)'
          WHEN opportunity_score >= 60 THEN 'Tier B (60-79)'
          WHEN opportunity_score >= 40 THEN 'Tier C (40-59)'
          ELSE 'Tier D (0-39)'
        END as tier,
        COUNT(*) as lead_count,
        ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM b2b_leads), 2) as percentage,
        ROUND(AVG(opportunity_score), 2) as avg_score,
        MIN(opportunity_score) as min_score,
        MAX(opportunity_score) as max_score
      FROM b2b_leads
      GROUP BY tier
      ORDER BY 
        CASE
          WHEN tier = 'Tier A (80-100)' THEN 1
          WHEN tier = 'Tier B (60-79)' THEN 2
          WHEN tier = 'Tier C (40-59)' THEN 3
          ELSE 4
        END
    `;
    console.table(tierDist);

    // QUERY 2: Total Leads
    console.log('\nQUERY 2: Total Leads');
    console.log('─'.repeat(80));
    const totalLeads = await sql`SELECT COUNT(*) as total_leads FROM b2b_leads`;
    console.table(totalLeads);

    // QUERY 3: Recognition Emails sent in last 30 days
    console.log('\nQUERY 3: Recognition Emails Sent (Last 30 Days by Tier)');
    console.log('─'.repeat(80));
    const emailsLast30 = await sql`
      SELECT
        CASE
          WHEN bl.opportunity_score >= 80 THEN 'Tier A (80-100)'
          WHEN bl.opportunity_score >= 60 THEN 'Tier B (60-79)'
          WHEN bl.opportunity_score >= 40 THEN 'Tier C (40-59)'
          ELSE 'Tier D (0-39)'
        END as tier,
        COUNT(bo.id) as emails_sent_30d,
        COUNT(DISTINCT bl.id) as unique_leads_30d,
        ROUND(100.0 * COUNT(bo.id) / NULLIF((SELECT COUNT(*) FROM b2b_outreach WHERE sent_at >= NOW() - INTERVAL '30 days'), 0), 2) as percent_of_total_emails
      FROM b2b_outreach bo
      JOIN b2b_leads bl ON bo.lead_id = bl.id
      WHERE bo.sent_at >= NOW() - INTERVAL '30 days'
      GROUP BY tier
      ORDER BY 
        CASE
          WHEN tier = 'Tier A (80-100)' THEN 1
          WHEN tier = 'Tier B (60-79)' THEN 2
          WHEN tier = 'Tier C (40-59)' THEN 3
          ELSE 4
        END
    `;
    console.table(emailsLast30);

    // QUERY 4: Standing Orders by Tier
    console.log('\nQUERY 4: Standing Orders by Tier (Revenue Attribution)');
    console.log('─'.repeat(80));
    const standingOrders = await sql`
      SELECT
        CASE
          WHEN bl.opportunity_score >= 80 THEN 'Tier A (80-100)'
          WHEN bl.opportunity_score >= 60 THEN 'Tier B (60-79)'
          WHEN bl.opportunity_score >= 40 THEN 'Tier C (40-59)'
          ELSE 'Tier D (0-39)'
        END as tier,
        COUNT(bso.id) as standing_orders,
        COUNT(DISTINCT bl.id) as unique_businesses,
        COALESCE(ROUND(SUM(bso.price)::numeric, 2), 0) as total_monthly_value,
        COALESCE(ROUND(AVG(bso.price)::numeric, 2), 0) as avg_order_value
      FROM b2b_standing_orders bso
      JOIN b2b_leads bl ON bso.lead_id = bl.id
      WHERE bso.active = true
      GROUP BY tier
      ORDER BY 
        CASE
          WHEN tier = 'Tier A (80-100)' THEN 1
          WHEN tier = 'Tier B (60-79)' THEN 2
          WHEN tier = 'Tier C (40-59)' THEN 3
          ELSE 4
        END
    `;
    console.table(standingOrders);

    // QUERY 5: Email engagement by tier
    console.log('\nQUERY 5: Email Engagement by Tier (Last 30 Days)');
    console.log('─'.repeat(80));
    const engagement = await sql`
      SELECT
        CASE
          WHEN bl.opportunity_score >= 80 THEN 'Tier A (80-100)'
          WHEN bl.opportunity_score >= 60 THEN 'Tier B (60-79)'
          WHEN bl.opportunity_score >= 40 THEN 'Tier C (40-59)'
          ELSE 'Tier D (0-39)'
        END as tier,
        COUNT(bo.id) as emails_sent,
        COUNT(CASE WHEN bo.replied = true THEN 1 END) as replied_count,
        ROUND(100.0 * COUNT(CASE WHEN bo.replied = true THEN 1 END)::float / NULLIF(COUNT(bo.id), 0), 2) as reply_rate_percent
      FROM b2b_outreach bo
      JOIN b2b_leads bl ON bo.lead_id = bl.id
      WHERE bo.sent_at >= NOW() - INTERVAL '30 days'
      GROUP BY tier
      ORDER BY 
        CASE
          WHEN tier = 'Tier A (80-100)' THEN 1
          WHEN tier = 'Tier B (60-79)' THEN 2
          WHEN tier = 'Tier C (40-59)' THEN 3
          ELSE 4
        END
    `;
    console.table(engagement);

    console.log('\n=== END AUDIT ===\n');

  } catch (error) {
    console.error('Error running audit:', error);
    process.exit(1);
  }
}

runAudit();
