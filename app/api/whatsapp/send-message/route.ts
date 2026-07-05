import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];
const META_API_VERSION = "v18.0";
const META_GRAPH_URL = "https://graph.instagram.com";

/**
 * POST /api/whatsapp/send-message
 *
 * Send a WhatsApp message to a prospect
 *
 * REQUEST BODY:
 * {
 *   "leadId": "uuid",              // Prospect ID in database
 *   "message": "Hello there!",     // Message text (max 4096 chars)
 *   "campaignId": "optional-id"    // Link to campaign if sending bulk
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean,
 *   "messageId": "wamid_xxx",      // Meta's message ID
 *   "leadId": "uuid",
 *   "status": "sent|error",
 *   "sentAt": ISO timestamp,
 *   "error": "error message if failed"
 * }
 */

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP SEND] Starting message send");

  // Auth check
  const email = request.headers.get("x-admin-email");
  if (!email || !ADMIN_EMAILS.includes(email)) {
    console.log("[WHATSAPP SEND] ✗ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { leadId, message, campaignId } = body;

    // Validate input
    if (!leadId || !message) {
      return NextResponse.json(
        { error: "leadId and message are required" },
        { status: 400 }
      );
    }

    if (message.length > 4096) {
      return NextResponse.json(
        { error: "Message exceeds 4096 character limit" },
        { status: 400 }
      );
    }

    console.log(`[WHATSAPP SEND] Sending to lead: ${leadId}`);

    // Get lead phone number
    const lead = await prisma.b2bLead.findUnique({
      where: { id: leadId as string },
      select: { phone: true, businessName: true },
    });

    if (!lead || !lead.phone) {
      console.log(`[WHATSAPP SEND] ✗ Lead not found or no phone: ${leadId}`);
      return NextResponse.json(
        { error: "Lead not found or has no phone number" },
        { status: 404 }
      );
    }

    // Normalize phone number (remove +, spaces, dashes)
    const phoneNumber = lead.phone.replace(/[\D]/g, "");
    if (phoneNumber.length < 10) {
      console.log(`[WHATSAPP SEND] ✗ Invalid phone number: ${lead.phone}`);
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Get credentials from env
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      console.error("[WHATSAPP SEND] ✗ Missing credentials in env");
      return NextResponse.json(
        { error: "WhatsApp not configured" },
        { status: 500 }
      );
    }

    // Call Meta WhatsApp API
    const metaUrl = `${META_GRAPH_URL}/${META_API_VERSION}/${phoneNumberId}/messages`;
    console.log(`[WHATSAPP SEND] Calling Meta API: ${metaUrl}`);

    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: message,
        },
      }),
    });

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error(
        `[WHATSAPP SEND] ✗ Meta API error: ${metaResponse.status}`,
        metaData
      );

      // Store failed message attempt
      await prisma.b2bConversationEvent.create({
        data: {
          leadId: leadId as string,
          type: "whatsapp",
          direction: "outbound",
          subject: "Message send failed",
          body: message,
          metadata: {
            error: metaData.error?.message || "Unknown error",
            phoneNumber: lead.phone,
            campaignId,
          },
        },
      });

      return NextResponse.json(
        {
          success: false,
          leadId,
          status: "error",
          error: metaData.error?.message || "Failed to send message",
        },
        { status: 400 }
      );
    }

    const messageId = metaData.messages?.[0]?.id;
    if (!messageId) {
      console.error("[WHATSAPP SEND] ✗ No message ID in Meta response");
      return NextResponse.json(
        { error: "No message ID returned from Meta" },
        { status: 500 }
      );
    }

    console.log(`[WHATSAPP SEND] ✓ Message sent: ${messageId}`);

    // Store message in database
    const conversationEvent = await prisma.b2bConversationEvent.create({
      data: {
        leadId: leadId as string,
        type: "whatsapp",
        direction: "outbound",
        subject: "WhatsApp Message Sent",
        body: message,
        metadata: {
          messageId,
          phoneNumber: lead.phone,
          businessName: lead.businessName,
          campaignId,
          status: "sent",
        },
      },
    });

    // Update lead engagement tracking
    await prisma.b2bLead.update({
      where: { id: leadId as string },
      data: {
        last_engagement_at: new Date(),
        last_engagement_type: "whatsapp",
        engaged_today: true,
      },
    });

    console.log(
      `[WHATSAPP SEND] ✓ Stored in DB: ${conversationEvent.id}`
    );

    return NextResponse.json({
      success: true,
      messageId,
      leadId,
      status: "sent",
      sentAt: new Date().toISOString(),
      businessName: lead.businessName,
    });
  } catch (error) {
    console.error("[WHATSAPP SEND] ✗ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
