import { neon } from "@neondatabase/serverless";

export async function runMigrations() {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Driver verification columns
    await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'`;
    await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ`;
    await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_approved_at TIMESTAMPTZ`;
    await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_photo_url TEXT`;
    await sql`ALTER TABLE drivers ADD COLUMN IF NOT EXISTS verification_notes TEXT`;

    // Job photo columns
    await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_photo_url TEXT`;
    await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pickup_photo_taken_at TIMESTAMPTZ`;
    await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT`;
    await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS delivery_photo_taken_at TIMESTAMPTZ`;
    await sql`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_completion_verified BOOLEAN DEFAULT FALSE`;

    console.log("[Migrations] ✓ Driver verification and job photos schema ready");
  } catch (err) {
    console.error("[Migrations] Failed:", err);
  }
}

// Call on app startup
runMigrations().catch(console.error);
