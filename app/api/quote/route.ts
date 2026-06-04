import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("[/api/quote] Received quote request");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { firstName, lastName, email, phone, page } = await req.json();

  const { error } = await resend.emails.send({
    from: "Saint & Story <hello@saintandstoryltd.co.uk>",
    to: ["whoisjimi.today@gmail.com", "oyedeleagile@gmail.com"],
    subject: `New quote request — ${firstName} ${lastName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#f5f5f5;border-radius:12px;">
        <div style="background:#0D0D0D;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
          <h2 style="margin:0;color:#fff;font-size:18px;font-weight:800;">Quote request — Saint &amp; Story</h2>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">Via ${page || "the website"} · ${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;">
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;width:38%;text-transform:uppercase;letter-spacing:0.1em;">Name</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#0D0D0D;font-size:14px;font-weight:600;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:14px;font-weight:600;"><a href="mailto:${email}" style="color:#0D0D0D;">${email}</a></td></tr>
          <tr><td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Phone</td><td style="padding:12px 16px;font-size:14px;font-weight:600;"><a href="tel:${phone}" style="color:#0D0D0D;">${phone}</a></td></tr>
        </table>
        <a href="tel:${phone}" style="display:inline-block;margin-top:20px;background:#0D0D0D;color:#fff;font-weight:700;padding:13px 28px;border-radius:999px;text-decoration:none;font-size:14px;">Call ${firstName} now →</a>
      </div>
    `,
  });

  if (error) {
    console.log("[/api/quote] Resend error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  console.log("[/api/quote] Email sent successfully");
  return NextResponse.json({ ok: true });
}
