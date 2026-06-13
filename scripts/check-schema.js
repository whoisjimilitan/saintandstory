const { neon } = require('@neondatabase/serverless');

async function checkSchema() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Checking b2b_leads schema...\n');
    const schema = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'b2b_leads'
      ORDER BY ordinal_position
    `;
    console.table(schema);
    
    console.log('\nChecking qualified_businesses schema...\n');
    const qualSchema = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'qualified_businesses'
      ORDER BY ordinal_position
    `;
    console.table(qualSchema);
    
    console.log('\nTotal b2b_leads count:', (await sql`SELECT COUNT(*) as count FROM b2b_leads`)[0]);
    console.log('Total qualified_businesses count:', (await sql`SELECT COUNT(*) as count FROM qualified_businesses`)[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
