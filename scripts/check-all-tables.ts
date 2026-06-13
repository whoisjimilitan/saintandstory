import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function checkSchema() {
  console.log("FULL SCHEMA INVENTORY\n");
  console.log("Tables in public schema with row counts:\n");

  try {
    const tables = await sql`
      SELECT
        tablename,
        schemaname
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    for (const t of tables) {
      try {
        const result = await sql.query(`SELECT COUNT(*)::int as count FROM ${t.tablename}`);
        const count = result[0].count;
        const mark = count > 0 ? " ⭐" : "";
        console.log(`  ${t.tablename.padEnd(35)} : ${count.toString().padStart(6)} rows${mark}`);
      } catch (err) {
        console.log(`  ${t.tablename.padEnd(35)} : [error reading]`);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

checkSchema();
