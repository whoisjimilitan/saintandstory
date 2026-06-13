import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function check() {
  const columns = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'Business'
    ORDER BY ordinal_position
  `;

  console.log("Columns in Business table:\n");
  for (const col of columns) {
    console.log(`  ${col.column_name.padEnd(25)} ${col.data_type}`);
  }
}

check();
