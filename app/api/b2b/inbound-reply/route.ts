/**
 * Inbound Email Reply Handler
 *
 * Receives email replies from Resend webhook
 * Parses reply text for YES/MAYBE/NO sentiment
 * Stores response and tags prospect
 *
 * Resend sends: {
 *   type: "email.replied",
 *   created_at: "2026-06-24T10:00:00Z",
 *   data: {
 *     email_id: "abc123",
 *     from: "prospect@company.com",
 *     to: "hello@saintandstoryltd.co.uk",
 *     subject: "Re: Your delivery question",
 *     text: "YES, this looks great!",
 *     html: "<p>YES, this looks great!</p>"
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { prisma } from "@/lib/prisma";

type ResponseType = "YES" | "MAYBE" | "NO";

// Simple keyword detection for response type
function detectResponseType(text: string): ResponseType {
  if (!text || typeof text !== "string") return "NO";

  const lower = text.toLowerCase().trim();

  // YES indicators
  const yesWords = ["yes", "yep", "yeah", "absolutely", "definitely", "great", "perfect", "interested", "keen", "count me in", "let's"];
  if (yesWords.some(word => lower.includes(word))) {
    return "YES";
  }

  // NO indicators
  const noWords = ["no", "nope", "no thanks", "not interested", "pass", "decline", "sorry", "can't"];
  if (noWords.some(word => lower.includes(word))) {
    return "NO";
  }

  // MAYBE indicators
  const maybeWords = ["maybe", "might", "could", "possibly", "perhaps", "depends", "let me", "need to", "more info", "tell me more"];
  if (maybeWords.some(word => lower.includes(word))) {
    return "MAYBE";
  }

  // Default: if they replied at all, it's at least a MAYBE
  return "MAYBE";
}

// Extract summary from reply (first 200 chars)
function extractSummary(text: string): string {
  if (!text) return "";
  return text.substring(0, 200).trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate Resend webhook format
    if (body.type !== "email.replied") {
      console.log("[INBOUND REPLY] Ignoring non-reply event:", body.type);
      return NextResponse.json({ received: true });
    }

    const { created_at, data } = body;
    const { email_id, from: fromEmail, text, html } = data || {};

    if (!email_id || !fromEmail) {
      console.warn("[INBOUND REPLY] Missing email_id or from address");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`[INBOUND REPLY] Processing reply from ${fromEmail} for message ${email_id}`);

    // Get reply text (prefer plain text, fall back to HTML)
    const replyText = text || html || "";
    const responseType = detectResponseType(replyText);
    const summary = extractSummary(replyText);

    const sql = neon(process.env.DATABASE_URL!);

    // Find the original outreach record by email_id
    const outreachRecords = await sql`
      SELECT o.id, o.lead_id, l.business_name, l.email
      FROM b2b_outreach o
      JOIN b2b_leads l ON o.lead_id = l.id
      WHERE o.resend_message_id = ${email_id}
      LIMIT 1
    `;

    if (!outreachRecords || outreachRecords.length === 0) {
      console.warn(`[INBOUND REPLY] No outreach record found for email_id: ${email_id}`);
      return NextResponse.json({ matched: false, received: true });
    }

    const outreach = outreachRecords[0];
    const leadId = outreach.lead_id as string;
    const outreachId = outreach.id as string;

    // Store the response
    const now = new Date();

    // Create or update response record
    try {
      // First, try to find existing response for this outreach
      const existingResponse = await sql`
        SELECT id FROM b2b_responses
        WHERE outreach_id = ${outreachId}
        LIMIT 1
      `;

      if (existingResponse && existingResponse.length > 0) {
        // Update existing response
        await sql`
          UPDATE b2b_responses
          SET
            response_type = ${responseType},
            response_body = ${replyText},
            response_summary = ${summary},
            responded_at = ${now.toISOString()},
            updated_at = NOW()
          WHERE outreach_id = ${outreachId}
        `;

        console.log(`[INBOUND REPLY] Updated response for outreach ${outreachId}`);
      } else {
        // Create new response record
        await sql`
          INSERT INTO b2b_responses (
            outreach_id,
            lead_id,
            response_type,
            response_body,
            response_summary,
            responded_at,
            created_at
          ) VALUES (
            ${outreachId},
            ${leadId},
            ${responseType},
            ${replyText},
            ${summary},
            ${now.toISOString()},
            NOW()
          )
        `;

        console.log(`[INBOUND REPLY] Created response for outreach ${outreachId}`);
      }
    } catch (dbError) {
      console.error("[INBOUND REPLY] Error storing response:", dbError);
      // Continue anyway - try to update lead
    }

    // Update outreach record (mark as replied)
    try {
      await sql`
        UPDATE b2b_outreach
        SET
          replied = true,
          replied_at = ${now.toISOString()},
          response_type = ${responseType}
        WHERE id = ${outreachId}
      `;
    } catch (err) {
      console.error("[INBOUND REPLY] Error updating outreach:", err);
    }

    // Update lead status based on response
    try {
      const newStatus = responseType === "YES" ? "warm" : responseType === "MAYBE" ? "contacted" : "cold";
      const newLeadState = responseType === "YES" ? "engaged" : "recognized";

      await prisma.b2bLead.update({
        where: { id: leadId },
        data: {
          status: newStatus,
          leadState: newLeadState,
          last_engagement_at: now,
          notes: `${replyText || ""}${replyText ? "\n" : ""}[RESPONSE] ${responseType} at ${now.toISOString()}`,
        },
      });
    } catch (err) {
      console.error("[INBOUND REPLY] Error updating lead:", err);
    }

    console.log(`[INBOUND REPLY] ✅ Processed reply: ${responseType} from ${outreach.business_name}`);

    return NextResponse.json({
      success: true,
      matched: true,
      leadId,
      responseType,
      summary,
      fromEmail,
    });
  } catch (error) {
    console.error("[INBOUND REPLY] Error processing inbound reply:", error);
    return NextResponse.json(
      {
        error: "Failed to process inbound reply",
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
    endpoint: "/api/b2b/inbound-reply",
    description: "Receives email replies from Resend webhook",
    expected_format: {
      type: "email.replied",
      data: {
        email_id: "message_id_from_resend",
        from: "prospect@company.com",
        text: "YES - this works for us!",
      },
    },
  });
}
