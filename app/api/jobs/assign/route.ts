import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oyedeleoyepeju2014@gmail.com"];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];
const BASE_URL = "https://saintandstoryltd.co.uk";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmail = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(adminEmail) && !ADMIN_USER_IDS.includes(userId ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { jobId, driverId, price } = await request.json();
  if (!jobId || !driverId) return NextResponse.json({ error: "jobId and driverId required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  // Get job and driver details
  const [jobRows, driverRows] = await Promise.all([
    sql`SELECT * FROM jobs WHERE id = ${jobId} LIMIT 1`,
    sql`SELECT * FROM drivers WHERE id = ${driverId} LIMIT 1`,
  ]);

  const job = jobRows[0];
  const driver = driverRows[0];

  if (!job || !driver) return NextResponse.json({ error: "Job or driver not found" }, { status: 404 });

  // Assign driver — status moves to 'offered'
  await sql`
    UPDATE jobs
    SET driver_id = ${driverId},
        status = 'offered',
        ${price ? sql`price = ${Number(price)},` : sql``}
        updated_at = NOW()
    WHERE id = ${jobId}
  `;

  // Email the driver with one-click accept/decline links
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && driver.email) {
    const resend = new Resend(resendKey);
    const acceptUrl = `${BASE_URL}/api/jobs/respond?token=${job.tracking_token}&action=accept`;
    const declineUrl = `${BASE_URL}/api/jobs/respond?token=${job.tracking_token}&action=decline`;
    const driverName = (driver.full_name as string)?.split(" ")[0] || "there";
    const priceDisplay = price ? `£${Number(price).toFixed(0)}` : "Price TBC";

    await resend.emails.send({
      from: "Saint & Story <hello@saintandstoryltd.co.uk>",
      to: driver.email as string,
      subject: `New job offered — ${job.postcode_from}${job.postcode_to ? ` → ${job.postcode_to}` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
          <div style="background:#0D0D0D;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">A job has been matched to you.</p>
          </div>

          <p style="color:#0D0D0D;font-size:16px;font-weight:700;margin-bottom:4px;">Hi ${driverName},</p>
          <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
            We've found a job that matches your area. Here are the details — accept or decline below.
          </p>

          <table style="width:100%;border-collapse:collapse;background:#f5f5f5;border-radius:12px;overflow:hidden;margin-bottom:28px;">
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;width:38%;text-transform:uppercase;letter-spacing:0.1em;">Service</td>
              <td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-weight:600;">${(job.service_type as string) || "Removal"}</td>
            </tr>
            <tr>
              <td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">From</td>
              <td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-family:monospace;">${job.postcode_from as string}</td>
            </tr>
            ${job.postcode_to ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">To</td><td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-family:monospace;">${job.postcode_to as string}</td></tr>` : ""}
            ${job.timeframe ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Timeframe</td><td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;">${job.timeframe as string}</td></tr>` : ""}
            ${job.duration ? `<tr><td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Duration</td><td style="padding:14px 18px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;">${job.duration as string}</td></tr>` : ""}
            <tr>
              <td style="padding:14px 18px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Price</td>
              <td style="padding:14px 18px;color:#0D0D0D;font-size:16px;font-weight:900;">${priceDisplay}</td>
            </tr>
          </table>

          <p style="color:#555;font-size:13px;margin-bottom:20px;">
            You keep 100% of this job. Respond now — we'll confirm with the customer once you accept.
          </p>

          <div style="display:flex;gap:12px;margin-bottom:28px;">
            <a href="${acceptUrl}" style="display:inline-block;background:#0D0D0D;color:#fff;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;">
              Accept this job →
            </a>
            <a href="${declineUrl}" style="display:inline-block;background:#fff;color:#888;font-weight:600;padding:14px 20px;border-radius:999px;text-decoration:none;font-size:14px;border:1px solid #e8e8e8;">
              Decline
            </a>
          </div>

          <p style="color:#bbb;font-size:11px;border-top:1px solid #e8e8e8;padding-top:20px;margin:0;">
            Saint &amp; Story Ltd · Questions? Call 0208 234 4444
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
