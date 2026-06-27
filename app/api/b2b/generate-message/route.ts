import { NextRequest, NextResponse } from "next/server";
import {
  generateOutreachMessage,
  OutreachContext,
  OutreachMessage
} from "@/lib/outreach-message-generator";

/**
 * POST /api/b2b/generate-message
 *
 * Unified message generator for ALL outreach channels.
 * Auto-detects best strategy based on available data.
 *
 * REQUEST BODY (flexible):
 * {
 *   "firstName"?: string
 *   "lastName"?: string
 *   "email"?: string
 *   "phoneNumber"?: string
 *   "groupName"?: string (WhatsApp group / Facebook group)
 *   "company"?: string (for email)
 *   "linkedinProfile"?: string (for LinkedIn)
 *   "description"?: string (their role/background)
 *   "businessType"?: string
 *   "maxChars"?: number (default 180)
 * }
 *
 * STRATEGY AUTO-DETECTION:
 * - LinkedIn profile + firstName → LinkedIn strategy
 * - Email + company + firstName → Email strategy
 * - Description + groupName + firstName → AI Personalized (Facebook)
 * - GroupName + firstName → Template (WhatsApp)
 * - Phone/name minimal → Generic fallback
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "message": string
 *   "charCount": number
 *   "strategy": "ai_personalized" | "template" | "email" | "linkedin" | "generic"
 *   "channel": "whatsapp" | "email" | "linkedin" | "sms"
 *   "isValid": boolean
 *   "psychology": {
 *     "acknowledgesContext": boolean
 *     "identifiesProblem": boolean
 *     "introducesExpertise": boolean
 *     "noSalesPressure": boolean
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const context: OutreachContext = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phoneNumber: body.phoneNumber,
      groupName: body.groupName,
      company: body.company,
      linkedinProfile: body.linkedinProfile,
      description: body.description,
      businessType: body.businessType,
      maxChars: body.maxChars || 180
    };

    // Generate message
    const message = await generateOutreachMessage(context);

    console.log(`[UNIFIED MESSAGE] Strategy: ${message.strategy}, Channel: ${message.channel}`);
    console.log(`[UNIFIED MESSAGE] Message: "${message.message}"`);
    console.log(`[UNIFIED MESSAGE] Valid: ${message.isValid}`);
    console.log(`[UNIFIED MESSAGE] Psychology checks:`, message.psychology);

    // Audit logging
    try {
      await fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unified_message_generated",
          details: {
            strategy: message.strategy,
            channel: message.channel,
            message: message.message,
            charCount: message.charCount,
            isValid: message.isValid,
            psychology: message.psychology
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
      channel: message.channel,
      isValid: message.isValid,
      psychology: message.psychology,
      askPresent: message.askPresent,
      questionMarkAtEnd: message.questionMarkAtEnd,
      warnings: !message.isValid ? ["Message does not meet psychology validation criteria"] : []
    });
  } catch (error) {
    console.error("[UNIFIED MESSAGE] Error:", error);
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
