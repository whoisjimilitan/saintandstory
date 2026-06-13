import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Jimi at Saint & Story <hello@saintandstoryltd.co.uk>";

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  // Verify cron secret if set
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    console.log("[FOLLOW-UP] Starting scheduled follow-up cycle");

    const now = new Date().toISOString();
    let sentCount = 0;
    const errors: string[] = [];

    // Find all pending follow-ups that should be sent now
    const pendingFollowUps = await sql`
      SELECT
        o.id,
        o.lead_id,
        o.subject,
        o.body,
        o.follow_up_1_at,
        o.follow_up_2_at,
        o.replied,
        l.email,
        l.business_name
      FROM b2b_outreach o
      JOIN b2b_leads l ON o.lead_id = l.id
      WHERE
        o.replied = false
        AND l.email IS NOT NULL
        AND (
          (o.follow_up_1_at IS NOT NULL AND o.follow_up_1_at <= ${now} AND o.follow_up_1_at > CURRENT_TIMESTAMP - INTERVAL '1 hour')
          OR
          (o.follow_up_2_at IS NOT NULL AND o.follow_up_2_at <= ${now} AND o.follow_up_2_at > CURRENT_TIMESTAMP - INTERVAL '1 hour')
        )
      LIMIT 20
    `;

    for (const outreach of pendingFollowUps) {
      try {
        const isFollowUp1 = outreach.follow_up_1_at && new Date(outreach.follow_up_1_at) <= new Date(now);
        const followUpNumber = isFollowUp1 ? 1 : 2;
        const subject = `${outreach.subject} (follow-up ${followUpNumber})`;

        console.log(`[FOLLOW-UP] Sending follow-up ${followUpNumber} to ${outreach.business_name}`);

        // Send follow-up email
        const { error } = await resend.emails.send({
          from: FROM,
          to: outreach.email,
          subject,
          text: outreach.body,
        });

        if (error) {
          errors.push(`${outreach.business_name}: ${error.message}`);
          continue;
        }

        // Mark in outreach history which follow-up was sent
        const columnToUpdate = isFollowUp1 ? "follow_up_1_at" : "follow_up_2_at";

        // Log the follow-up attempt in a separate follow-up record (new row)
        await sql`
          INSERT INTO b2b_outreach (
            lead_id, subject, body, sent_at, email_type
          ) VALUES (
            ${outreach.lead_id},
            ${subject},
            ${outreach.body},
            NOW(),
            ${`follow_up_${followUpNumber}`}
          )
        `;

        sentCount++;
        console.log(`[FOLLOW-UP] ✓ Follow-up ${followUpNumber} sent to ${outreach.business_name}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${outreach.business_name}: ${errorMsg}`);
        console.error(`[FOLLOW-UP] ✗ Error sending follow-up:`, error);
      }
    }

    console.log(`[FOLLOW-UP] Cycle complete: ${sentCount} follow-ups sent, ${errors.length} errors`);

    return NextResponse.json({
      success: errors.length === 0,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[FOLLOW-UP] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/b2b/send-follow-ups",
    description: "Send scheduled follow-up emails",
  });
}
