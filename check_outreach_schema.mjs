import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const schema = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'b2b_outreach'
  ORDER BY ordinal_position
`;

console.log("b2b_outreach schema:\n");
schema.forEach(col => {
  console.log(`${col.column_name}: ${col.data_type}`);
});
