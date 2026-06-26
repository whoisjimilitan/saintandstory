import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Phone Outreach Tracking
 * Lists leads to call and tracks outcomes
 * Links to email campaign for attribution
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get all facility_managers leads with failed emails (no successful email sent)
    const phoneCandidates = await sql`
      SELECT
        l.id, l.business_name, l.phone, l.email, l.city,
        COALESCE(o.id, null) as has_outreach
      FROM b2b_leads l
      LEFT JOIN b2b_outreach o ON l.id = o.lead_id AND o.sent_at IS NOT NULL
      WHERE l.niche = 'facility_managers'
        AND l.status = 'new'
        AND l.phone IS NOT NULL
        AND o.id IS NULL
      ORDER BY l.created_at DESC
      LIMIT 150
    `;

    // Check phone_outreach tracking table
    const callStats = await sql`
      SELECT
        COUNT(*) as total_calls_logged,
        COUNT(CASE WHEN call_outcome = 'reached' THEN 1 END) as calls_reached,
        COUNT(CASE WHEN call_outcome = 'voicemail' THEN 1 END) as voicemails_left,
        COUNT(CASE WHEN email_captured_from_call IS NOT NULL THEN 1 END) as emails_captured,
        COUNT(DISTINCT lead_id) as unique_leads_called
      FROM phone_outreach
    `.catch(() => ({
      total_calls_logged: 0,
      calls_reached: 0,
      voicemails_left: 0,
      emails_captured: 0,
      unique_leads_called: 0,
    }));

    const stats = Array.isArray(callStats) ? callStats[0] : callStats;

    return NextResponse.json({
      status: "ready",
      phone_outreach_queue: {
        ready_to_call: phoneCandidates.length,
        sample: phoneCandidates.slice(0, 10),
        all: phoneCandidates,
      },
      call_tracking_stats: {
        total_calls_logged: stats.total_calls_logged || 0,
        calls_reached: stats.calls_reached || 0,
        voicemails_left: stats.voicemails_left || 0,
        emails_captured: stats.emails_captured || 0,
        unique_leads_called: stats.unique_leads_called || 0,
      },
      next_action: "Log calls via POST with lead_id and call_outcome",
    });
  } catch (error) {
    console.error("[phone-outreach] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json() as {
      leadId: string;
      callOutcome: "reached" | "voicemail" | "wrong_number" | "no_answer" | "declined";
      emailCaptured?: string;
      notes?: string;
    };

    if (!body.leadId || !body.callOutcome) {
      return NextResponse.json(
        { error: "leadId and callOutcome required" },
        { status: 400 }
      );
    }

    // Create phone_outreach table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS phone_outreach (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        lead_id UUID REFERENCES b2b_leads(id) ON DELETE CASCADE,
        phone_number TEXT,
        call_outcome TEXT,
        email_captured_from_call TEXT,
        notes TEXT,
        called_by TEXT DEFAULT 'system',
        called_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Get lead info
    const lead = await sql`
      SELECT id, business_name, phone, email
      FROM b2b_leads
      WHERE id = ${body.leadId}
    `;

    if (!lead || lead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = lead[0];

    // Log the call
    const callLog = await sql`
      INSERT INTO phone_outreach (
        lead_id, phone_number, call_outcome, email_captured_from_call, notes, called_by
      ) VALUES (
        ${body.leadId}, ${leadData.phone}, ${body.callOutcome},
        ${body.emailCaptured || null}, ${body.notes || null}, 'operator'
      )
      RETURNING id, call_outcome, email_captured_from_call
    `;

    // If email was captured, update lead
    if (body.emailCaptured && body.callOutcome === "reached") {
      await sql`
        UPDATE b2b_leads
        SET email = ${body.emailCaptured}, updated_at = NOW()
        WHERE id = ${body.leadId}
      `;
    }

    // Get updated stats
    const stats = await sql`
      SELECT
        COUNT(*) as total_calls,
        COUNT(CASE WHEN call_outcome = 'reached' THEN 1 END) as reached,
        COUNT(CASE WHEN email_captured_from_call IS NOT NULL THEN 1 END) as emails_captured
      FROM phone_outreach
    `;

    return NextResponse.json({
      status: "call_logged",
      call: callLog[0],
      lead: {
        id: leadData.id,
        businessName: leadData.business_name,
        phone: leadData.phone,
        emailCaptured: body.emailCaptured,
      },
      stats: stats[0],
      next: body.emailCaptured
        ? "✅ Email captured! Lead ready for email outreach."
        : "Voicemail or no contact - will try again later",
    });
  } catch (error) {
    console.error("[phone-outreach] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
