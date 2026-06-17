/**
 * POST /api/b2b/send
 *
 * Sends first-touch email and records to b2b_outreach
 * Generates unique YES/NO response tokens for tracking
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM } from "@/lib/resend";

interface SendRequest {
  lead_id: string;
  pressure_type?: string;
  copy_variant?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendRequest;
    const { lead_id, pressure_type, copy_variant } = body;

    // Fetch outreach record
    const outreach = await prisma.b2b_outreach.findFirst({
      where: { lead_id },
      include: {
        b2b_leads: {
          select: {
            business_name: true,
            email: true,
            business_category: true,
          },
        },
      },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "No outreach record found" },
        { status: 404 }
      );
    }

    if (!outreach.b2b_leads.email) {
      return NextResponse.json(
        { error: "No email address on file" },
        { status: 400 }
      );
    }

    // Generate response tokens
    const yesToken = `yes_${outreach.id}`;
    const noToken = `no_${outreach.id}`;
    const yesUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/api/b2b/respond?token=${yesToken}&response=YES`;
    const noUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/api/b2b/respond?token=${noToken}&response=NO`;

    // Build HTML email with YES/NO buttons
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,system-ui,sans-serif;margin:0;padding:0;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;padding:40px;border:1px solid #e0e0e0;">

        <tr><td style="font-size:14px;color:#666;margin-bottom:16px;">
          <strong>${outreach.b2b_leads.business_name}</strong>
        </td></tr>

        <tr><td style="font-size:16px;line-height:1.6;color:#333;margin-bottom:24px;">
          ${outreach.body || ""}
        </td></tr>

        <tr><td align="center" style="padding-top:20px;border-top:1px solid #e0e0e0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;">
              <a href="${yesUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">YES</a>
            </td>
            <td>
              <a href="${noUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">NO</a>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="padding-top:24px;font-size:12px;color:#999;text-align:center;">
          Saint & Story
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const result = await resend.emails.send({
      from: FROM || "Saint & Story <hello@saintandstory.com>",
      to: outreach.b2b_leads.email,
      subject: outreach.subject || "Question for you",
      html,
    });

    if (result.error) {
      console.error("[SEND] Resend error:", result.error);
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }

    // Update outreach with sent timestamp and Resend message ID
    await prisma.b2b_outreach.update({
      where: { id: outreach.id },
      data: {
        sent_at: new Date(),
        sent_by: "manual",
        pressure_type: pressure_type || outreach.pressure_type,
        copy_variant: copy_variant || "default",
        resend_message_id: result.data?.id,
      },
    });

    console.log(`[SEND] ✅ Email sent to ${outreach.b2b_leads.business_name}`);

    return NextResponse.json({
      success: true,
      outreach_id: outreach.id,
      lead_name: outreach.b2b_leads.business_name,
      email: outreach.b2b_leads.email,
      resend_id: result.data?.id,
    });
  } catch (error) {
    console.error("[SEND] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
