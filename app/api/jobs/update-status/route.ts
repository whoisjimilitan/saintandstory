import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const BASE_URL = "https://saintandstoryltd.co.uk";
const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oyedeleoyepeju2014@gmail.com"];

const VALID_TRANSITIONS: Record<string, string> = {
  confirmed: "in_progress",
  in_progress: "completed",
};

async function notifyCustomerEnRoute(job: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !job.customer_email) return;
  const resend = new Resend(resendKey);
  const name = (job.customer_name as string)?.split(" ")[0] || "there";
  const driverName = (job.driver_name as string) || "Your driver";

  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: job.customer_email as string,
    subject: `${driverName} is on the way`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#0D0D0D;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Your job is in progress.</p>
        </div>
        <p style="color:#0D0D0D;font-size:16px;font-weight:700;margin-bottom:4px;">Hi ${name},</p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
          <strong>${driverName}</strong> has started your job and is on the way.
        </p>
        <a href="${BASE_URL}/track/${job.tracking_token as string}" style="display:inline-block;background:#0D0D0D;color:#fff;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:24px;">
          Track your job →
        </a>
        <p style="color:#888;font-size:13px;">Questions? Call <a href="tel:02082344444" style="color:#0D0D0D;">0208 234 4444</a></p>
      </div>
    `,
  });
}

async function notifyCustomerComplete(job: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !job.customer_email) return;
  const resend = new Resend(resendKey);
  const name = (job.customer_name as string)?.split(" ")[0] || "there";
  const driverName = (job.driver_name as string) || "your driver";
  const ratingUrl = `${BASE_URL}/rate/${job.tracking_token as string}`;

  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: job.customer_email as string,
    subject: "Job complete — how did it go?",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#0D0D0D;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Your job is complete.</p>
        </div>
        <p style="color:#0D0D0D;font-size:16px;font-weight:700;margin-bottom:4px;">Hi ${name},</p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:8px;">
          Your job with <strong>${driverName}</strong> is done. We hope it went smoothly.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
          Takes 10 seconds — how did they do?
        </p>
        <a href="${ratingUrl}" style="display:inline-block;background:#0D0D0D;color:#fff;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:12px;">
          ★ Rate ${driverName} →
        </a>
        <p style="color:#bbb;font-size:12px;margin-top:8px;">Your rating helps other customers choose with confidence.</p>
        <div style="margin-top:28px;padding:20px 24px;background:#F5F5F5;border-radius:10px;border:1px solid #e8e8e8;">
          <p style="margin:0 0 6px;color:#0D0D0D;font-size:13px;font-weight:600;">Know someone who needs to move?</p>
          <p style="margin:0;color:#888;font-size:13px;">Share <a href="${BASE_URL}" style="color:#0D0D0D;font-weight:600;">saintandstoryltd.co.uk</a> — fixed price, verified driver, done properly.</p>
        </div>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8e8e8;">
          <p style="color:#bbb;font-size:11px;margin:0;">Saint &amp; Story Ltd · London · <a href="tel:02082344444" style="color:#bbb;">0208 234 4444</a></p>
        </div>
      </div>
    `,
  });
}

async function notifyAdminComplete(job: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const resend = new Resend(resendKey);
  const price = job.price ? `£${Number(job.price).toFixed(0)}` : "price TBC";
  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: ADMIN_EMAILS,
    subject: `✓ Job completed — ${job.reference as string} · ${price}`,
    html: `<p><strong>${job.driver_name as string}</strong> completed job <strong>${job.reference as string}</strong> (${job.postcode_from as string}${job.postcode_to ? ` → ${job.postcode_to as string}` : ""}) · ${price}. Rating request sent to customer.</p>`,
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, newStatus } = await request.json();
  if (!jobId || !newStatus) return NextResponse.json({ error: "jobId and newStatus required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  const jobRows = await sql`
    SELECT j.*, d.full_name as driver_name, d.id as driver_db_id
    FROM jobs j
    JOIN drivers d ON d.id = j.driver_id
    WHERE j.id = ${jobId} AND d.clerk_user_id = ${userId}
    LIMIT 1
  `;

  const job = jobRows[0];
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const expectedNew = VALID_TRANSITIONS[job.status as string];
  if (expectedNew !== newStatus) {
    return NextResponse.json({ error: `Cannot transition from ${job.status} to ${newStatus}` }, { status: 400 });
  }

  await sql`UPDATE jobs SET status = ${newStatus}, updated_at = NOW() WHERE id = ${jobId}`;

  if (newStatus === "in_progress") {
    await notifyCustomerEnRoute(job);
  }

  if (newStatus === "completed") {
    // Auto-create earnings record if job has a price
    if (job.price) {
      await sql`
        INSERT INTO earnings (driver_id, job_id, amount, status)
        VALUES (${job.driver_db_id as string}, ${jobId}, ${Number(job.price)}, 'pending')
        ON CONFLICT DO NOTHING
      `;
    }
    await Promise.all([
      notifyCustomerComplete(job),
      notifyAdminComplete(job),
    ]);
  }

  return NextResponse.json({ success: true, newStatus });
}
