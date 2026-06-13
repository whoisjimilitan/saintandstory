const { PrismaClient } = require('@prisma/client');
const { neon } = require('@neondatabase/serverless');

async function verify() {
  const prisma = new PrismaClient();
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== THE SYSTEM DISCONNECT — FINAL VERIFICATION ===\n');
    
    const prismaCount = await prisma.business.count();
    console.log('PRISMA PIPELINE (Current)');
    console.log('─'.repeat(80));
    console.log(`prisma.business table: ${prismaCount} records`);
    console.log('Status: ACTIVE (discoveries happening)');
    console.log('Flow: Google Places → prisma.business → prisma.review → enrichment');
    console.log('Destination: Prisma ORM tables\n');
    
    const neonLeadsResult = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    const neonLeads = neonLeadsResult[0].count;
    
    console.log('NEON SQL B2B PIPELINE (Target)');
    console.log('─'.repeat(80));
    console.log(`b2b_leads table: ${neonLeads} records`);
    console.log('Status: INACTIVE (no new leads from discovery)');
    console.log('Flow: Should be: Discovery → Qualification → Promotion → b2b_leads');
    console.log('Actual: Only 45 legacy records from Phase 3\n');
    
    console.log('RECOGNITION EMAIL SYSTEM');
    console.log('─'.repeat(80));
    console.log('Current flow:');
    console.log('  triggerDriverLeadDiscovery(driver)');
    console.log('    → findNearbyLeads(driver)');
    console.log('    → SELECT FROM b2b_leads (Neon SQL)');
    console.log('    → Found: 0-45 leads (only Phase 3 data)');
    console.log('  Result: No recognition emails sent from recent discoveries\n');
    
    console.log('═'.repeat(80));
    console.log('SCENARIO DIAGNOSIS');
    console.log('═'.repeat(80));
    console.log('\nThis is SCENARIO B (Dangerous) not Scenario A:\n');
    
    console.log('❌ NOT: "Phase 4 was built but forgotten"');
    console.log('\n✓ YES: "Two separate systems that were never connected"');
    console.log('         - Prisma pipeline: Old system (still running)');
    console.log('         - Neon SQL pipeline: New system (never activated)');
    console.log('         - Recognition email: Uses Neon SQL (starved of data)');
    console.log('\nThe discovery pipeline was never bridged to the B2B outreach system.');
    console.log('Discovered businesses sit in Prisma.');
    console.log('Outreach system looks in Neon SQL.');
    console.log('They never connect.\n');
    
    console.log('═'.repeat(80));
    console.log('CORRECT FIX');
    console.log('═'.repeat(80));
    console.log('\nNOT: "Wire Phase 4 into orchestrator"');
    console.log('\nYES: "Bridge Prisma discoveries to Neon SQL B2B system"');
    console.log('\nOptions:');
    console.log('A) After Prisma discovery, convert to b2b_leads (simplest)');
    console.log('B) After Prisma discovery, run Phase 4 qualification (intended)');
    console.log('C) Replace Prisma discovery entirely with Phase 4 (most invasive)\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
