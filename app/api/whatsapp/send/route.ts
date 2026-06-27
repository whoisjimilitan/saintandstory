import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  addMessage,
  markMessageDelivered,
  getConversation,
} from "@/lib/whatsapp-conversation";

/**
 * POST /api/whatsapp/send
 *
 * Send WhatsApp message
 *
 * REQUEST BODY:
 * {
 *   "conversationId": string
 *   "phoneNumber": string
 *   "message": string
 *   "businessName": string
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "messageId": string
 *   "status": "sent" | "delivered" | "error"
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
  console.log("[WHATSAPP SEND] Starting message send");

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
    const { conversationId, phoneNumber, message, businessName } = body;

    if (!conversationId || !phoneNumber || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get conversation
    const conversation = getConversation(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Add message to conversation
    const addedMessage = addMessage(conversationId, message, "user", "sent");
    if (!addedMessage) {
      return NextResponse.json(
        { error: "Failed to add message" },
        { status: 500 }
      );
    }

    console.log(`[WHATSAPP SEND] Message created: ${addedMessage.id}`);

    // TODO: Send via WhatsApp API
    // For now, mock the send with immediate delivery
    // In production:
    // const response = await whatsappClient.messages.create({
    //   messaging_product: "whatsapp",
    //   recipient_type: "individual",
    //   to: phoneNumber,
    //   type: "text",
    //   text: { body: message }
    // });
    // const whatsappMessageId = response.messages[0].id;

    const whatsappMessageId = `wamid_${Date.now()}`;

    // Mark as delivered (immediately, for mock)
    markMessageDelivered(conversationId, addedMessage.id, whatsappMessageId);

    console.log(
      `[WHATSAPP SEND] ✓ Message sent to ${phoneNumber}: ${whatsappMessageId}`
    );

    // Audit logging
    try {
      await fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "whatsapp_message_sent",
          details: {
            conversationId,
            phoneNumber,
            messageId: addedMessage.id,
            whatsappMessageId,
            businessName,
          },
        }),
      }).catch(() => {
        // Silently fail audit logging
      });
    } catch (auditError) {
      // Continue even if audit logging fails
    }

    return NextResponse.json({
      success: true,
      messageId: addedMessage.id,
      whatsappMessageId,
      status: "delivered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[WHATSAPP SEND] ✗ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 }
    );
  }
}
