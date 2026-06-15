import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_Rs5wyI3gTxWd@ep-lively-dream-abwubbyb-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(databaseUrl);

async function audit() {
  try {
    // 1. Check if table exists
    console.log("=== 1. TABLE SCHEMA ===\n");
    const schemaQuery = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'b2b_orchestration_logs'
      ORDER BY ordinal_position
    `;
    
    if (schemaQuery.length === 0) {
      console.log("❌ TABLE DOES NOT EXIST: b2b_orchestration_logs");
      console.log("\nChecking for alternative table names...\n");
      
      const allTables = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name LIKE '%orchestr%'
        ORDER BY table_name
      `;
      
      if (allTables.length === 0) {
        console.log("❌ NO ORCHESTRATION TABLES FOUND");
      } else {
        console.log("Found orchestration tables:");
        allTables.forEach(t => console.log(`  - ${t.table_name}`));
      }
      
      process.exit(0);
    }
    
    console.log("Table: b2b_orchestration_logs\n");
    schemaQuery.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // 2. Row count
    console.log("\n=== 2. ROW COUNT ===\n");
    const countResult = await sql`SELECT COUNT(*) as count FROM b2b_orchestration_logs`;
    const rowCount = countResult[0].count;
    console.log(`Total rows: ${rowCount}\n`);
    
    if (rowCount === 0) {
      console.log("❌ TABLE IS EMPTY - No orchestration runs logged\n");
      process.exit(0);
    }
    
    // 3. Latest 10 records
    console.log("=== 3. LATEST 10 RECORDS ===\n");
    const latest = await sql`
      SELECT 
        id, run_id, started_at, completed_at, 
        discovery_count, businesses_found, leads_created,
        drivers_matched, emails_sent, standing_orders_processed, jobs_created,
        status, failures
      FROM b2b_orchestration_logs
      ORDER BY started_at DESC
      LIMIT 10
    `;
    
    latest.forEach((record, idx) => {
      console.log(`Record ${idx + 1}:`);
      console.log(`  run_id: ${record.run_id}`);
      console.log(`  started_at: ${record.started_at}`);
      console.log(`  completed_at: ${record.completed_at}`);
      console.log(`  status: ${record.status}`);
      console.log(`  discovery_count: ${record.discovery_count}`);
      console.log(`  businesses_found: ${record.businesses_found}`);
      console.log(`  leads_created: ${record.leads_created}`);
      console.log(`  drivers_matched: ${record.drivers_matched}`);
      console.log(`  emails_sent: ${record.emails_sent}`);
      console.log(`  standing_orders_processed: ${record.standing_orders_processed}`);
      console.log(`  jobs_created: ${record.jobs_created}`);
      if (record.failures && record.failures.length > 0) {
        console.log(`  failures: ${record.failures.join(', ')}`);
      }
      console.log();
    });
    
    // 4. Latest run summary
    console.log("=== 4. LATEST RUN SUMMARY ===\n");
    const lastRun = latest[0];
    console.log(`Timestamp: ${lastRun.started_at}`);
    console.log(`Status: ${lastRun.status}`);
    console.log(`Discovery count: ${lastRun.discovery_count}`);
    console.log(`Leads created: ${lastRun.leads_created}`);
    
    // 5. Success/failure stats
    console.log("\n=== 5. SUCCESS/FAILURE STATE ===\n");
    const stats = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM b2b_orchestration_logs
      GROUP BY status
      ORDER BY count DESC
    `;
    
    stats.forEach(stat => {
      console.log(`${stat.status}: ${stat.count} runs`);
    });
    
    // 6. Discovery count trend
    console.log("\n=== 6. DISCOVERY COUNTS (Last 10 runs) ===\n");
    const discoveryTrend = await sql`
      SELECT 
        started_at,
        discovery_count,
        businesses_found,
        leads_created
      FROM b2b_orchestration_logs
      ORDER BY started_at DESC
      LIMIT 10
    `;
    
    discoveryTrend.forEach(run => {
      console.log(`${run.started_at}: discovered=${run.discovery_count}, found=${run.businesses_found}, leads=${run.leads_created}`);
    });
    
    // 7. Lead promotion counts
    console.log("\n=== 7. LEAD PROMOTION COUNTS (Last 10 runs) ===\n");
    const promotionTrend = await sql`
      SELECT 
        started_at,
        drivers_matched,
        jobs_created,
        standing_orders_processed
      FROM b2b_orchestration_logs
      ORDER BY started_at DESC
      LIMIT 10
    `;
    
    promotionTrend.forEach(run => {
      console.log(`${run.started_at}: drivers_matched=${run.drivers_matched}, jobs_created=${run.jobs_created}, orders=${run.standing_orders_processed}`);
    });
    
  } catch (error) {
    console.error("❌ DATABASE ERROR:", error.message);
    process.exit(1);
  }
}

audit();
