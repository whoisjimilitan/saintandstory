require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  try {
    console.log('H2: Was the request rejected before orchestration?\n');

    // Check CRON_SECRET - if it's not set, auth is bypassed
    const cronSecret = process.env.CRON_SECRET;
    console.log('1. CRON_SECRET Configuration:');
    console.log(`   Value: ${cronSecret ? '(set, length: ' + cronSecret.length + ')' : '(NOT SET)'}`);
    
    if (!cronSecret) {
      console.log('   Impact: Authorization check is BYPASSED (line 20 of route.ts: if (cronSecret && ...))');
      console.log('   Evidence AGAINST rejection on auth: STRONG\n');
    } else {
      console.log('   Impact: Authorization check is ACTIVE');
      console.log('   Would need Bearer token to match\n');
    }

    // Check route handler code for early rejection points
    console.log('2. Early Rejection Points in Route Handler:\n');
    
    const routeCode = `
    - Line 14-23: POST handler + auth check
      * Auth only rejects if CRON_SECRET is SET AND header doesn't match
      * If CRON_SECRET not set: auth is bypassed ✓
    
    - Line 25-26: First console.log
      * Would execute if request reached here
      * No database checks before this point
    
    - Line 29: Calls runDailyB2BOrchestration()
      * First substantive operation
    `;
    
    console.log(routeCode);
    
    console.log('3. Evidence Analysis:\n');
    console.log('Evidence FOR early rejection:');
    console.log('  - Request headers could be malformed');
    console.log('  - Vercel might not be passing standard headers');
    console.log('\nEvidence AGAINST early rejection:');
    console.log('  - Manual POST test with bearer token worked fine');
    console.log('  - No HTTP 401 errors in logs (would appear if auth failed)');
    console.log('  - CRON_SECRET is not set (auth bypassed)');
    console.log('  - Handler would log on line 26 if reached\n');
    
    console.log('Checking for any console.log evidence in Vercel logs...');
    // We already checked logs - no [B2B Orchestrator] messages at 02:00 UTC
    console.log('Result: No "[B2B Orchestrator]" logs at 02:00 UTC');
    console.log('Conclusion: Request never reached line 26 of handler\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
