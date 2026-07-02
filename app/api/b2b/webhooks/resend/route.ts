import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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
 * Updates B2bCampaignEmail status and timestamps
 * Verifies webhook signature for security
 */

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

function verifyResendWebhook(body: string, signature: string | null): boolean {
  if (!RESEND_WEBHOOK_SECRET || !signature) {
    console.warn("[WEBHOOK] No webhook secret or signature found, skipping verification");
    return true; // Allow if not configured, but log warning
  }

  try {
    // Resend uses HMAC-SHA256 for webhook signatures
    const hash = crypto
      .createHmac("sha256", RESEND_WEBHOOK_SECRET)
      .update(body)
      .digest("base64");

    const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    console.log(`[WEBHOOK] Signature ${isValid ? "✓ valid" : "✗ invalid"}`);
    return isValid;
  } catch (error) {
    console.error("[WEBHOOK] Signature verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-resend-signature") || request.headers.get("svix-signature");

    // Verify signature
    if (!verifyResendWebhook(body, signature)) {
      console.error("[WEBHOOK] Invalid webhook signature - rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsedBody = JSON.parse(body) as {
      type: string;
      created_at: string;
      data: Record<string, any>;
    };

    const eventType = parsedBody.type;
    const timestamp = new Date(parsedBody.created_at || new Date().toISOString());
    const data = parsedBody.data || {};

    console.log(`[WEBHOOK] Resend event: ${eventType}`, {
      messageId: data.email_id,
      email: data.email,
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

    // Find campaign email by resend message ID
    const campaignEmail = await prisma.b2bCampaignEmail.findUnique({
      where: { resendMessageId: data.email_id },
    });

    if (!campaignEmail) {
      console.warn(`[WEBHOOK] No campaign email found for message ID: ${data.email_id}, email: ${data.email}`);
      return NextResponse.json({ received: true, matched: false });
    }

    console.log(`[WEBHOOK] Found campaign email: ${campaignEmail.id}`);

    // Update status and timestamp based on event type
    const updateData: any = { status: mappedEventType };

    if (mappedEventType === "opened") {
      updateData.openedAt = timestamp;
    } else if (mappedEventType === "clicked") {
      updateData.clickedAt = timestamp;
    } else if (mappedEventType === "replied") {
      updateData.repliedAt = timestamp;
      updateData.status = "replied";
    }

    await prisma.b2bCampaignEmail.update({
      where: { id: campaignEmail.id },
      data: updateData,
    });

    console.log(`[WEBHOOK] ✓ Updated campaign email ${campaignEmail.id} to status: ${mappedEventType}`);

    return NextResponse.json({
      received: true,
      matched: true,
      event: mappedEventType,
      campaignEmailId: campaignEmail.id,
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
