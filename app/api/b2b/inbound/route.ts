import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { ensureB2BSchema } from "@/lib/b2b-schema";

const BASE_URL = "https://saintandstoryltd.co.uk";
const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const businessName = data.get("business_name") as string;
    const contactName = data.get("contact_name") as string | null;
    const email = data.get("email") as string | null;
    const phone = data.get("phone") as string;
    const city = data.get("city") as string;
    const requirement = data.get("requirement") as string | null;
    const niche = data.get("niche") as string;

    if (!businessName || !phone || !city) {
      return NextResponse.redirect(`${BASE_URL}/b2b/${niche}?error=missing_fields`);
    }

    if (process.env.DATABASE_URL) {
      await ensureB2BSchema();
      const sql = neon(process.env.DATABASE_URL);
      await sql`
        INSERT INTO b2b_leads (
          business_name, contact_name, email, phone, city,
          pain_point, source, status, niche, landing_page_url
        ) VALUES (
          ${businessName}, ${contactName ?? null}, ${email ?? null}, ${phone}, ${city},
          ${requirement ?? null}, 'inbound', 'warm',
          ${niche}, ${`${BASE_URL}/b2b/${niche}`}
        )
      `;
    }

    // Notify admin
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Saint & Story <hello@saintandstoryltd.co.uk>",
        to: ADMIN_EMAILS,
        subject: `B2B inbound — ${businessName} (${city})`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
            <div style="background:#0D0D0D;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
              <h2 style="margin:0;color:#fff;font-size:16px;font-weight:800;">B2B inbound lead</h2>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:12px;">Via /b2b/${niche}</p>
            </div>
            <p><strong>${businessName}</strong></p>
            ${contactName ? `<p>Contact: ${contactName}</p>` : ""}
            <p>City: ${city}</p>
            <p>Phone: <a href="tel:${phone}">${phone}</a></p>
            ${email ? `<p>Email: <a href="mailto:${email}">${email}</a></p>` : ""}
            ${requirement ? `<p>Requirement: ${requirement}</p>` : ""}
            <a href="${BASE_URL}/dashboard/admin/b2b" style="display:inline-block;margin-top:16px;background:#0D0D0D;color:#fff;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:13px;">
              View in B2B pipeline →
            </a>
          </div>
        `,
      });
    }

    return NextResponse.redirect(`${BASE_URL}/b2b/${niche}?submitted=1`);
  } catch (err) {
    console.error("[b2b/inbound]", err);
    return NextResponse.redirect(`${BASE_URL}/b2b/florists?error=server`);
  }
}
