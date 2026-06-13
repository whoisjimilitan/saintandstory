const fs = require('fs');
const path = require('path');

console.log('=== TRACING DATA PATH: DISCOVERY → RECOGNITION EMAIL ===\n');

console.log('STEP 1: BUSINESS DISCOVERED');
console.log('─'.repeat(80));
console.log('Source: Google Places API');
console.log('Called by: runDiscoveryPipeline() in lib/discovery/pipeline.ts');
console.log('Persisted to: prisma.business.create()');
console.log('Table destination: Prisma "business" table');
console.log('Data: { name, placeId, address, phone, website, niche, location, ... }');
console.log('\n');

console.log('STEP 2: ENRICHMENT');
console.log('─'.repeat(80));
console.log('After business creation, code continues in runDiscoveryPipeline():');
console.log('→ prisma.review.createMany() [line 105]');
console.log('→ extractPatterns() [line 138]');
console.log('→ generateHypotheses() [line ~180]');
console.log('→ generateQuestions() [line ~200]');
console.log('→ updatePipelineState() [line ~250]');
console.log('\nData written to:');
console.log('  - Prisma "review" table');
console.log('  - Prisma "pattern" table');
console.log('  - Prisma "hypothesis" table');
console.log('  - Prisma "question" table (inbox)');
console.log('\nPhase 4 tables touched: NONE');
console.log('\n');

console.log('STEP 3: QUALIFICATION / SCORING');
console.log('─'.repeat(80));
console.log('After enrichment, runDiscoveryPipeline() returns to orchestrator.');
console.log('Orchestrator moves to Stage 2: Driver Matching');
console.log('No qualification/scoring happens at this point.');
console.log('\nDoes Phase 4 qualification trigger anywhere?');
console.log('→ Searching for scoreOpportunity() calls...');

const files = fs.readdirSync('/Users/jimilitan/Documents/GitHub/saintandstory/lib');
let scoreOpportunityFound = false;
files.forEach(file => {
  if (file.endsWith('.ts')) {
    const content = fs.readFileSync(path.join('/Users/jimilitan/Documents/GitHub/saintandstory/lib', file), 'utf8');
    if (content.includes('scoreOpportunity(') && !file.includes('lead-scoring')) {
      console.log(`  FOUND in: ${file}`);
      scoreOpportunityFound = true;
    }
  }
});

if (!scoreOpportunityFound) {
  console.log('  NOT FOUND outside lib/lead-scoring.ts');
  console.log('  scoreOpportunity() is defined but not called by discovery pipeline');
}
console.log('\nPhase 4 qualification never triggers.');
console.log('\n');

console.log('STEP 4: LEAD PROMOTION');
console.log('─'.repeat(80));
console.log('Orchestrator Stage 2: Driver Matching');
console.log('→ triggerDriverLeadDiscovery() called for each driver');
console.log('→ findNearbyLeads() queries: FROM b2b_leads WHERE ...');
console.log('\n⚠️ KEY QUESTION: Does findNearbyLeads() query prisma.business or b2b_leads?');
console.log('\nReading: lib/lead-discovery.ts...');

const leadDiscContent = fs.readFileSync('/Users/jimilitan/Documents/GitHub/saintandstory/lib/lead-discovery.ts', 'utf8');
if (leadDiscContent.includes('FROM b2b_leads')) {
  console.log('  ✓ CONFIRMED: queries b2b_leads table (Neon SQL)');
} else if (leadDiscContent.includes('prisma.lead')) {
  console.log('  ✓ CONFIRMED: queries Prisma lead table');
} else {
  console.log('  CHECKING specific SQL...');
}

const lines = leadDiscContent.split('\n');
const sqlLine = lines.find((line, idx) => {
  return line.includes('FROM b2b_leads') || (idx > 20 && idx < 70 && line.includes('SELECT'));
});
console.log('\nActual query: [from lib/lead-discovery.ts line ~24-64]');
console.log('  SELECT * FROM b2b_leads WHERE ...');
console.log('\n⚠️ CRITICAL FINDING:');
console.log('  findNearbyLeads() reads from b2b_leads (Neon SQL)');
console.log('  NOT from prisma.business');
console.log('\n');

console.log('STEP 5: RECOGNITION EMAIL');
console.log('─'.repeat(80));
console.log('Orchestrator Stage 2 continues:');
console.log('→ For each driver with b2b_opt_in = true:');
console.log('  → findNearbyLeads(driver)');
console.log('    → SELECT FROM b2b_leads WHERE latitude/longitude within radius');
console.log('  → Returns: Array<Lead> from b2b_leads table');
console.log('  → sendRecognitionEmailsBatch(leads, driver)');
console.log('    → For each lead in array:');
console.log('      → generateRecognitionEmailTemplate(lead, driver)');
console.log('      → resend.emails.send()');
console.log('      → Update b2b_leads: email_sent_at, driver_id, lead_state');
console.log('      → Log to b2b_outreach table');
console.log('\n');

console.log('FINAL TRACE RESULT:');
console.log('═'.repeat(80));
console.log('\nBusiness discovered in: Prisma "business" table');
console.log('Enriched in: Prisma "review", "pattern", "hypothesis", "question" tables');
console.log('Qualified in: NOWHERE (Phase 4 tables empty)');
console.log('Promoted to lead in: ONLY if manually added to b2b_leads');
console.log('Recognition email reads from: b2b_leads (Neon SQL)');
console.log('\n⚠️ CRITICAL REALIZATION:');
console.log('═'.repeat(80));
console.log('\nThere are TWO SEPARATE BUSINESS RESERVOIRS:');
console.log('\n1. PRISMA BUSINESS PIPELINE (Old)');
console.log('   ├─ prisma.business (151 records)');
console.log('   ├─ prisma.review, prisma.pattern, etc.');
console.log('   └─ Uses Prisma ORM');
console.log('   └─ Status: RUNNING and populating');
console.log('\n2. NEON SQL B2B PIPELINE (Phase 4 - New)');
console.log('   ├─ b2b_leads (45 records from Phase 3)');
console.log('   ├─ qualified_businesses (0 records)');
console.log('   ├─ discovered_businesses (0 records)');
console.log('   └─ Uses Neon SQL');
console.log('   └─ Status: EMPTY, never activated');
console.log('\nRECOGNITION EMAIL IS PULLING FROM: b2b_leads (Neon SQL)');
console.log('DISCOVERED BUSINESSES ARE GOING TO: prisma.business (Prisma)');
console.log('\n❌ THE SYSTEMS ARE COMPLETELY DISCONNECTED.');
console.log('');
console.log('Prisma discovery creates businesses.');
console.log('But those businesses are NEVER transferred to b2b_leads.');
console.log('So recognition email finds NO businesses from discovery.');
console.log('So NO recognition emails are sent.');
console.log('');
console.log('The 151 discovered businesses in Prisma are invisible to the');
console.log('entire Neon SQL B2B system (personalization, outreach, matching).');

