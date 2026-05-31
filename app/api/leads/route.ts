import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";

function sha256(str: string) {
  return createHash("sha256").update(str.toLowerCase().trim()).digest("hex");
}

async function saveToDb(lead: Record<string, unknown>) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("[leads] DATABASE_URL not set — lead not persisted");
    return;
  }
  const sql = neon(dbUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      service_type TEXT,
      large_items JSONB,
      timeframe TEXT,
      help_loading TEXT,
      duration TEXT,
      postcode_from TEXT,
      postcode_to TEXT,
      email TEXT,
      phone TEXT,
      phone_consent BOOLEAN,
      full_name TEXT,
      marketing_opt_in BOOLEAN,
      utm JSONB
    )
  `;
  // Safe migration: add postcode_to if this table existed before the column was introduced
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS postcode_to TEXT`;
  await sql`
    INSERT INTO leads (
      id, created_at, service_type, large_items, timeframe,
      help_loading, duration, postcode_from, postcode_to, email, phone,
      phone_consent, full_name, marketing_opt_in, utm
    ) VALUES (
      ${lead.id as string},
      ${lead.created_at as string},
      ${lead.serviceType as string},
      ${JSON.stringify(lead.largeItems)},
      ${lead.timeframe as string},
      ${lead.helpLoading as string},
      ${lead.duration as string},
      ${lead.postcode_from as string},
      ${lead.postcode_to as string},
      ${lead.email as string},
      ${lead.phone as string},
      ${lead.phoneConsent as boolean},
      ${lead.fullName as string},
      ${lead.marketingOptIn as boolean},
      ${JSON.stringify(lead.utm)}
    )
  `;
  console.log("[leads] Saved to DB:", lead.id);
}

async function sendAlert(lead: Record<string, unknown>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const resend = new Resend(resendKey);
  const name = (lead.fullName as string) || (lead.email as string) || "Unknown";
  const phone = (lead.phone as string) || "—";
  const items = Array.isArray(lead.largeItems)
    ? (lead.largeItems as string[]).join(", ") || "—"
    : "—";
  const from = (lead.postcode_from as string) || "—";
  const to = (lead.postcode_to as string) || "—";
  const isDriver = lead.is_driver === true;

  const subject = isDriver
    ? `New driver: ${name} — ${(lead.area as string) || "area TBC"}`
    : `New lead: ${name} — ${from}${to !== "—" ? ` → ${to}` : ""}`;

  await resend.emails.send({
    from: "Saint & Story <onboarding@resend.dev>",
    to: ["whoisjimi.today@gmail.com", "oyedeleagile@gmail.com"],
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f5f5f5;border-radius:12px;">
        <div style="background:#0D0D0D;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <h2 style="margin:0;color:#fff;font-size:18px;font-weight:800;">${isDriver ? "New driver" : "New lead"} — Saint &amp; Story</h2>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;">
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;width:38%;text-transform:uppercase;letter-spacing:0.1em;">Name</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:14px;font-weight:600;"><a href="mailto:${lead.email}" style="color:#0D0D0D;">${lead.email || "—"}</a></td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Phone</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:14px;font-weight:600;"><a href="tel:${phone}" style="color:#0D0D0D;">${phone}</a></td></tr>
          ${!isDriver ? `
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Service</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;">${(lead.serviceType as string) || "—"}</td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">From</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-family:monospace;letter-spacing:0.1em;">${from}</td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">To</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-family:monospace;letter-spacing:0.1em;">${to}</td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Timeframe</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;">${(lead.timeframe as string) || "—"}</td></tr>
          <tr><td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Items</td><td style="padding:12px 16px;color:#0D0D0D;font-size:14px;">${items}</td></tr>
          ` : `
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Area</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;">${(lead.area as string) || "—"}</td></tr>
          <tr><td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Vehicle</td><td style="padding:12px 16px;color:#0D0D0D;font-size:14px;">${(lead.vehicle as string) || "—"}</td></tr>
          `}
        </table>
        ${phone !== "—" ? `<a href="tel:${phone}" style="display:inline-block;margin-top:20px;background:#0D0D0D;color:#fff;font-weight:700;padding:13px 28px;border-radius:999px;text-decoration:none;font-size:14px;">Call ${name} now →</a>` : ""}
      </div>
    `,
  });
  console.log("[leads] Alert email sent:", lead.id);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isDriver = body.is_driver === true;
  if (!isDriver && (!body.email || typeof body.email !== "string")) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const lead: Record<string, unknown> = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    serviceType: body.serviceType ?? "",
    largeItems: body.largeItems ?? [],
    timeframe: body.timeframe ?? "",
    helpLoading: body.helpLoading ?? "",
    duration: body.duration ?? "",
    postcode_from: body.postcode_from ?? body.postcode ?? "",
    postcode_to: body.postcode_to ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    phoneConsent: body.phoneConsent ?? false,
    fullName: body.fullName ?? body.full_name ?? "",
    marketingOptIn: body.marketingOptIn ?? false,
    utm: body.utm ?? {},
    is_driver: isDriver,
    area: body.area ?? "",
    vehicle: body.vehicle ?? "",
  };

  console.log("[leads] New lead:", lead.id, lead.email, isDriver ? "DRIVER" : lead.serviceType);

  await Promise.allSettled([
    saveToDb(lead),
    sendAlert(lead),
    (async () => {
      const pixelId = process.env.FACEBOOK_PIXEL_ID;
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      if (!pixelId || !accessToken) return;
      const userData: Record<string, unknown> = { em: [sha256((lead.email as string) || "noemail")] };
      if (lead.phone && typeof lead.phone === "string") {
        userData.ph = [sha256(lead.phone.replace(/\s+/g, ""))];
      }
      const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [{
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: request.headers.get("referer") ?? "",
            action_source: "website",
            user_data: userData,
            custom_data: { service_type: lead.serviceType, postcode: lead.postcode_from },
          }],
          ...(process.env.FACEBOOK_TEST_EVENT_CODE
            ? { test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE }
            : {}),
          access_token: accessToken,
        }),
      });
      if (!res.ok) console.error("[leads] FB CAPI error:", await res.text());
    })(),
  ]);

  return NextResponse.json({ id: lead.id, success: true }, { status: 201 });
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return NextResponse.json({ status: "no_db", count: 0 });
  try {
    const sql = neon(dbUrl);
    const rows = await sql`SELECT COUNT(*) as count FROM leads`;
    return NextResponse.json({ status: "ok", count: Number(rows[0].count) });
  } catch {
    // Table hasn't been created yet — fires on first POST submission
    return NextResponse.json({ status: "ok", count: 0, note: "submit a test lead to initialise the table" });
  }
}
