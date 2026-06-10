/**
 * Migration: Add email_sent_at column to b2b_leads
 * Purpose: Store timestamp of when recognition email was sent
 * Use: Operator continuity - shows when prospect received email
 * Risk: Minimal - nullable column, backward compatible
 */

export async function up() {
  // Add email_sent_at column to b2b_leads table
  const sql = await import("@neondatabase/serverless").then(m => m.neon(process.env.DATABASE_URL!));

  try {
    await sql`
      ALTER TABLE b2b_leads
      ADD COLUMN email_sent_at TIMESTAMP NULL;
    `;

    console.log("[MIGRATION] Added email_sent_at column to b2b_leads");
    return { success: true };
  } catch (error) {
    console.error("[MIGRATION] Failed to add email_sent_at:", error);
    return { success: false, error };
  }
}

export async function down() {
  // Rollback: Remove email_sent_at column
  const sql = await import("@neondatabase/serverless").then(m => m.neon(process.env.DATABASE_URL!));

  try {
    await sql`
      ALTER TABLE b2b_leads
      DROP COLUMN email_sent_at;
    `;

    console.log("[MIGRATION] Removed email_sent_at column from b2b_leads");
    return { success: true };
  } catch (error) {
    console.error("[MIGRATION] Failed to remove email_sent_at:", error);
    return { success: false, error };
  }
}
