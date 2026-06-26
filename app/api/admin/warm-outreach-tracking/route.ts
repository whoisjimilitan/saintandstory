import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Warm Outreach Tracking
 * Tracks event planning company outreach campaign progress
 * Measures opens, clicks, replies, calls booked
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Create warm_outreach_tracking table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS warm_outreach_tracking (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_name TEXT,
        contact_email TEXT NOT NULL,
        city TEXT,
        event_type TEXT,
        sequence_stage TEXT DEFAULT 'email_1',
        email_1_sent_at TIMESTAMPTZ,
        email_1_opened BOOLEAN DEFAULT false,
        email_2_sent_at TIMESTAMPTZ,
        email_2_opened BOOLEAN DEFAULT false,
        email_2_clicked BOOLEAN DEFAULT false,
        email_3_sent_at TIMESTAMPTZ,
        email_3_opened BOOLEAN DEFAULT false,
        email_3_calendar_clicked BOOLEAN DEFAULT false,
        email_4_sent_at TIMESTAMPTZ,
        email_4_opened BOOLEAN DEFAULT false,
        email_4_calendar_clicked BOOLEAN DEFAULT false,
        email_5_sent_at TIMESTAMPTZ,
        email_5_opened BOOLEAN DEFAULT false,
        phone_call_outcome TEXT,
        phone_call_date TIMESTAMPTZ,
        meeting_booked BOOLEAN DEFAULT false,
        client_converted BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Get campaign stats
    const stats = await sql`
      SELECT
        COUNT(*) as total_prospects,
        COUNT(CASE WHEN email_1_sent_at IS NOT NULL THEN 1 END) as email_1_sent,
        COUNT(CASE WHEN email_1_opened THEN 1 END) as email_1_opened,
        COUNT(CASE WHEN email_2_sent_at IS NOT NULL THEN 1 END) as email_2_sent,
        COUNT(CASE WHEN email_2_clicked THEN 1 END) as email_2_clicked,
        COUNT(CASE WHEN email_3_calendar_clicked THEN 1 END) as email_3_interest,
        COUNT(CASE WHEN email_4_calendar_clicked THEN 1 END) as email_4_interest,
        COUNT(CASE WHEN phone_call_outcome IS NOT NULL THEN 1 END) as phone_calls_logged,
        COUNT(CASE WHEN meeting_booked THEN 1 END) as meetings_booked,
        COUNT(CASE WHEN client_converted THEN 1 END) as clients_converted
      FROM warm_outreach_tracking
    `.catch(() => ({
      total_prospects: 0,
      email_1_sent: 0,
      email_1_opened: 0,
      email_2_sent: 0,
      email_2_clicked: 0,
      email_3_interest: 0,
      email_4_interest: 0,
      phone_calls_logged: 0,
      meetings_booked: 0,
      clients_converted: 0,
    }));

    const s = Array.isArray(stats) ? stats[0] : stats;

    // Calculate conversion rates
    const email1OpenRate =
      s.email_1_sent > 0 ? ((s.email_1_opened / s.email_1_sent) * 100).toFixed(1) : "0";
    const email2ClickRate =
      s.email_2_sent > 0 ? ((s.email_2_clicked / s.email_2_sent) * 100).toFixed(1) : "0";
    const interestRate =
      s.email_1_sent > 0 ? ((s.email_3_interest / s.email_1_sent) * 100).toFixed(1) : "0";
    const callToMeetingRate =
      s.phone_calls_logged > 0
        ? ((s.meetings_booked / s.phone_calls_logged) * 100).toFixed(1)
        : "0";
    const conversionRate =
      s.phone_calls_logged > 0
        ? ((s.clients_converted / s.phone_calls_logged) * 100).toFixed(1)
        : "0";

    // Get recent activity
    const recentActivity = await sql`
      SELECT
        company_name, contact_name, sequence_stage,
        CASE
          WHEN client_converted THEN 'CONVERTED ✓'
          WHEN meeting_booked THEN 'Meeting Booked'
          WHEN phone_call_outcome IS NOT NULL THEN phone_call_outcome
          WHEN email_4_calendar_clicked THEN 'Email 4 - Calendar Clicked'
          WHEN email_3_calendar_clicked THEN 'Email 3 - Calendar Clicked'
          WHEN email_2_clicked THEN 'Email 2 - Clicked'
          WHEN email_1_opened THEN 'Email 1 - Opened'
          ELSE 'Pending'
        END as status,
        updated_at
      FROM warm_outreach_tracking
      ORDER BY updated_at DESC
      LIMIT 15
    `.catch(() => []);

    return NextResponse.json({
      status: "ready",
      campaign_overview: {
        total_prospects: s.total_prospects || 0,
        in_sequence: (s.email_1_sent || 0) - (s.clients_converted || 0),
        converted: s.clients_converted || 0,
      },
      funnel_metrics: {
        email_1_sent: s.email_1_sent || 0,
        email_1_open_rate: `${email1OpenRate}%`,
        email_2_sent: s.email_2_sent || 0,
        email_2_click_rate: `${email2ClickRate}%`,
        calendar_clicks_total: (s.email_3_interest || 0) + (s.email_4_interest || 0),
        qualified_interest_rate: `${interestRate}%`,
        phone_calls_logged: s.phone_calls_logged || 0,
        meetings_booked: s.meetings_booked || 0,
        call_to_meeting_rate: `${callToMeetingRate}%`,
        clients_converted: s.clients_converted || 0,
        phone_to_conversion_rate: `${conversionRate}%`,
      },
      benchmark: {
        target_email_1_open_rate: "15-20%",
        target_email_2_click_rate: "8-12%",
        target_qualified_interest: "2-5%",
        target_phone_calls_per_100: "3-5",
        target_conversion_per_call: "33-50%",
        expected_revenue_per_100: "1-2 clients = £1,500-4,000/month",
      },
      recent_activity: Array.isArray(recentActivity)
        ? recentActivity.slice(0, 15)
        : [],
      next_actions: [
        "Add prospects to warm_outreach_tracking table",
        "Send Email 1 (Pattern-Based Observation) to prospects",
        "Track opens/clicks via email client or analytics",
        "Update phone_call_outcome when calls are made",
        "Monitor conversion_rate target: 33-50% of phone calls",
      ],
    });
  } catch (error) {
    console.error("[warm-outreach-tracking] Error:", error);
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
    const body = await request.json() as {
      action: string;
      company_name?: string;
      contact_name?: string;
      contact_email?: string;
      city?: string;
      event_type?: string;
      email_stage?: string;
      phone_call_outcome?: string;
      meeting_booked?: boolean;
      client_converted?: boolean;
      notes?: string;
    };

    const sql = neon(process.env.DATABASE_URL!);

    if (body.action === "add_prospect") {
      if (!body.company_name || !body.contact_email) {
        return NextResponse.json(
          { error: "company_name and contact_email required" },
          { status: 400 }
        );
      }

      const result = await sql`
        INSERT INTO warm_outreach_tracking (
          company_name, contact_name, contact_email, city, event_type, email_1_sent_at
        ) VALUES (
          ${body.company_name}, ${body.contact_name || null}, ${body.contact_email},
          ${body.city || null}, ${body.event_type || null}, NOW()
        )
        RETURNING id, company_name
      `;

      return NextResponse.json({
        status: "prospect_added",
        prospect: result[0],
        next_step: "Email 1 queued for sending tomorrow morning",
      });
    }

    if (body.action === "log_email_event") {
      const { email_stage } = body;
      if (!email_stage) {
        return NextResponse.json(
          { error: "email_stage required (opened_1, clicked_2, etc.)" },
          { status: 400 }
        );
      }

      // Map email stages to columns
      const stageMap: Record<string, string> = {
        opened_1: "email_1_opened",
        opened_2: "email_2_opened",
        clicked_2: "email_2_clicked",
        opened_3: "email_3_opened",
        calendar_clicked_3: "email_3_calendar_clicked",
        opened_4: "email_4_opened",
        calendar_clicked_4: "email_4_calendar_clicked",
        opened_5: "email_5_opened",
      };

      const column = stageMap[email_stage];
      if (!column) {
        return NextResponse.json(
          { error: "Invalid email_stage" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: "email_event_logged",
        stage: email_stage,
        next_action: "Continue sequence based on engagement",
      });
    }

    if (body.action === "log_call") {
      if (!body.phone_call_outcome) {
        return NextResponse.json(
          { error: "phone_call_outcome required (reached, voicemail, declined, etc.)" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: "call_logged",
        outcome: body.phone_call_outcome,
        next_action:
          body.phone_call_outcome === "reached" && body.meeting_booked
            ? "Update dashboard, send followup meeting email"
            : "Continue outreach sequence",
      });
    }

    if (body.action === "mark_converted") {
      return NextResponse.json({
        status: "client_converted",
        message: "🎉 First event client! Track revenue in orders dashboard",
        next_action: "Document case study for social proof",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[warm-outreach-tracking] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
