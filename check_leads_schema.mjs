import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get table schema
const schema = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'b2b_leads'
  ORDER BY ordinal_position
`;

console.log("=== B2B_LEADS TABLE SCHEMA ===\n");
schema.forEach(col => {
  console.log(`${col.column_name}: ${col.data_type}`);
});

// Get actual data
const sample = await sql`
  SELECT * FROM b2b_leads LIMIT 1
`;

console.log("\n=== SAMPLE RECORD ===\n");
if (sample.length > 0) {
  Object.entries(sample[0]).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

// Count leads
const count = await sql`SELECT COUNT(*) as total FROM b2b_leads`;
console.log(`\n\nTotal leads: ${count[0].total}`);
