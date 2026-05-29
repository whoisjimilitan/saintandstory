import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";

function sha256(str: string) {
  return createHash("sha256").update(str.toLowerCase().trim()).digest("hex");
}

// In-memory store for demo — replace with DB/CRM in production
const leads: Record<string, unknown>[] = [];

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.email || typeof body.email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const lead = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    serviceType: body.serviceType ?? "",
    largeItems: body.largeItems ?? [],
    timeframe: body.timeframe ?? "",
    helpLoading: body.helpLoading ?? "",
    duration: body.duration ?? "",
    postcode_from: body.postcode ?? "",
    email: body.email,
    phone: body.phone ?? "",
    phoneConsent: body.phoneConsent ?? false,
    fullName: body.fullName ?? "",
    marketingOptIn: body.marketingOptIn ?? false,
    utm: body.utm ?? {},
  };

  leads.push(lead);
  console.log("[leads] New lead:", lead.id, lead.email, lead.serviceType);

  // Optional: Facebook Conversions API (server-side, hashed)
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (pixelId && accessToken) {
    try {
      const userData: Record<string, unknown> = {
        em: [sha256(lead.email)],
      };
      if (lead.phone && typeof lead.phone === "string") {
        userData.ph = [sha256(lead.phone.replace(/\s+/g, ""))];
      }

      const res = await fetch(
        `https://graph.facebook.com/v18.0/${pixelId}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [
              {
                event_name: "Lead",
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: request.headers.get("referer") ?? "",
                action_source: "website",
                user_data: userData,
                custom_data: {
                  service_type: lead.serviceType,
                  postcode: lead.postcode_from,
                },
              },
            ],
            ...(process.env.FACEBOOK_TEST_EVENT_CODE
              ? { test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE }
              : {}),
            access_token: accessToken,
          }),
        }
      );

      if (!res.ok) {
        console.error("[leads] FB CAPI error:", await res.text());
      }
    } catch (err) {
      console.error("[leads] FB CAPI exception:", err);
    }
  }

  return NextResponse.json({ id: lead.id, success: true }, { status: 201 });
}

export async function GET() {
  // Simple debug endpoint — remove or protect in production
  return NextResponse.json({ count: leads.length });
}
