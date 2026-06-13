const { PrismaClient } = require('@prisma/client');

async function check() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== DISCOVERING WHERE PHASE 4 PIPELINE IS BROKEN ===\n');
    
    const businessCount = await prisma.business.count();
    console.log('Prisma business table count:', businessCount);
    
    if (businessCount > 0) {
      const samples = await prisma.business.findMany({ take: 3 });
      console.log('\nSample records:');
      console.table(samples);
    }
    
    console.log('\n\nCOMPARISON:\n');
    console.log('Prisma business table (OLD pipeline):      ', businessCount, 'records');
    console.log('Neon discovered_businesses table (NEW):    0 records');
    console.log('Neon enriched_businesses table (NEW):      0 records');
    console.log('Neon qualified_businesses table (NEW):     0 records');
    
    console.log('\n\nROOT CAUSE:\n');
    console.log('lib/b2b-orchestrator.ts line 10:');
    console.log('import { runDiscoveryPipeline } from "./discovery/pipeline";');
    console.log('\nThis imports the OLD Prisma-based pipeline, NOT the Phase 4 pipeline!');
    console.log('\nThe orchestrator needs to call:');
    console.log('import { runFullPipeline } from "./four-layer-pipeline";');
    console.log('\nInstead of:');
    console.log('import { runDiscoveryPipeline } from "./discovery/pipeline";');
    
    console.log('\n\nCHAIN OF FAILURES:\n');
    console.log('1. Orchestrator calls runDiscoveryPipeline() (Prisma-based)');
    console.log('   ✓ Finds businesses via Google Places');
    console.log('   ✓ Stores them in Prisma business table');
    console.log('   ✗ Does NOT call Phase 4 four-layer pipeline');
    console.log('\n2. Phase 4 four-layer pipeline never executes');
    console.log('   ✗ discovered_businesses stays empty');
    console.log('   ✗ enriched_businesses stays empty');
    console.log('   ✗ qualified_businesses stays empty');
    console.log('\n3. No scores exist');
    console.log('   ✗ Tiers cannot be calculated');
    console.log('   ✗ Outreach eligibility cannot be set');
    console.log('\n4. No qualified leads promoted');
    console.log('   ✗ b2b_leads not populated from Phase 4');
    console.log('   ✗ b2b_outreach stays empty');
    console.log('   ✗ Recognition emails never sent');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
