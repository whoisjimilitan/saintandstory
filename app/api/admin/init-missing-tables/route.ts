import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Initialize Missing Tables
 * Creates phone_call_queue and other required tables if they don't exist
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS)
 */

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const results = [];

    // Create phone_call_queue table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS phone_call_queue (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          lead_id UUID NOT NULL REFERENCES b2b_leads(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          call_result TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          called_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(lead_id)
        )
      `;
      results.push({ table: "phone_call_queue", status: "created_or_exists" });
    } catch (e) {
      results.push({ table: "phone_call_queue", status: "error", error: String(e) });
    }

    // Add reply_tracking_enabled column to b2b_leads if missing
    try {
      await sql`
        ALTER TABLE b2b_leads
        ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ
      `;
      results.push({ column: "b2b_leads.replied_at", status: "added" });
    } catch (e) {
      results.push({ column: "b2b_leads.replied_at", status: "error", error: String(e) });
    }

    // Ensure b2b_email_events has proper schema
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS b2b_email_events (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
          outreach_id UUID REFERENCES b2b_outreach(id) ON DELETE CASCADE,
          event_type TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      results.push({ table: "b2b_email_events", status: "created_or_exists" });
    } catch (e) {
      results.push({ table: "b2b_email_events", status: "error", error: String(e) });
    }

    // Ensure earnings table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS earnings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
          job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          commission_rate DECIMAL(3, 2),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      results.push({ table: "earnings", status: "created_or_exists" });
    } catch (e) {
      results.push({ table: "earnings", status: "error", error: String(e) });
    }

    return NextResponse.json({
      status: "initialization_complete",
      results: results,
      message: "All required tables initialized",
    });
  } catch (error) {
    console.error("[init-tables] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
