import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { triggerAdminRefresh } from "@/lib/triggerAdminRefresh";
import Pusher from "pusher";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { jobId } = await request.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT customer_email, customer_name, reference, status
    FROM jobs
    WHERE id = ${jobId} AND status IN ('pending_review', 'offered', 'assigned', 'confirmed', 'in_progress')
    LIMIT 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Job not found or cannot be cancelled" }, { status: 404 });

  const job = rows[0];
  await sql`UPDATE jobs SET status = 'cancelled', updated_at = NOW() WHERE id = ${jobId}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && job.customer_email) {
    const resend = new Resend(resendKey);
    const name = (job.customer_name as string)?.split(" ")[0] || "there";
    await resend.emails.send({
      from: "Saint & Story <hello@saintandstoryltd.co.uk>",
      to: job.customer_email as string,
      subject: `Your booking has been cancelled — ${job.reference as string}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
          <div style="background:#0D0D0D;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h1>
          </div>
          <p style="color:#0D0D0D;font-size:16px;font-weight:700;margin-bottom:4px;">Hi ${name},</p>
          <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
            Unfortunately your booking (<strong>${job.reference as string}</strong>) has been cancelled. We're sorry for any inconvenience.
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
            If you'd like to rebook or have any questions, please call us on <a href="tel:02034323991" style="color:#0D0D0D;">0203 432 3991</a> or reply to this email.
          </p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8e8e8;">
            <p style="color:#bbb;font-size:11px;margin:0;">Saint &amp; Story Ltd · London · <a href="tel:02034323991" style="color:#bbb;">0203 432 3991</a></p>
          </div>
        </div>
      `,
    });
  }

  // Notify dashboard subscribers of cancellation
  try {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    await pusher.trigger("admin-jobs", "job-cancelled", {
      jobId,
      status: "cancelled",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cancel] Pusher notification failed:", err);
  }

  triggerAdminRefresh("job-cancelled").catch(() => {});
  return NextResponse.json({ success: true });
}
