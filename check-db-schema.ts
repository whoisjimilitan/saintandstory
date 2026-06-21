import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkSchema() {
  try {
    console.log("Checking b2b_leads table columns in production database...\n");
    
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'b2b_leads'
      ORDER BY ordinal_position;
    `;
    
    console.log("Columns in b2b_leads table:");
    console.log("─".repeat(60));
    
    result.forEach((col: any) => {
      console.log(`${col.column_name.padEnd(30)} | ${col.data_type.padEnd(15)} | nullable: ${col.is_nullable}`);
    });
    
    console.log("─".repeat(60));
    
    // Check for specific columns
    const hasConfidence = result.some((c: any) => c.column_name === 'confidence_score');
    const hasOpportunity = result.some((c: any) => c.column_name === 'opportunity_score');
    
    console.log("\n✅ COLUMN STATUS:");
    console.log(`  confidence_score: ${hasConfidence ? '❌ EXISTS (BAD - should not be in DB)' : '✅ DOES NOT EXIST (GOOD - schema was correct)'}`);
    console.log(`  opportunity_score: ${hasOpportunity ? '✅ EXISTS' : '❌ DOES NOT EXIST'}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR querying database:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

checkSchema();
