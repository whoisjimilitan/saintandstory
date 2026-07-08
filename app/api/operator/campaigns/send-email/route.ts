import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { leadId, subject, body, category } = await request.json();

    if (!leadId || !subject || !body) {
      return NextResponse.json(
        { error: "leadId, subject, and body required" },
        { status: 400 }
      );
    }

    // Get lead
    const lead = await prisma.b2bLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json(
        { error: "Lead has no email address" },
        { status: 400 }
      );
    }

    // Send via Resend
    const emailResponse = await resend.emails.send({
      from: "Saint & Story <noreply@saintandstory.co.uk>",
      to: lead.email,
      subject: subject,
      html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0D0D0D; line-height: 1.6;">
        ${body.replace(/\n/g, "<br />")}
      </div>`,
    });

    if (emailResponse.error) {
      return NextResponse.json(
        { error: "Email send failed", details: emailResponse.error },
        { status: 500 }
      );
    }

    // Create b2b_outreach record
    await prisma.b2bOutreach.create({
      data: {
        leadId,
        subject,
        body,
        sentAt: new Date(),
        resendMessageId: emailResponse.data?.id || null,
        emailType: "initial",
        sent_by: "operator",
      },
    });

    return NextResponse.json({
      success: true,
      leadId,
      businessName: lead.businessName,
      email: lead.email,
      messageId: emailResponse.data?.id,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[SEND-EMAIL] Error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
