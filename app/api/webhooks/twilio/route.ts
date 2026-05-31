import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oyedeleoyepeju@gmail.com"];
const BASE_URL = "https://saintandstoryltd.co.uk";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = new URLSearchParams(body);

  const from = params.get("From") ?? "Unknown";
  const messageBody = params.get("Body") ?? "";

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && messageBody) {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Saint & Story <hello@saintandstoryltd.co.uk>",
      to: ADMIN_EMAILS,
      subject: `SMS reply from ${from}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <div style="background:#0D0D0D;border-radius:12px;padding:24px 28px;margin-bottom:24px;">
            <h1 style="margin:0;color:#fff;font-size:18px;font-weight:900;letter-spacing:-0.02em;">Saint &amp; Story</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:12px;">Driver SMS reply</p>
          </div>
          <p style="color:#888;font-size:12px;margin-bottom:4px;">From</p>
          <p style="color:#0D0D0D;font-size:14px;font-weight:700;margin-bottom:16px;">${from}</p>
          <div style="background:#F5F5F5;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0;color:#0D0D0D;font-size:14px;line-height:1.6;">${messageBody}</p>
          </div>
          <a href="sms:${from}" style="display:inline-block;background:#0D0D0D;color:#fff;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;font-size:13px;">
            Reply →
          </a>
          <p style="color:#bbb;font-size:11px;margin-top:24px;">
            Or manage drivers at <a href="${BASE_URL}/dashboard/admin" style="color:#bbb;">${BASE_URL}/dashboard/admin</a>
          </p>
        </div>
      `,
    });
  }

  // Twilio expects TwiML response — empty means no auto-reply
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    headers: { "Content-Type": "text/xml" },
  });
}
