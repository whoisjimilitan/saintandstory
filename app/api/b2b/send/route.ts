import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

const FROM = "Saint & Story <hello@saintandstory.com>";

interface SendRequest {
  leadId: string;
  subject: string;
  body: string;
  emailType?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendRequest;

    if (!body.leadId || !body.subject || !body.body) {
      return NextResponse.json(
        { error: "Missing required fields: leadId, subject, body" },
        { status: 400 }
      );
    }

    const lead = await prisma.b2bLead.findUnique({
      where: { id: body.leadId as any },
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

    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM,
      to: lead.email,
      subject: body.subject,
      html: body.body,
    });

    if (result.error) {
      return NextResponse.json(
        { error: "Failed to send email via Resend" },
        { status: 500 }
      );
    }

    const outreach = await prisma.b2bOutreach.create({
      data: {
        leadId: body.leadId as any,
        subject: body.subject,
        body: body.body,
        sentAt: new Date(),
        resendMessageId: result.data?.id,
        emailType: body.emailType || "initial",
      },
    });

    return NextResponse.json({
      success: true,
      outreachId: outreach.id,
      messageId: result.data?.id,
    });
  } catch (error) {
    console.error("[B2B SEND] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
