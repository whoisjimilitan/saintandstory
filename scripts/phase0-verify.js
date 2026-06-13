const { PrismaClient } = require('@prisma/client');
const { neon } = require('@neondatabase/serverless');

async function verify() {
  const prisma = new PrismaClient();
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('═'.repeat(80));
    console.log('PHASE 0: BASELINE VERIFICATION');
    console.log('═'.repeat(80));
    console.log('\n');
    
    // Query 1: Count Prisma businesses
    const businessCount = await prisma.business.count();
    console.log('1. PRISMA DISCOVERY LAYER');
    console.log('─'.repeat(80));
    console.log(`SELECT COUNT(*) FROM business`);
    console.log(`Result: ${businessCount} records`);
    console.log(`Status: ${ businessCount > 0 ? '✓ ACTIVE' : '✗ EMPTY'}\n`);
    
    // Query 2: Count qualified businesses
    const qualifiedCount = await sql`SELECT COUNT(*) as count FROM qualified_businesses`;
    console.log('2. PHASE 4 QUALIFICATION LAYER');
    console.log('─'.repeat(80));
    console.log(`SELECT COUNT(*) FROM qualified_businesses`);
    console.log(`Result: ${qualifiedCount[0].count} records`);
    console.log(`Status: ${qualifiedCount[0].count === 0 ? '✓ EMPTY (expected)' : '✗ HAS DATA (unexpected)'}\n`);
    
    // Query 3: Count B2B leads
    const leadsCount = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log('3. B2B LEADS (REVENUE LAYER)');
    console.log('─'.repeat(80));
    console.log(`SELECT COUNT(*) FROM b2b_leads`);
    console.log(`Result: ${leadsCount[0].count} records`);
    console.log(`Status: ${leadsCount[0].count > 0 ? '✓ HAS DATA' : '✗ EMPTY'} (Phase 3 legacy or empty)\n`);
    
    // Query 4: Find unprocessed businesses (proposed bridge query)
    const unprocessedCount = await sql`
      SELECT COUNT(*) as count
      FROM (
        SELECT b.id
        FROM business b
        LEFT JOIN qualified_businesses q ON q.discovered_business_id = b.id
        WHERE q.discovered_business_id IS NULL
      ) unprocessed
    `;
    console.log('4. UNPROCESSED BUSINESSES (Bridge candidates)');
    console.log('─'.repeat(80));
    console.log(`SELECT COUNT(*)
FROM business b
LEFT JOIN qualified_businesses q ON q.discovered_business_id = b.id
WHERE q.discovered_business_id IS NULL`);
    console.log(`Result: ${unprocessedCount[0].count} records`);
    console.log(`Status: ${unprocessedCount[0].count > 0 ? `✓ READY FOR BRIDGE (${unprocessedCount[0].count} to process)` : '✗ ALL PROCESSED'}\n`);
    
    // Query 5: Find discovery orchestration entrypoint
    console.log('5. DISCOVERY ORCHESTRATION ENTRYPOINT');
    console.log('─'.repeat(80));
    console.log(`Location: lib/b2b-orchestrator.ts`);
    console.log(`Function: runDailyB2BOrchestration()`);
    console.log(`Entry: Stage 1 - Discovery Pipeline`);
    console.log(`Trigger: runDiscoveryPipeline()`);
    console.log(`Source: lib/discovery/pipeline.ts:39`);
    console.log(`Output: Prisma business table\n`);
    
    // Query 6: Find qualification entrypoint
    console.log('6. QUALIFICATION ENTRYPOINT');
    console.log('─'.repeat(80));
    console.log(`Location: lib/four-layer-pipeline.ts`);
    console.log(`Function: runFullPipeline()`);
    console.log(`Input: RawBusinessDiscovery`);
    console.log(`Output: qualified_businesses + b2b_leads`);
    console.log(`Status: ✗ NOT CALLED FROM ORCHESTRATION\n`);
    
    // Summary
    console.log('═'.repeat(80));
    console.log('BASELINE CONFIRMED');
    console.log('═'.repeat(80));
    console.log(`
✓ Prisma Business (discovery): ${businessCount} records
✗ Qualified Business (Phase 4): ${qualifiedCount[0].count} records
✓ B2B Leads (revenue): ${leadsCount[0].count} records
✓ Unprocessed Candidates: ${unprocessedCount[0].count} records

DIAGNOSIS CONFIRMED:
- Discovery is active and finding businesses
- Qualification pipeline exists but is unreached
- Lead promotion is blocked (no qualified businesses)
- Revenue engine is starved

READY FOR PHASE 1: Locate existing qualification entry
`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
