import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailToSend {
  prospectId: string;
  subject: string;
  body: string;
  toEmail?: string;
}

export async function POST(request: Request) {
  try {
    const { emails, batchId, approvedBy } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Invalid emails array" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const sent: Array<{ prospectId: string; success: boolean; messageId?: string; error?: string }> = [];

    // Process each email
    for (const email of emails) {
      try {
        // Use email if provided in request, otherwise fetch from database
        let recipientEmail = email.toEmail;

        if (!recipientEmail) {
          // Fetch prospect to get email address
          const prospect = await prisma.b2bLead.findUnique({
            where: { id: email.prospectId },
            select: { id: true, email: true, businessName: true },
          });

          if (!prospect?.email) {
            sent.push({ prospectId: email.prospectId, success: false, error: "No email address" });
            continue;
          }

          recipientEmail = prospect.email;
        }

        // Send email via Resend
        const result = await resend.emails.send({
          from: "Saint & Story <noreply@saintandstoryltd.co.uk>",
          to: recipientEmail,
          subject: email.subject,
          html: email.body,
          replyTo: "hello@saintandstoryltd.co.uk",
        });

        if (result.error) {
          console.error(`[BATCH EMAIL SEND] Resend error for ${prospect.email}:`, result.error);
          sent.push({ prospectId: email.prospectId, success: false, error: result.error.message });
          continue;
        }

        const now = new Date();

        // Update prospect record on successful send
        await prisma.b2bLead.update({
          where: { id: email.prospectId },
          data: {
            pipeline_stage: "propose",
            leadState: "emailed",
            last_engagement_at: now,
            email_sent_at: now,
            notes: `Email sent: "${email.subject}"`,
          },
        });

        // Track in B2bOutreach for sent history
        await prisma.b2bOutreach.create({
          data: {
            leadId: email.prospectId,
            subject: email.subject,
            body: email.body,
            sentAt: now,
            resendMessageId: result.data?.id,
            emailType: "initial",
            sent_by: "batch_email_enrich",
          },
        });

        sent.push({ prospectId: email.prospectId, success: true, messageId: result.data?.id });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[BATCH EMAIL SEND] Failed for ${email.prospectId}:`, errorMsg);
        sent.push({ prospectId: email.prospectId, success: false, error: errorMsg });
      }
    }

    const successCount = sent.filter((s) => s.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: sent.length - successCount,
      results: sent,
    });
  } catch (error) {
    console.error("[BATCH EMAIL SEND] Error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
