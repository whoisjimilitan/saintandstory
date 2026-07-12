import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("DATABASE_URL not set");
    process.exit(1);
  }

  console.log("Database URL:", databaseUrl.substring(0, 50) + "...");

  const sql = neon(databaseUrl);

  try {
    const result = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log("✓ B2B_LEADS table exists");
    console.log("✓ Record count:", result[0].count);
  } catch (error) {
    console.error("✗ Error:", (error as any).message);
  }
}

main();
