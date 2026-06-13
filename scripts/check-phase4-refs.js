const fs = require('fs');
const path = require('path');

console.log('=== TASK 3: PHASE 4 PIPELINE REACHABILITY ===\n');

console.log('Searching for imports and references to Phase 4 functions:\n');

const files = [
  'lib/b2b-orchestrator.ts',
  'app/api/orchestrate/b2b-daily/route.ts',
  'lib/discovery/pipeline.ts',
];

const phase4References = [
  'runFullPipeline',
  'four-layer-pipeline',
  'qualifyBusiness',
  'promoteToLead',
  'extractExpansionSignals',
  'getQualificationTier',
];

let foundReferences = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join('/Users/jimilitan/Documents/GitHub/saintandstory', file), 'utf8');
    const lines = content.split('\n');
    
    console.log(`File: ${file}`);
    
    phase4References.forEach(ref => {
      lines.forEach((line, idx) => {
        if (line.includes(ref) && !line.trim().startsWith('//')) {
          console.log(`  Line ${idx + 1}: ${line.trim()}`);
          foundReferences++;
        }
      });
    });
    
    console.log();
  } catch (err) {
    console.log(`  [File not found]\n`);
  }
});

console.log('\n=== REACHABILITY VERDICT ===\n');

if (foundReferences === 0) {
  console.log('✗ Phase 4 pipeline is ORPHANED');
  console.log('\nNo references found in:');
  console.log('  - lib/b2b-orchestrator.ts (orchestration entry point)');
  console.log('  - app/api/orchestrate/b2b-daily/route.ts (API handler)');
  console.log('  - lib/discovery/pipeline.ts (active discovery pipeline)');
  console.log('\nConclusion:');
  console.log('Phase 4 pipeline is completely unreachable from production orchestration.');
  console.log('\nImplication:');
  console.log('The four-layer pipeline (discovered_businesses → enriched_businesses →');
  console.log('qualified_businesses → b2b_leads) is dead code in production.');
  console.log('It exists in the codebase but never executes.');
} else {
  console.log('✓ Phase 4 references found');
  console.log(foundReferences + ' references detected');
}

