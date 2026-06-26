import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * Resend Reply Tracking Webhook
 * Receives email_replied events from Resend
 * Records replies in b2b_email_events table
 * Updates b2b_leads status when prospect replies
 */

interface ResendReplyEvent {
  type: string;
  created_at: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string;
    subject?: string;
    text?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResendReplyEvent;

    const eventType = body.type;
    const timestamp = body.created_at || new Date().toISOString();
    const data = body.data || {};

    console.log(`[REPLY-WEBHOOK] Resend reply event: ${eventType}`, {
      from: data.from,
      timestamp,
    });

    if (eventType !== "email_replied") {
      console.log(`[REPLY-WEBHOOK] Ignoring non-reply event: ${eventType}`);
      return NextResponse.json({ received: true });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Find the outreach record by email_id
    let outreach;
    if (data.email_id) {
      outreach = await sql`
        SELECT o.*, l.id as lead_id
        FROM b2b_outreach o
        JOIN b2b_leads l ON o.lead_id = l.id
        WHERE o.resend_message_id = ${data.email_id}
        LIMIT 1
      `;
    } else if (data.from) {
      // Fallback: match by sender email (less precise)
      outreach = await sql`
        SELECT o.*, l.id as lead_id
        FROM b2b_outreach o
        JOIN b2b_leads l ON o.lead_id = l.id
        WHERE l.email = ${data.from}
        ORDER BY o.sent_at DESC
        LIMIT 1
      `;
    }

    if (!outreach || outreach.length === 0) {
      console.warn(`[REPLY-WEBHOOK] No outreach record found for reply from: ${data.from}`);
      return NextResponse.json({ received: true, matched: false });
    }

    const outreachRecord = outreach[0];
    const leadId = outreachRecord.lead_id as string;
    const outreachId = outreachRecord.id as string;

    // Record the reply event
    const metadata = {
      from: data.from,
      subject: data.subject || null,
      preview: data.text ? data.text.substring(0, 100) : null,
      timestamp,
    };

    await sql`
      INSERT INTO b2b_email_events (
        lead_id,
        outreach_id,
        event_type,
        created_at,
        metadata
      ) VALUES (
        ${leadId},
        ${outreachId},
        'replied',
        ${timestamp},
        ${JSON.stringify(metadata)}
      )
    `;

    // Update b2b_leads status to "replied"
    await sql`
      UPDATE b2b_leads
      SET status = 'replied', replied_at = NOW()
      WHERE id = ${leadId}
    `;

    console.log(`[REPLY-WEBHOOK] ✓ Recorded reply from ${data.from} for lead ${leadId}`);

    return NextResponse.json({
      received: true,
      matched: true,
      event: "replied",
      lead_id: leadId,
    });
  } catch (error) {
    console.error("[REPLY-WEBHOOK] Error processing reply:", error);
    return NextResponse.json(
      {
        error: "Failed to process reply",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
