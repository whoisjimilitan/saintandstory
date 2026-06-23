import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { prospectId, prospectEmail, message } = await request.json();

    if (!prospectId || !prospectEmail || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[SEND REPLY] Sending reply to:", prospectEmail);

    // Send reply email
    const emailRes = await resend.emails.send({
      from: "Saint & Story <hello@saintandstoryltd.co.uk>",
      to: prospectEmail,
      replyTo: "hello@saintandstoryltd.co.uk",
      subject: "Re: Opportunity with Saint & Story",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #0D0D0D;">
          <p>${message.replace(/\n/g, "<br />")}</p>
          <p style="margin-top: 24px; font-size: 12px; color: #888888; border-top: 1px solid #E8E8E8; padding-top: 16px;">
            Best regards,<br />
            Saint & Story<br />
            <a href="https://saintandstoryltd.co.uk" style="color: #0D0D0D; text-decoration: none;">saintandstoryltd.co.uk</a>
          </p>
        </div>
      `,
    });

    if (!emailRes.data?.id) {
      throw new Error("Failed to send email");
    }

    console.log("[SEND REPLY] ✓ Email sent. MessageId:", emailRes.data.id);

    // Update B2bOutreach to mark as replied
    await prisma.b2bOutreach.updateMany({
      where: { leadId: prospectId },
      data: {
        replied: true,
        repliedAt: new Date(),
      },
    });

    console.log("[SEND REPLY] ✓ Updated outreach record");

    // Update B2bLead status
    await prisma.b2bLead.update({
      where: { id: prospectId },
      data: {
        pipeline_stage: "responded",
        leadState: "responded",
        last_engagement_at: new Date(),
      },
    });

    console.log("[SEND REPLY] ✓ Updated lead status");

    return NextResponse.json({
      success: true,
      messageId: emailRes.data.id,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[SEND REPLY] ❌ Error:", msg);
    return NextResponse.json(
      { error: msg || "Failed to send reply" },
      { status: 500 }
    );
  }
}
