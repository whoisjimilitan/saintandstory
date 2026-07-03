import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Resend Webhook Handler
 *
 * This endpoint receives email events from Resend:
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 * - email.delivered
 *
 * Updates B2bCampaignEmail status and timestamps
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log FULL webhook body for debugging (visible in Vercel logs for 1 hour)
    console.log("[WEBHOOK BODY]", JSON.stringify(body, null, 2));
    console.log("[WEBHOOK TYPE]", body.type);
    console.log("[WEBHOOK DATA]", body.data ? JSON.stringify(body.data, null, 2) : "NO DATA FIELD");

    // Webhook structure: { created_at, data: { type, id, email, ... } }
    const data = body.data || body;

    // Extract from data object (Resend/Svix wraps everything in data)
    const messageId =
      data.id ||
      data.messageId ||
      data.message_id ||
      body.id ||
      body.messageId ||
      request.headers.get("x-svix-id") ||
      request.headers.get("x-resend-id");

    const eventType = data.type || body.type;
    const email = data.email || body.email;
    const timestamp = new Date(data.created_at || body.created_at || new Date().toISOString());

    console.log("[WEBHOOK HANDLER] ◆ Event received:", {
      type: eventType,
      messageId,
      email,
      timestamp: timestamp.toISOString(),
    });

    if (!eventType || !messageId) {
      console.warn("[WEBHOOK HANDLER] ✗ Missing required fields", {
        hasType: !!eventType,
        hasMessageId: !!messageId,
        bodyKeys: Object.keys(body),
        dataKeys: body.data ? Object.keys(body.data) : [],
      });
      return NextResponse.json({ received: true, reason: "missing_fields" });
    }

    // Map Resend event types to our status values
    const eventTypeMap: Record<string, string> = {
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.complained": "complained",
      "email.delivered": "delivered",
    };

    const newStatus = eventTypeMap[eventType];
    if (!newStatus) {
      console.log("[WEBHOOK HANDLER] ℹ️  Unknown event type, ignoring:", eventType);
      return NextResponse.json({ received: true, reason: "unknown_event" });
    }

    // Try to find email by resendMessageId first
    let campaignEmail = await prisma.b2bCampaignEmail.findUnique({
      where: { resendMessageId: messageId },
    });

    // If not found by messageId, match by email address (normalized)
    if (!campaignEmail && email) {
      const normalizedEmail = email.toLowerCase().trim();

      campaignEmail = await prisma.b2bCampaignEmail.findFirst({
        where: {
          prospectEmail: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
        orderBy: { emailSentAt: "desc" },
        take: 1,
      });
    }

    if (!campaignEmail) {
      console.log("[WEBHOOK HANDLER] No email found for:", { messageId, email });
      return NextResponse.json({ received: true, matched: false });
    }

    // Build update data
    const updateData: any = { status: newStatus };

    if (newStatus === "opened") {
      updateData.openedAt = timestamp;
    } else if (newStatus === "clicked") {
      updateData.clickedAt = timestamp;
    }

    // Update the email
    const updated = await prisma.b2bCampaignEmail.update({
      where: { id: campaignEmail.id },
      data: updateData,
      select: {
        id: true,
        status: true,
        openedAt: true,
        clickedAt: true,
        prospectEmail: true,
      },
    });

    console.log("[WEBHOOK HANDLER] ✓✓ Updated email:", {
      id: updated.id,
      email: updated.prospectEmail,
      newStatus: updated.status,
      openedAt: updated.openedAt,
      clickedAt: updated.clickedAt,
    });

    return NextResponse.json({
      received: true,
      matched: true,
      eventType: newStatus,
      emailId: campaignEmail.id,
    });
  } catch (error) {
    console.error("[WEBHOOK HANDLER] ✗ Error processing webhook:", error);
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
    endpoint: "/api/b2b/email-response/webhook",
    description: "Resend email event webhook receiver",
  });
}
