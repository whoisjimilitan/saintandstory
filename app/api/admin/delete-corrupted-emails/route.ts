import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Delete corrupted emails (never sent, have postcodes in subject/body)
 * These emails had resendMessageId = NULL and postcode bugs
 * Safe to delete - were never delivered to Resend
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Delete emails that were never sent (resendMessageId IS NULL)
    const result = await sql`
      DELETE FROM b2b_outreach
      WHERE resend_message_id IS NULL
      RETURNING id, lead_id, subject
    `;

    // Also clean up any orphaned events for those emails
    if (result.length > 0) {
      const outreach_ids = result.map((r: any) => r.id);
      await sql`
        DELETE FROM b2b_email_events
        WHERE outreach_id = ANY(${outreach_ids})
      `;
    }

    return NextResponse.json({
      status: "success",
      message: `Deleted ${result.length} corrupted emails`,
      deleted_count: result.length,
      deleted_emails: result.slice(0, 5).map((r: any) => ({
        id: r.id,
        subject: r.subject,
      })),
    });
  } catch (error) {
    console.error("[delete-corrupted-emails] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
