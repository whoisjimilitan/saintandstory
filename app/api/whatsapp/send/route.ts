import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const META_API_VERSION = "v18.0";
const META_GRAPH_URL = "https://graph.instagram.com";

/**
 * POST /api/whatsapp/send
 *
 * Send WhatsApp message via Meta Cloud API (REAL - not mocked)
 *
 * REQUEST BODY:
 * {
 *   "phoneNumber": string (e.g., "1234567890")
 *   "message": string
 *   "businessName": string (optional - for logging)
 *   "leadId": string (optional - link to database)
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "messageId": string (Meta message ID)
 *   "status": "sent" | "error"
 *   "timestamp": ISO timestamp
 * }
 */

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP SEND] Starting real WhatsApp send via Meta API");

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    console.log("[WHATSAPP SEND] ✗ Not authenticated");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    console.log("[WHATSAPP SEND] ✗ Not authorized");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[WHATSAPP SEND] ✓ Auth passed");

  try {
    const body = await request.json();
    const { phoneNumber, message, businessName, leadId } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "phoneNumber and message are required" },
        { status: 400 }
      );
    }

    if (message.length > 4096) {
      return NextResponse.json(
        { error: "Message exceeds 4096 character limit" },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/[\D]/g, "");
    if (normalizedPhone.length < 10) {
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
        to: normalizedPhone,
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

      // Store failed send attempt if leadId provided
      if (leadId) {
        await prisma.b2bConversationEvent.create({
          data: {
            leadId,
            type: "whatsapp",
            direction: "outbound",
            subject: "Message send failed",
            body: message,
            metadata: {
              error: metaData.error?.message || "Unknown error",
              phoneNumber,
              businessName,
            },
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
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

    console.log(`[WHATSAPP SEND] ✓ Message sent: ${messageId} to ${normalizedPhone}`);

    // Store message in database if leadId provided
    if (leadId) {
      const conversationEvent = await prisma.b2bConversationEvent.create({
        data: {
          leadId,
          type: "whatsapp",
          direction: "outbound",
          subject: "WhatsApp Message Sent",
          body: message,
          metadata: {
            messageId,
            phoneNumber,
            businessName,
            status: "sent",
          },
        },
      });

      // Update lead engagement
      await prisma.b2bLead.update({
        where: { id: leadId },
        data: {
          last_engagement_at: new Date(),
          last_engagement_type: "whatsapp",
          engaged_today: true,
        },
      });

      console.log(
        `[WHATSAPP SEND] ✓ Stored in DB: ${conversationEvent.id}`
      );
    }

    return NextResponse.json({
      success: true,
      messageId,
      status: "sent",
      timestamp: new Date().toISOString(),
      businessName,
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
