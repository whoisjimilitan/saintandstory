import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function checkColumns() {
  console.log("Checking discovered_businesses columns...\n");

  const columns = await sql`
    SELECT
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_name = 'discovered_businesses'
    ORDER BY ordinal_position
  `;

  console.log("Columns in discovered_businesses:\n");
  for (const col of columns) {
    console.log(`  ${col.column_name.padEnd(25)} ${col.data_type.padEnd(15)} nullable=${col.is_nullable}`);
  }

  const hasSourceID = (columns as any[]).some(c => c.column_name === 'source_id');
  console.log(`\nsource_id exists: ${hasSourceID ? '✅ YES' : '❌ NO'}`);
}

checkColumns();
