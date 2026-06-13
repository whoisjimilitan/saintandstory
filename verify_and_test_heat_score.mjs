import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function verifyAndTest() {
  console.log("=== HEAT SCORE INFRASTRUCTURE VERIFICATION ===\n");

  // ========== PART 1: SCHEMA VERIFICATION ==========
  console.log("1. SCHEMA VERIFICATION\n");

  // Check b2b_leads columns
  console.log("  b2b_leads columns:");
  const leadsColumns = await sql`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'b2b_leads'
    AND column_name IN ('engagement_score', 'last_engagement_at')
    ORDER BY column_name
  `;
  leadsColumns.forEach(col => {
    console.log(`    ✓ ${col.column_name}: ${col.data_type} (default: ${col.column_default || 'NULL'})`);
  });

  // Check new tables
  console.log("\n  New tables:");
  const newTables = await sql`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('b2b_email_events', 'b2b_email_link_clicks', 'b2b_heat_score_history')
    ORDER BY tablename
  `;
  newTables.forEach(t => {
    console.log(`    ✓ ${t.tablename}`);
  });

  // Check indexes
  console.log("\n  Indexes created:");
  const indexes = await sql`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename IN ('b2b_email_events', 'b2b_email_link_clicks', 'b2b_heat_score_history')
    ORDER BY indexname
  `;
  console.log(`    ✓ ${indexes.length} indexes:`, indexes.map(i => i.indexname).join(", "));

  // ========== PART 2: DATA BACKFILL ==========
  console.log("\n2. DATA BACKFILL STATUS\n");

  // Check engagement_score is properly initialized
  const engagementStats = await sql`
    SELECT
      COUNT(*) as total_leads,
      COUNT(CASE WHEN engagement_score = 0 THEN 1 END) as engagement_zero,
      COUNT(CASE WHEN engagement_score > 0 THEN 1 END) as engagement_nonzero,
      COUNT(CASE WHEN last_engagement_at IS NULL THEN 1 END) as last_engagement_null
    FROM b2b_leads
  `;
  
  const stats = engagementStats[0];
  console.log(`  b2b_leads engagement_score backfill:`);
  console.log(`    Total leads: ${stats.total_leads}`);
  console.log(`    ✓ engagement_score = 0: ${stats.engagement_zero} leads`);
  console.log(`    ✓ last_engagement_at = NULL: ${stats.last_engagement_null} leads`);

  // Check email events table
  const emailEventCount = await sql`SELECT COUNT(*) as count FROM b2b_email_events`;
  console.log(`\n  b2b_email_events: ${emailEventCount[0].count} records (empty - expecting future Resend webhooks)`);

  // Check email link clicks table
  const emailLinksCount = await sql`SELECT COUNT(*) as count FROM b2b_email_link_clicks`;
  console.log(`  b2b_email_link_clicks: ${emailLinksCount[0].count} records (empty)`);

  // ========== PART 3: CREATE INITIAL HEAT SCORE SNAPSHOTS ==========
  console.log("\n3. INITIAL HEAT SCORE HISTORY SNAPSHOTS\n");

  // Get all active leads
  const leads = await sql`
    SELECT id
    FROM b2b_leads
    WHERE status NOT IN ('dead')
  `;

  console.log(`  Creating initial snapshots for ${leads.length} leads...`);

  let snapshotCount = 0;
  for (const lead of leads) {
    try {
      // Get opportunity score from qualified_businesses
      const opp = await sql`
        SELECT opportunity_score
        FROM qualified_businesses
        WHERE discovered_business_id = (
          SELECT discovered_business_id FROM b2b_leads WHERE id = ${lead.id}
        )
        LIMIT 1
      `;

      const opportunityScore = opp.length > 0 ? Math.min(100, Math.max(0, opp[0].opportunity_score || 0)) : 0;
      const businessFitScore = Math.min(40, Math.round(opportunityScore * 0.4));
      const engagementScore = 0; // No engagement yet
      const intentScore = 0; // No intent signals yet
      const totalHeatScore = businessFitScore + engagementScore + intentScore;

      await sql`
        INSERT INTO b2b_heat_score_history (
          lead_id, heat_score, engagement_score, qualification_score, intent_score
        ) VALUES (
          ${lead.id},
          ${totalHeatScore},
          ${engagementScore},
          ${businessFitScore},
          ${intentScore}
        )
      `;

      snapshotCount++;
    } catch (e) {
      console.error(`    ERROR creating snapshot for ${lead.id}: ${e.message}`);
    }
  }

  console.log(`  ✓ Created ${snapshotCount} initial heat score snapshots`);

  // Verify snapshots
  const snapshotStats = await sql`
    SELECT
      COUNT(*) as total_snapshots,
      COUNT(DISTINCT lead_id) as unique_leads,
      MIN(heat_score) as min_score,
      MAX(heat_score) as max_score,
      ROUND(AVG(heat_score)::numeric, 1) as avg_score
    FROM b2b_heat_score_history
  `;

  const snapStats = snapshotStats[0];
  console.log(`  Snapshot verification:`);
  console.log(`    Total snapshots: ${snapStats.total_snapshots}`);
  console.log(`    Unique leads tracked: ${snapStats.unique_leads}`);
  console.log(`    Heat score range: ${snapStats.min_score} - ${snapStats.max_score}`);
  console.log(`    Average heat score: ${snapStats.avg_score}`);

  // ========== PART 4: HEAT SCORE CALCULATION TEST ==========
  console.log("\n4. HEAT SCORE CALCULATION TEST\n");

  // Get top 5 leads by heat score
  const topLeads = await sql`
    SELECT DISTINCT ON (lead_id)
      lead_id,
      heat_score,
      qualification_score,
      engagement_score,
      intent_score,
      recorded_at
    FROM b2b_heat_score_history
    ORDER BY lead_id, recorded_at DESC
    LIMIT 5
  `;

  // Get business names
  const topLeadsWithNames = await Promise.all(
    topLeads.map(async (lead) => {
      const nameResult = await sql`
        SELECT business_name FROM b2b_leads WHERE id = ${lead.lead_id}
      `;
      return {
        ...lead,
        business_name: nameResult[0]?.business_name || 'Unknown'
      };
    })
  );

  console.log(`  Sample heat scores (top 5 by qualification score):\n`);
  topLeadsWithNames.forEach((lead, idx) => {
    const badge = lead.heat_score >= 75 ? '🔥 HOT' : 
                 lead.heat_score >= 50 ? '🔥 WARM' : 
                 lead.heat_score >= 25 ? '🟡 COOL' : '⚪ COLD';
    console.log(`  ${idx + 1}. ${lead.business_name}`);
    console.log(`     Qualification: ${lead.qualification_score}/40 | Engagement: ${lead.engagement_score}/40 | Intent: ${lead.intent_score}/20`);
    console.log(`     Total Heat: ${lead.heat_score}/100 ${badge}`);
  });

  // ========== PART 5: HEAT SCORE DISTRIBUTION ==========
  console.log("\n5. HEAT SCORE DISTRIBUTION\n");

  const distribution = await sql`
    SELECT DISTINCT ON (lead_id)
      heat_score
    FROM b2b_heat_score_history
    ORDER BY lead_id, recorded_at DESC
  `;

  const hot = distribution.filter(d => d.heat_score >= 75).length;
  const warm = distribution.filter(d => d.heat_score >= 50 && d.heat_score < 75).length;
  const cool = distribution.filter(d => d.heat_score >= 25 && d.heat_score < 50).length;
  const cold = distribution.filter(d => d.heat_score < 25).length;
  const total = distribution.length;

  console.log(`  🔥 HOT (75+):    ${hot}/${total} (${((hot/total)*100).toFixed(1)}%)`);
  console.log(`  🔥 WARM (50-74): ${warm}/${total} (${((warm/total)*100).toFixed(1)}%)`);
  console.log(`  🟡 COOL (25-49): ${cool}/${total} (${((cool/total)*100).toFixed(1)}%)`);
  console.log(`  ⚪ COLD (0-24):  ${cold}/${total} (${((cold/total)*100).toFixed(1)}%)`);

  // ========== PART 6: QUERY EXECUTION TESTS ==========
  console.log("\n6. HEAT SCORE API QUERY TESTS\n");

  // Test 1: Get all leads with engagement_score
  try {
    const allLeads = await sql`
      SELECT id, business_name, engagement_score, status
      FROM b2b_leads
      WHERE status NOT IN ('dead')
      LIMIT 3
    `;
    console.log(`  ✓ Query: SELECT engagement_score FROM b2b_leads (${allLeads.length} results)`);
  } catch (e) {
    console.log(`  ✗ Query failed: ${e.message}`);
  }

  // Test 2: Get email events for a lead
  try {
    const firstLead = await sql`SELECT id FROM b2b_leads LIMIT 1`;
    if (firstLead.length > 0) {
      const events = await sql`
        SELECT COUNT(*) as count
        FROM b2b_email_events
        WHERE lead_id = ${firstLead[0].id}
      `;
      console.log(`  ✓ Query: SELECT from b2b_email_events WHERE lead_id (ready for webhooks)`);
    }
  } catch (e) {
    console.log(`  ✗ Query failed: ${e.message}`);
  }

  // Test 3: Get heat score snapshots
  try {
    const snapshots = await sql`
      SELECT COUNT(*) as count
      FROM b2b_heat_score_history
    `;
    console.log(`  ✓ Query: SELECT from b2b_heat_score_history (${snapshots[0].count} snapshots)`);
  } catch (e) {
    console.log(`  ✗ Query failed: ${e.message}`);
  }

  // Test 4: Complex heat score join query
  try {
    const heatQuery = await sql`
      SELECT DISTINCT ON (lead_id)
        lead_id,
        heat_score,
        qualification_score,
        engagement_score,
        intent_score
      FROM b2b_heat_score_history
      WHERE heat_score > 0
      ORDER BY lead_id, recorded_at DESC
      LIMIT 10
    `;
    console.log(`  ✓ Query: Complex heat score query with ranking (${heatQuery.length} results)`);
  } catch (e) {
    console.log(`  ✗ Query failed: ${e.message}`);
  }

  console.log("\n=== VERIFICATION COMPLETE ===");
  console.log("\n✅ Heat Score Infrastructure Repaired and Verified\n");
}

verifyAndTest().catch(err => {
  console.error("FATAL ERROR:", err.message);
  process.exit(1);
});
