import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  console.log("[/api/quote] Received quote request");

  const { firstName, lastName, email, phone, page } = await req.json();

  const { error } = await resend.emails.send({
    from: "Saint & Story <onboarding@resend.dev>",
    to: ["whoisjimi.today@gmail.com", "oyedeleagile@gmail.com"],
    subject: `New quote request from ${firstName} ${lastName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f6f7fa;border-radius:12px;">
        <h2 style="margin:0 0 8px;color:#0D0E17;font-size:20px;">New quote request</h2>
        <p style="margin:0 0 24px;color:#888;font-size:14px;">Submitted via ${page || "the website"}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e0e0e0;color:#555;font-size:13px;width:40%;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e0e0e0;color:#0D0E17;font-size:13px;font-weight:600;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e0e0e0;color:#555;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e0e0e0;color:#0D0E17;font-size:13px;font-weight:600;">${email}</td></tr>
          <tr><td style="padding:10px 0;color:#555;font-size:13px;">Phone</td><td style="padding:10px 0;color:#0D0E17;font-size:13px;font-weight:600;">${phone}</td></tr>
        </table>
        <a href="tel:${phone}" style="display:inline-block;margin-top:24px;background:#E8244A;color:#fff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">Call ${firstName} now →</a>
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
