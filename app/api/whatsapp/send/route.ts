import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  addMessage,
  markMessageDelivered,
  getConversation,
} from "@/lib/whatsapp-conversation";
import { generateOutreachMessage } from "@/lib/outreach-message-generator";

/**
 * POST /api/whatsapp/send
 *
 * Send WhatsApp message with psychology-locked framework
 *
 * REQUEST BODY:
 * {
 *   "conversationId": string
 *   "phoneNumber": string
 *   "message": string (optional - if not provided, will be generated)
 *   "businessName": string
 *   "firstName": string (optional - for message generation)
 *   "description": string (optional - for message generation)
 *   "groupName": string (optional - for message generation)
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "messageId": string
 *   "message": string (the message that was sent)
 *   "strategy": string (which strategy was used)
 *   "status": "sent" | "delivered" | "error"
 *   "timestamp": ISO timestamp
 *   "psychologyValidation": { noAsk: boolean, introPresent: boolean, charLimit: boolean }
 * }
 */

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

// Mock WhatsApp API send (replace with real API when credentials available)

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
    const {
      conversationId,
      phoneNumber,
      message,
      businessName,
      firstName,
      description,
      groupName,
    } = body;

    if (!conversationId || !phoneNumber) {
      return NextResponse.json(
        { error: "conversationId and phoneNumber are required" },
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

    // Generate message if not provided
    let finalMessage = message;
    let strategy = "custom";

    if (!message) {
      console.log("[WHATSAPP SEND] Generating message using psychology framework");
      const generated = generateOutreachMessage({
        firstName: firstName || "there",
        company: businessName,
        description,
        groupName,
        linkedinProfile: undefined,
        email: undefined,
      });

      finalMessage = generated.message;
      strategy = generated.strategy;

      // Validate psychology framework
      if (!generated.psychologyValidation.noAsk) {
        console.warn("[WHATSAPP SEND] ⚠️ Message contains 'Worth a chat?' - fixing");
        finalMessage = finalMessage.replace(/Worth a chat\?/g, "").trim();
      }

      console.log(
        `[WHATSAPP SEND] Generated message via ${strategy}: "${finalMessage.substring(0, 50)}..."`
      );
    }

    // Add message to conversation
    const addedMessage = addMessage(conversationId, finalMessage, "user", "sent");
    if (!addedMessage) {
      return NextResponse.json(
        { error: "Failed to add message" },
        { status: 500 }
      );
    }

    console.log(`[WHATSAPP SEND] Message created: ${addedMessage.id}`);

    // Mock WhatsApp API send (replace with real API when credentials available)
    const whatsappMessageId = `wamid_${Date.now()}`;

    // Mark as delivered
    markMessageDelivered(conversationId, addedMessage.id, whatsappMessageId);

    console.log(
      `[WHATSAPP SEND] ✓ Message sent to ${phoneNumber} via ${strategy}`
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
            strategy,
            message: finalMessage,
          },
        }),
      }).catch(() => {
        // Silently fail
      });
    } catch (auditError) {
      // Continue
    }

    return NextResponse.json({
      success: true,
      messageId: addedMessage.id,
      message: finalMessage,
      strategy,
      whatsappMessageId,
      status: "delivered",
      timestamp: new Date().toISOString(),
      psychologyValidation: {
        noAsk: !finalMessage.includes("Worth a chat?"),
        introPresent: finalMessage.includes("I") || finalMessage.includes("we"),
        charLimit: finalMessage.length <= 180,
      },
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
