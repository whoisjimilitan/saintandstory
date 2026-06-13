import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { recordEmailEvent } from "@/lib/engagement-tracking";

/**
 * Resend Webhook Receiver
 *
 * Receives email events from Resend:
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 * - email.delivered
 *
 * Records events in b2b_email_events table
 * Updates engagement score in real-time
 */

interface ResendEvent {
  type: string;
  created_at: string;
  data?: {
    email_id?: string;
    email?: string;
    timestamp?: string;
    user_agent?: string;
    ip_address?: string;
    link?: {
      href: string;
      text?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      type: string;
      created_at: string;
      data: Record<string, any>;
    };

    const eventType = body.type;
    const timestamp = body.created_at || new Date().toISOString();
    const data = body.data || {};

    console.log(`[WEBHOOK] Resend event: ${eventType}`, {
      email: data.email,
      timestamp,
    });

    // Map Resend event types to our event types
    const eventTypeMap: Record<string, string> = {
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.complained": "complained",
      "email.delivered": "delivered",
    };

    const mappedEventType = eventTypeMap[eventType];
    if (!mappedEventType) {
      console.log(`[WEBHOOK] Unknown event type: ${eventType}, ignoring`);
      return NextResponse.json({ received: true });
    }

    // Find the outreach record by email_id or resend_message_id
    const sql = neon(process.env.DATABASE_URL!);

    let outreach;
    if (data.email_id) {
      outreach = await sql`
        SELECT o.*, l.id as lead_id
        FROM b2b_outreach o
        JOIN b2b_leads l ON o.lead_id = l.id
        WHERE o.resend_message_id = ${data.email_id}
        LIMIT 1
      `;
    } else if (data.email) {
      // Fallback: match by email address (less precise)
      outreach = await sql`
        SELECT o.*, l.id as lead_id
        FROM b2b_outreach o
        JOIN b2b_leads l ON o.lead_id = l.id
        WHERE l.email = ${data.email}
        ORDER BY o.sent_at DESC
        LIMIT 1
      `;
    }

    if (!outreach || outreach.length === 0) {
      console.warn(`[WEBHOOK] No outreach record found for email: ${data.email}`);
      return NextResponse.json({ received: true, matched: false });
    }

    const outreachRecord = outreach[0];
    const leadId = outreachRecord.lead_id as string;
    const outreachId = outreachRecord.id as string;

    // Record the event
    const metadata = {
      email: data.email,
      user_agent: data.user_agent || null,
      ip_address: data.ip_address || null,
      link_url:
        mappedEventType === "clicked" ? data.link?.href : null,
      link_text:
        mappedEventType === "clicked" ? data.link?.text : null,
      timestamp: timestamp,
    };

    const recorded = await recordEmailEvent(
      sql,
      leadId,
      outreachId,
      mappedEventType as
        | "opened"
        | "clicked"
        | "bounced"
        | "complained"
        | "delivered",
      metadata
    );

    if (!recorded) {
      console.error(`[WEBHOOK] Failed to record event for lead ${leadId}`);
      return NextResponse.json(
        { error: "Failed to record event" },
        { status: 500 }
      );
    }

    console.log(
      `[WEBHOOK] ✓ Recorded ${mappedEventType} for lead ${leadId}`
    );

    return NextResponse.json({
      received: true,
      matched: true,
      event: mappedEventType,
      lead_id: leadId,
    });
  } catch (error) {
    console.error("[WEBHOOK] Error processing Resend webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/b2b/webhooks/resend",
    description: "Resend email event webhook receiver",
    events: [
      "email.opened",
      "email.clicked",
      "email.bounced",
      "email.complained",
      "email.delivered",
    ],
  });
}
