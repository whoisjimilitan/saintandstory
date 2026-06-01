import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { getPusherServer } from "@/lib/pusher";
import { haversineKm, etaMinutes, hasArrived } from "@/lib/haversine";

const BASE_URL = "https://saintandstoryltd.co.uk";

async function ensureSchema() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    ALTER TABLE jobs
      ADD COLUMN IF NOT EXISTS driver_lat DECIMAL(10,8),
      ADD COLUMN IF NOT EXISTS driver_lng DECIMAL(11,8),
      ADD COLUMN IF NOT EXISTS driver_eta_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS location_sharing_since TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10,8),
      ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11,8)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS driver_location_history (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      driver_clerk_id TEXT NOT NULL,
      lat DECIMAL(10,8) NOT NULL,
      lng DECIMAL(11,8) NOT NULL,
      accuracy DECIMAL(10,2),
      eta_minutes INTEGER,
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_dlh_job_id ON driver_location_history(job_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_dlh_recorded_at ON driver_location_history(recorded_at)`;
}

async function geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const data = await res.json() as { status: number; result?: { latitude: number; longitude: number } };
    if (data.status === 200 && data.result) {
      return { lat: data.result.latitude, lng: data.result.longitude };
    }
  } catch { /* non-fatal */ }
  return null;
}

async function sendOnTheWayEmail(job: Record<string, unknown>, etaMins: number) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !job.customer_email) return;
  const resend = new Resend(key);
  const customerName = (job.customer_name as string)?.split(" ")[0] || "there";
  const driverFirstName = (job.driver_name as string)?.split(" ")[0] || "Your driver";
  const eta = etaMins > 0 ? ` — about ${etaMins} minutes away` : "";

  await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: job.customer_email as string,
    subject: `${driverFirstName} is on the way`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;">
        <div style="background:#0D0D0D;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
          <h2 style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h2>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Your driver is on the way.</p>
        </div>
        <p style="color:#0D0D0D;font-size:16px;font-weight:700;margin-bottom:4px;">Hi ${customerName},</p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
          <strong>${driverFirstName}</strong> is heading to you right now${eta}. You can see their live ETA on your tracking page.
        </p>
        <a href="${BASE_URL}/track/${job.tracking_token as string}"
           style="display:inline-block;background:#0D0D0D;color:#fff;font-weight:700;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:14px;margin-bottom:24px;">
          See live ETA →
        </a>
        <p style="color:#888;font-size:13px;">Questions? Call <a href="tel:+442082344444" style="color:#0D0D0D;">0208 234 4444</a></p>
      </div>
    `,
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, lat, lng, accuracy } = await request.json() as {
    jobId: string;
    lat: number;
    lng: number;
    accuracy?: number;
  };

  if (!jobId || lat == null || lng == null) {
    return NextResponse.json({ error: "jobId, lat, lng required" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // Ensure schema exists (idempotent on first run)
  await ensureSchema();

  // Verify the driver owns this job
  const rows = await sql`
    SELECT j.*, d.full_name as driver_name, d.clerk_user_id
    FROM jobs j
    JOIN drivers d ON d.id = j.driver_id
    WHERE j.id = ${jobId} AND d.clerk_user_id = ${userId}
      AND j.status IN ('confirmed', 'in_progress')
    LIMIT 1
  `;
  const job = rows[0];
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const isFirstPing = !job.location_sharing_since;

  // Geocode pickup postcode if not already done
  let pickupLat = job.pickup_lat as number | null;
  let pickupLng = job.pickup_lng as number | null;

  if ((!pickupLat || !pickupLng) && job.postcode_from) {
    const coords = await geocodePostcode(job.postcode_from as string);
    if (coords) {
      pickupLat = coords.lat;
      pickupLng = coords.lng;
      await sql`
        UPDATE jobs SET pickup_lat = ${pickupLat}, pickup_lng = ${pickupLng}
        WHERE id = ${jobId}
      `;
    }
  }

  // Calculate ETA
  let eta: number | null = null;
  let arrived = false;

  if (pickupLat && pickupLng) {
    const distKm = haversineKm(lat, lng, pickupLat, pickupLng);
    eta = etaMinutes(distKm);
    arrived = hasArrived(lat, lng, pickupLat, pickupLng);
  }

  // Update job with current location
  const now = new Date().toISOString();
  await sql`
    UPDATE jobs SET
      driver_lat = ${lat},
      driver_lng = ${lng},
      driver_eta_minutes = ${eta},
      location_sharing_since = COALESCE(location_sharing_since, ${now}),
      updated_at = NOW()
    WHERE id = ${jobId}
  `;

  // Log to history table
  await sql`
    INSERT INTO driver_location_history (job_id, driver_clerk_id, lat, lng, accuracy, eta_minutes)
    VALUES (${jobId}, ${userId}, ${lat}, ${lng}, ${accuracy ?? null}, ${eta})
  `;

  // Fire Pusher events
  const pusher = getPusherServer();
  if (pusher) {
    const locationPayload = {
      jobId,
      etaMinutes: eta,
      arrived,
      driverName: (job.driver_name as string)?.split(" ")[0],
    };

    await Promise.allSettled([
      // Admin channel — ETA badge update (no page refresh)
      pusher.trigger("admin", "location-update", locationPayload),
      // Per-job tracking channel — customer tracking page
      pusher.trigger(`tracking-${job.tracking_token as string}`, "driver-location", locationPayload),
    ]);
  }

  // Send "on the way" email on first ping only
  if (isFirstPing) {
    sendOnTheWayEmail(job, eta ?? 0).catch(() => {});
  }

  return NextResponse.json({ success: true, eta, arrived, pickupLat, pickupLng });
}
