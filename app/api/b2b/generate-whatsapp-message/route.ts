import { NextRequest, NextResponse } from "next/server";
import {
  generateWhatsAppMessage,
  validateMessage,
  WhatsAppMessageContext
} from "@/lib/whatsapp-message-generator";

/**
 * POST /api/b2b/generate-whatsapp-message
 *
 * Generates a WhatsApp message for B2B outreach using psychology-locked framework.
 *
 * REQUEST BODY:
 * {
 *   "firstName": string (required)
 *   "groupName": string (required)
 *   "description"?: string (their role/background - optional)
 *   "businessType"?: string (industry hint - optional)
 *   "maxChars"?: number (default 180)
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "message": string
 *   "charCount": number
 *   "strategy": "ai_personalized" | "template" | "generic"
 *   "isValid": boolean
 *   "askPresent": boolean (should always be false)
 *   "questionMarkAtEnd": boolean (should always be false)
 * }
 */

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP MESSAGE] Generating message...");

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.groupName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: firstName, groupName"
        },
        { status: 400 }
      );
    }

    const context: WhatsAppMessageContext = {
      firstName: body.firstName,
      groupName: body.groupName,
      description: body.description,
      businessType: body.businessType,
      maxChars: body.maxChars || 180
    };

    // Generate message
    const message = await generateWhatsAppMessage(context);

    // Validate psychology framework
    const isValid = validateMessage(message);

    console.log(`[WHATSAPP MESSAGE] Generated: "${message.message}"`);
    console.log(`[WHATSAPP MESSAGE] Valid: ${isValid}, Chars: ${message.charCount}/${message.maxChars || 180}`);
    console.log(`[WHATSAPP MESSAGE] Ask present: ${message.askPresent}, Question at end: ${message.questionMarkAtEnd}`);

    // Create audit event
    try {
      await fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "whatsapp_message_generated",
          details: {
            firstName: context.firstName,
            groupName: context.groupName,
            message: message.message,
            charCount: message.charCount,
            strategy: message.strategy,
            isValid
          }
        })
      }).catch(() => {
        // Silently fail audit logging
      });
    } catch (auditError) {
      // Continue even if audit logging fails
    }

    return NextResponse.json({
      success: true,
      message: message.message,
      charCount: message.charCount,
      maxChars: message.maxChars || 180,
      strategy: message.strategy,
      isValid,
      askPresent: message.askPresent,
      questionMarkAtEnd: message.questionMarkAtEnd,
      warnings: !isValid ? ["Message does not meet psychology validation criteria"] : []
    });
  } catch (error) {
    console.error("[WHATSAPP MESSAGE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate message",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
