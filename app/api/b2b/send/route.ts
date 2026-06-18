import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { checkSendConstraints } from "@/lib/b2b/enforcement-gate";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

const FROM = "Saint & Story <hello@saintandstory.com>";
const WEBHOOK_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function generateTrackingToken(): string {
  return randomBytes(16).toString("hex");
}

function selectCopyVariant(): "A" | "B" {
  return Math.random() > 0.5 ? "A" : "B";
}

interface SendRequest {
  leadId: string;
  subject: string;
  body: string;
  emailType?: string;
  pressureType?: string;
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

    const pressureType = body.pressureType || "general";
    const copyVariant = selectCopyVariant();

    // ENFORCEMENT GATE: Check constraints before execution
    const enforcement = await checkSendConstraints(pressureType, copyVariant);

    if (!enforcement.allowed) {
      // Constraints violated - do not send email
      const statusCode = enforcement.reason === "daily_limit_reached" ? 429 : 403;
      return NextResponse.json(
        { error: enforcement.reason, message: "Send constraints not met" },
        { status: statusCode }
      );
    }

    // Gate passed - proceed with Wave 1 execution
    const trackingToken = generateTrackingToken();

    const yesLink = `${WEBHOOK_URL}/api/b2b/webhook/response?token=${trackingToken}&response=YES`;
    const noLink = `${WEBHOOK_URL}/api/b2b/webhook/response?token=${trackingToken}&response=NO`;

    const emailHtml = `${body.body}\n\n<hr>\n<p><a href="${yesLink}">YES</a> | <a href="${noLink}">NO</a></p>`;

    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM,
      to: lead.email,
      subject: body.subject,
      html: emailHtml,
    });

    if (result.error) {
      console.error("[B2B SEND] Resend error:", result.error);
      return NextResponse.json(
        { error: `Failed to send email: ${result.error.message || "Unknown error"}` },
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
        copy_variant: copyVariant,
        pressure_type: pressureType,
        sent_by: "manual",
      },
    });

    // Pre-create response record with tracking token for webhook validation
    await (prisma as any).b2b_responses.create({
      data: {
        outreach_id: outreach.id as any,
        response_type: "PENDING",
        tracking_token: trackingToken,
      },
    });

    // Log conversation event: EMAIL_SENT
    await prisma.b2bConversationEvent.create({
      data: {
        leadId: body.leadId as any,
        type: "EMAIL_SENT",
        direction: "OUTBOUND",
        subject: body.subject,
        body: body.body,
        metadata: {
          outreachId: outreach.id,
          resendMessageId: result.data?.id,
          emailType: body.emailType || "initial",
        },
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
