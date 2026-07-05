import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";

/**
 * Verify webhook signature from Meta
 */
function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) {
    console.log("[WHATSAPP WEBHOOK] ✗ No signature provided");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", APP_SECRET)
    .update(body)
    .digest("hex");

  const expected = `sha256=${hash}`;
  const isValid = expected === signature;

  console.log(
    `[WHATSAPP WEBHOOK] Signature verification: ${isValid ? "✓" : "✗"}`
  );
  return isValid;
}

/**
 * GET - Webhook verification from Meta
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("[WHATSAPP WEBHOOK] GET verification request");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WHATSAPP WEBHOOK] ✓ Webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  console.log("[WHATSAPP WEBHOOK] ✗ Webhook verification failed");
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST - Receive messages from Meta WhatsApp Cloud API
 */
export async function POST(request: NextRequest) {
  console.log("[WHATSAPP WEBHOOK] Received POST");

  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Verify signature
    if (!verifyWebhookSignature(body, signature)) {
      console.log("[WHATSAPP WEBHOOK] ✗ Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    console.log("[WHATSAPP WEBHOOK] ✓ Signature verified");

    // Check if this is a message event
    if (!data.entry || !data.entry[0]?.changes) {
      console.log("[WHATSAPP WEBHOOK] No message data in payload");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const changes = data.entry[0].changes[0];
    if (!changes?.value?.messages) {
      console.log("[WHATSAPP WEBHOOK] No messages in changes");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const messages = changes.value.messages;
    const contacts = changes.value.contacts || [];

    console.log(`[WHATSAPP WEBHOOK] Processing ${messages.length} message(s)`);

    // Process each message
    for (const message of messages) {
      const phoneNumber = message.from;
      const messageId = message.id;
      const timestamp = new Date(parseInt(message.timestamp) * 1000);
      const text = message.text?.body || "[Non-text message]";
      const senderName = contacts[0]?.profile?.name || "Unknown";

      console.log(
        `[WHATSAPP WEBHOOK] Message from ${phoneNumber} (${senderName}): "${text.substring(0, 50)}..."`
      );

      // Find the lead by phone number or create conversation event
      const lead = await prisma.b2bLead.findFirst({
        where: {
          phone: phoneNumber,
        },
      });

      if (lead) {
        // Store as conversation event
        await prisma.b2bConversationEvent.create({
          data: {
            leadId: lead.id,
            type: "whatsapp",
            direction: "inbound",
            subject: `Message from ${senderName}`,
            body: text,
            metadata: {
              messageId,
              phoneNumber,
              senderName,
              rawTimestamp: message.timestamp,
            },
          },
        });

        // Update lead's last engagement
        await prisma.b2bLead.update({
          where: { id: lead.id },
          data: {
            last_engagement_at: timestamp,
            last_engagement_type: "whatsapp",
            engaged_today: true,
          },
        });

        console.log(
          `[WHATSAPP WEBHOOK] ✓ Stored message for lead: ${lead.businessName}`
        );
      } else {
        console.log(
          `[WHATSAPP WEBHOOK] ⚠️ No lead found for phone: ${phoneNumber}`
        );
      }
    }

    return NextResponse.json(
      { success: true, message: "Messages processed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[WHATSAPP WEBHOOK] ✗ Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
