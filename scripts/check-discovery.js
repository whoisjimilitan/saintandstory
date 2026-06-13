const { neon } = require('@neondatabase/serverless');

async function checkDiscovery() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== STAGE C/D: DISCOVERY & PERSISTENCE ===\n');
    
    console.log('Checking discovery_config (what the pipeline is querying for):');
    const config = await sql`SELECT * FROM discovery_config WHERE enabled = true`;
    console.table(config);
    
    if (config.length === 0) {
      console.log('\n⚠️ NO ENABLED DISCOVERY CONFIG FOUND');
      console.log('Pipeline will use DEFAULT_DISCOVERY_PARAMS from lib/b2b-orchestrator.ts');
    }
    
    console.log('\n\nAll discovery_config records (enabled and disabled):');
    const allConfig = await sql`SELECT * FROM discovery_config`;
    console.table(allConfig);
    
    console.log('\n\nChecking discovered_businesses table:');
    const discovered = await sql`
      SELECT COUNT(*) as count FROM discovered_businesses
    `;
    console.log('discovered_businesses count:', discovered[0].count);
    
    console.log('\n\nChecking if discovery_config is the issue...');
    console.log('- Pipeline expects discovery_config table with enabled = true rows');
    console.log('- If no rows found, uses DEFAULT_DISCOVERY_PARAMS:');
    console.log('  [');
    console.log('    { niche: "florists", location: "london" },');
    console.log('    { niche: "florists", location: "manchester" },');
    console.log('    { niche: "florists", location: "sheffield" },');
    console.log('    { niche: "accountants", location: "london" },');
    console.log('    { niche: "accountants", location: "manchester" }');
    console.log('  ]');
    
    console.log('\n\nLooking at discovery/pipeline.ts to understand why businesses are skipped...');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDiscovery();
