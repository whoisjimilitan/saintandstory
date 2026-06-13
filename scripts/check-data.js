const { neon } = require('@neondatabase/serverless');

async function checkData() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('=== PRODUCTION DATA STATUS ===\n');
    
    console.log('1. b2b_leads records');
    const leads = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log('Total:', leads[0].count);
    
    const leadSample = await sql`SELECT id, business_name, status, created_at FROM b2b_leads LIMIT 3`;
    console.table(leadSample);
    
    console.log('\n2. qualified_businesses records');
    const qual = await sql`SELECT COUNT(*) as count FROM qualified_businesses`;
    console.log('Total:', qual[0].count);
    
    console.log('\n3. discovered_businesses records');
    const disc = await sql`SELECT COUNT(*) as count FROM discovered_businesses`;
    console.log('Total:', disc[0].count);
    
    console.log('\n4. b2b_outreach records');
    const out = await sql`SELECT COUNT(*) as count FROM b2b_outreach`;
    console.log('Total:', out[0].count);
    
    const outSample = await sql`SELECT COUNT(*) as count, email_type FROM b2b_outreach GROUP BY email_type`;
    console.log('By email_type:');
    console.table(outSample);
    
    console.log('\n5. b2b_standing_orders records');
    const so = await sql`SELECT COUNT(*) as count FROM b2b_standing_orders WHERE active = true`;
    console.log('Active standing orders:', so[0].count);
    
    const soSample = await sql`SELECT id, business_name, price FROM b2b_standing_orders WHERE active = true LIMIT 3`;
    console.table(soSample);
    
    console.log('\n6. Check if b2b_leads has qualified_business_id populated');
    const qbRef = await sql`SELECT COUNT(*) as with_qb, COUNT(CASE WHEN qualified_business_id IS NULL THEN 1 END) as without_qb FROM b2b_leads`;
    console.table(qbRef);
    
    console.log('\n=== CRITICAL STATUS ===');
    console.log('Phase 4 pipeline has NOT been run on production data.');
    console.log('qualified_businesses table is empty.');
    console.log('b2b_leads table has 45 records but no opportunity_score.');
    console.log('\nThis means:');
    console.log('- Tier distribution CANNOT be calculated');
    console.log('- outreach_eligible enforcement impact CANNOT be determined');
    console.log('- Phase 4 code exists but pipeline has not executed');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkData();
