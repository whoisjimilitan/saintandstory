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
  console.log("[WEBHOOK HANDLER] ◆ Incoming webhook request");

  try {
    const body = await request.json();

    // Log all headers to understand what Resend is sending
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      allHeaders[key] = value;
    });
    console.error("🔴 [WEBHOOK HANDLER] REQUEST HEADERS:", allHeaders);
    console.error("🔴 [WEBHOOK HANDLER] REQUEST BODY:", JSON.stringify(body));

    // Try to find message ID in multiple possible locations (Resend/Svix format variations)
    const messageId =
      body.id ||
      body.messageId ||
      body.message_id ||
      body.data?.id ||
      body.data?.messageId ||
      body.data?.message_id ||
      body.message?.id ||
      // Also check headers
      request.headers.get("x-svix-id") ||
      request.headers.get("x-resend-id") ||
      request.headers.get("x-message-id");

    const eventType = body.type;
    const email = body.email || body.data?.email;
    const timestamp = new Date(body.created_at || body.data?.created_at || new Date().toISOString());

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

    console.log("[WEBHOOK HANDLER] ⟳ Looking for email with messageId:", messageId);

    // Find email by Resend message ID
    const campaignEmail = await prisma.b2bCampaignEmail.findUnique({
      where: { resendMessageId: messageId },
    });

    if (!campaignEmail) {
      console.warn("[WEBHOOK HANDLER] ✗ No email found for messageId:", messageId);

      // Debug: Show sample of what IDs exist
      const sampleEmails = await prisma.b2bCampaignEmail.findMany({
        take: 5,
        select: {
          id: true,
          resendMessageId: true,
          prospectEmail: true,
          status: true,
          emailSentAt: true,
        },
        orderBy: { emailSentAt: "desc" },
      });
      console.warn("[WEBHOOK HANDLER] Sample emails in DB:", sampleEmails);

      // Check for NULL messageIds
      const nullCount = await prisma.b2bCampaignEmail.count({
        where: { resendMessageId: null },
      });
      if (nullCount > 0) {
        console.error("[WEBHOOK HANDLER] ⚠️  Found", nullCount, "emails with NULL resendMessageId!");
      }

      return NextResponse.json({ received: true, matched: false });
    }

    console.log("[WEBHOOK HANDLER] ✓ Found email:", {
      id: campaignEmail.id,
      prospectEmail: campaignEmail.prospectEmail,
      currentStatus: campaignEmail.status,
    });

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
