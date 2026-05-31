import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const BASE_URL = "https://saintandstoryltd.co.uk";
const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];

// GET — driver clicks Accept/Decline link from email (no login needed)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || !["accept", "decline"].includes(action ?? "")) {
    return NextResponse.redirect(`${BASE_URL}/?error=invalid_link`);
  }

  const sql = neon(process.env.DATABASE_URL!);

  const jobRows = await sql`
    SELECT j.*, d.full_name as driver_name, d.email as driver_email, d.phone as driver_phone
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.tracking_token = ${token}
    LIMIT 1
  `;

  const job = jobRows[0];
  if (!job) return NextResponse.redirect(`${BASE_URL}/?error=job_not_found`);

  if (job.status !== "offered") {
    // Already responded — redirect with appropriate message
    return NextResponse.redirect(`${BASE_URL}/job-response?status=already_responded`);
  }

  if (action === "accept") {
    await sql`
      UPDATE jobs SET status = 'confirmed', updated_at = NOW()
      WHERE tracking_token = ${token}
    `;
    await notifyCustomerConfirmed(job);
    await notifyAdminConfirmed(job);
    return NextResponse.redirect(`${BASE_URL}/job-response?status=accepted`);
  }

  if (action === "decline") {
    // Return job to pending — admin needs to reassign
    await sql`
      UPDATE jobs SET driver_id = NULL, status = 'pending_review', updated_at = NOW()
      WHERE tracking_token = ${token}
    `;
    await notifyAdminDeclined(job);
    return NextResponse.redirect(`${BASE_URL}/job-response?status=declined`);
  }

  return NextResponse.redirect(`${BASE_URL}/`);
}

// POST — driver responds via dashboard UI
export async function POST(request: NextRequest) {
  const { jobId, driverId, action } = await request.json();
  if (!jobId || !driverId || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  const jobRows = await sql`
    SELECT j.*, d.full_name as driver_name, d.email as driver_email
    FROM jobs j
    LEFT JOIN drivers d ON d.id = j.driver_id
    WHERE j.id = ${jobId} AND j.driver_id = ${driverId}
    LIMIT 1
  `;

  const job = jobRows[0];
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  if (action === "accept") {
    await sql`UPDATE jobs SET status = 'confirmed', updated_at = NOW() WHERE id = ${jobId}`;
    await notifyCustomerConfirmed(job);
    await notifyAdminConfirmed(job);
  } else {
    await sql`UPDATE jobs SET driver_id = NULL, status = 'pending_review', updated_at = NOW() WHERE id = ${jobId}`;
    await notifyAdminDeclined(job);
  }

  return NextResponse.json({ success: true });
}

async function notifyCustomerConfirmed(job: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !job.customer_email) return;
  const resend = new Resend(resendKey);
  const customerName = (job.customer_name as string)?.split(" ")[0] || "there";
  const driverName = (job.driver_name as string) || "your driver";
  const trackingUrl = `${BASE_URL}/track/${job.tracking_token as string}`;

  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: job.customer_email as string,
    subject: "Your driver is confirmed",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#0D0D0D;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Your driver is confirmed.</p>
        </div>
        <p style="color:#0D0D0D;font-size:16px;font-weight:700;margin-bottom:4px;">Hi ${customerName},</p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">
          Great news — <strong>${driverName}</strong> has confirmed your job.
          ${job.driver_phone ? `They'll be in touch on <strong>${job.driver_phone as string}</strong> to finalise the details.` : "They'll be in touch shortly to confirm the details."}
        </p>
        <a href="${trackingUrl}" style="display:inline-block;background:#0D0D0D;color:#fff;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:24px;">
          Track your booking →
        </a>
        <p style="color:#888;font-size:13px;">Questions? Call us on <a href="tel:02082344444" style="color:#0D0D0D;">0208 234 4444</a>.</p>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e8e8e8;">
          <p style="color:#bbb;font-size:11px;margin:0;">Saint &amp; Story Ltd · London</p>
        </div>
      </div>
    `,
  });
}

async function notifyAdminConfirmed(job: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: ADMIN_EMAILS,
    subject: `✓ Job confirmed — ${job.reference as string}`,
    html: `<p><strong>${job.driver_name as string}</strong> accepted job <strong>${job.reference as string}</strong> (${job.postcode_from as string}${job.postcode_to ? ` → ${job.postcode_to as string}` : ""}). Customer has been notified.</p>`,
  });
}

async function notifyAdminDeclined(job: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: ADMIN_EMAILS,
    subject: `⚠ Driver declined — ${job.reference as string} needs reassignment`,
    html: `<p><strong>${job.driver_name as string}</strong> declined job <strong>${job.reference as string}</strong> (${job.postcode_from as string}${job.postcode_to ? ` → ${job.postcode_to as string}` : ""}). Please reassign at <a href="${BASE_URL}/dashboard/admin">dashboard/admin</a>.</p>`,
  });
}
