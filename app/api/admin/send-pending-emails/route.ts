import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];
const resend = new Resend(process.env.RESEND_API_KEY);

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * FIX #2: Send Pending Emails
 * Finds all unsent b2b_outreach records (resendMessageId IS NULL)
 * Sends them through Resend API
 * Records resendMessageId on success
 */

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { max_batch = 10, dry_run = false } = await request.json();

    if (!process.env.DATABASE_URL || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Services not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Find unsent emails (resendMessageId IS NULL, sent_at IS NOT NULL)
    const unsent = await sql`
      SELECT
        o.id,
        o.lead_id,
        o.subject,
        o.body,
        l.email as lead_email,
        l.business_name,
        o.sent_at
      FROM b2b_outreach o
      JOIN b2b_leads l ON o.lead_id = l.id
      WHERE o.resend_message_id IS NULL
        AND o.sent_at IS NOT NULL
      ORDER BY o.sent_at DESC
      LIMIT ${max_batch}
    `;

    if (!Array.isArray(unsent) || unsent.length === 0) {
      return NextResponse.json({
        status: "no_pending_emails",
        message: "All emails have been sent",
        processed: 0,
      });
    }

    const results = {
      total: unsent.length,
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    // Send each email through Resend
    for (const email of unsent) {
      try {
        // Send via Resend
        const response = await resend.emails.send({
          from: "Saint & Story <noreply@saintandstoryltd.co.uk>",
          to: email.lead_email,
          subject: email.subject,
          html: email.body.replace(/\n/g, "<br />"),
        });

        if (response.error) {
          results.failed++;
          results.details.push({
            id: email.id,
            business: email.business_name,
            status: "failed",
            error: response.error.message,
          });
          console.error(`[send-pending] Failed to send to ${email.lead_email}:`, response.error);
        } else {
          results.sent++;

          // Update b2b_outreach with resendMessageId
          if (!dry_run) {
            await sql`
              UPDATE b2b_outreach
              SET resend_message_id = ${response.id}
              WHERE id = ${email.id}
            `;
          }

          results.details.push({
            id: email.id,
            business: email.business_name,
            status: "sent",
            message_id: response.id,
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          id: email.id,
          business: email.business_name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`[send-pending] Exception sending to ${email.lead_email}:`, error);
      }
    }

    return NextResponse.json({
      status: dry_run ? "dry_run" : "complete",
      summary: {
        total_processed: results.total,
        successfully_sent: results.sent,
        failed: results.failed,
      },
      details: results.details,
      message: dry_run
        ? `DRY RUN: Would send ${results.sent} emails`
        : `Sent ${results.sent}/${results.total} pending emails`,
    });
  } catch (error) {
    console.error("[send-pending-emails] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
