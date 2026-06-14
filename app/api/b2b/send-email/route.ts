import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { lead_id, subject, body, operator } = await request.json();

    if (!lead_id || !subject || !body || !operator) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check for duplicate sends (48h protection)
    const lastOutreach = await sql`
      SELECT sent_at FROM b2b_outreach
      WHERE lead_id = ${lead_id} AND sent_at IS NOT NULL
      ORDER BY sent_at DESC
      LIMIT 1
    `;

    if (lastOutreach.length > 0) {
      const lastSentTime = new Date(lastOutreach[0].sent_at);
      const hoursSince = (Date.now() - lastSentTime.getTime()) / (1000 * 60 * 60);

      if (hoursSince < 48) {
        return NextResponse.json(
          {
            error: "DUPLICATE_PROTECTION",
            message: `Email sent ${Math.round(hoursSince)} hours ago. Safe to send again in ${Math.round(48 - hoursSince)} hours.`,
          },
          { status: 429 }
        );
      }
    }

    // Get lead email
    const leads = await sql`
      SELECT id, business_name, email FROM b2b_leads WHERE id = ${lead_id}
    `;

    if (leads.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leads[0];

    if (!lead.email) {
      return NextResponse.json(
        { error: "Lead has no email address" },
        { status: 400 }
      );
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Saint & Story <noreply@saintandstory.co.uk>",
      to: lead.email,
      subject: subject,
      html: body.replace(/\n/g, "<br />"),
    });

    if (emailResponse.error) {
      // Log event: send failed
      await sql`
        INSERT INTO b2b_outreach_events
        (lead_id, event_type, operator, event_data, metadata)
        VALUES
        (${lead_id}, 'email_sent', ${operator},
         '{"status":"failed","error":"${emailResponse.error.message}"}',
         '{"resend_error":true}')
      `;

      return NextResponse.json(
        { error: "Email send failed", details: emailResponse.error },
        { status: 500 }
      );
    }

    // Update b2b_outreach record
    await sql`
      UPDATE b2b_outreach
      SET
        sent_at = NOW(),
        resend_message_id = ${emailResponse.data?.id || null}
      WHERE lead_id = ${lead_id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // Create audit event: EMAIL_SENT
    await sql`
      INSERT INTO b2b_outreach_events
      (lead_id, event_type, operator, event_data)
      VALUES
      (${lead_id}, 'email_sent', ${operator},
       '{"resend_id":"${emailResponse.data?.id}","recipient":"${lead.email}"}')
    `;

    // Update lead status: READY -> CONTACTED
    await sql`
      UPDATE b2b_leads
      SET
        lead_status = 'contacted',
        last_contacted_at = NOW(),
        updated_at = NOW()
      WHERE id = ${lead_id}
    `;

    // Create audit event: STATUS_CHANGED
    await sql`
      INSERT INTO b2b_outreach_events
      (lead_id, event_type, operator, event_data)
      VALUES
      (${lead_id}, 'status_changed', ${operator},
       '{"from":"ready","to":"contacted"}')
    `;

    return NextResponse.json({
      success: true,
      message: `Email sent to ${lead.email}`,
      resend_id: emailResponse.data?.id,
      lead_id: lead_id,
      status: "contacted",
    });
  } catch (error) {
    console.error("[SEND-EMAIL] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
