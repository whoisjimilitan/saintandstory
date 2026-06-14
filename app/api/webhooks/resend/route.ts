import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export const maxDuration = 60;

// Webhook secret from Resend (must be set in production)
const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

interface ResendWebhookPayload {
  type: "email.sent" | "email.delivered" | "email.opened" | "email.clicked" | "email.bounced" | "email.complained";
  data: {
    email_id: string;
    from: string;
    to: string;
    created_at: string;
    timestamp?: number;
    click?: {
      link?: string;
    };
  };
}

function validateResendSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn("[Resend Webhook] No RESEND_WEBHOOK_SECRET configured, skipping validation");
    return true;
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");

  return hash === signature;
}

function mapEventType(
  resendType: string
): "opened" | "clicked" | "bounced" | "delivered" | "complained" {
  const typeMap: Record<string, "opened" | "clicked" | "bounced" | "delivered" | "complained"> = {
    "email.opened": "opened",
    "email.clicked": "clicked",
    "email.bounced": "bounced",
    "email.delivered": "delivered",
    "email.complained": "complained",
  };
  return typeMap[resendType] || ("opened" as const);
}

export async function POST(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get raw body for signature validation
    const rawBody = await req.text();
    const signature = req.headers.get("svix-signature") || req.headers.get("x-signature") || "";

    // Validate signature
    if (RESEND_WEBHOOK_SECRET && !validateResendSignature(rawBody, signature, RESEND_WEBHOOK_SECRET)) {
      console.error("[Resend Webhook] Invalid signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: ResendWebhookPayload = JSON.parse(rawBody);

    console.log(`[Resend Webhook] Event received: ${payload.type} for ${payload.data.email_id}`);

    // Create event table if needed
    await sql`
      CREATE TABLE IF NOT EXISTS b2b_email_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        outreach_id UUID,
        lead_id UUID,
        resend_email_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Extract metadata
    const eventType = mapEventType(payload.type);
    const metadata = {
      from: payload.data.from,
      to: payload.data.to,
      ...(payload.data.click?.link && { clicked_link: payload.data.click.link }),
    };

    // Find lead by email (from b2b_outreach records)
    const outreach = await sql`
      SELECT id, lead_id FROM b2b_outreach
      WHERE resend_message_id = ${payload.data.email_id}
      LIMIT 1
    `;

    const outreachId = outreach.length > 0 ? outreach[0].id : null;
    const leadId = outreach.length > 0 ? outreach[0].lead_id : null;

    // Store event
    await sql`
      INSERT INTO b2b_email_events (
        outreach_id,
        lead_id,
        resend_email_id,
        event_type,
        timestamp,
        metadata
      ) VALUES (
        ${outreachId},
        ${leadId},
        ${payload.data.email_id},
        ${eventType},
        ${new Date(payload.data.created_at).toISOString()},
        ${JSON.stringify(metadata)}
      )
    `;

    // If this is an engagement event, update lead heat score
    if ((eventType === "opened" || eventType === "clicked") && leadId) {
      // Update engagement score
      const currentLead = await sql`
        SELECT engagement_score FROM b2b_leads WHERE id = ${leadId}
      `;

      const currentScore = currentLead[0]?.engagement_score || 0;
      const scoreIncrement = eventType === "clicked" ? 20 : 5;

      await sql`
        UPDATE b2b_leads
        SET
          engagement_score = ${currentScore + scoreIncrement},
          last_engagement_at = NOW()
        WHERE id = ${leadId}
      `;

      console.log(`[Resend Webhook] Updated lead ${leadId}: ${eventType} (+${scoreIncrement} score)`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Resend Webhook] Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/webhooks/resend",
    events: ["email.sent", "email.delivered", "email.opened", "email.clicked", "email.bounced", "email.complained"],
  });
}
