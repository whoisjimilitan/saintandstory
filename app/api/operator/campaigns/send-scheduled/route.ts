import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  console.log("[SCHEDULED-SEND] ✓ Handler invoked");

  if (!process.env.RESEND_API_KEY) {
    console.error("[SCHEDULED-SEND] ✗ RESEND_API_KEY missing");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  try {
    const now = new Date();

    // Find all pending emails scheduled to send now or earlier
    const readyEmails = await prisma.b2bCampaignEmail.findMany({
      where: {
        status: "pending",
        scheduledFor: {
          lte: now,
        },
      },
      take: 20, // Send max 20 per run
      orderBy: { scheduledFor: "asc" },
    });

    console.log(`[SCHEDULED-SEND] Found ${readyEmails.length} emails ready to send`);

    let sent = 0;
    let failed = 0;

    for (const email of readyEmails) {
      try {
        console.log(`[SCHEDULED-SEND] Sending to ${email.prospectEmail}`);

        const emailResponse = await resend.emails.send({
          from: "James <james@saintandstoryltd.co.uk>",
          to: email.prospectEmail,
          subject: email.subject,
          html: email.body,
          replyTo: "hello@saintandstoryltd.co.uk",
        });

        if (emailResponse.error || !emailResponse.data?.id) {
          throw new Error(String(emailResponse.error || "No message ID"));
        }

        // Update email record with sent status
        await prisma.b2bCampaignEmail.update({
          where: { id: email.id },
          data: {
            status: "sent",
            emailSentAt: now,
            resendMessageId: emailResponse.data.id,
          },
        });

        // Update lead
        if (email.leadId) {
          await prisma.b2bLead.update({
            where: { id: email.leadId },
            data: {
              pipeline_stage: "propose",
              leadState: "emailed",
              last_engagement_at: now,
              email_sent_at: now,
              last_engagement_type: "email",
            },
          });
        }

        sent++;
        console.log(`[SCHEDULED-SEND] ✓ Sent to ${email.prospectEmail}`);
      } catch (err) {
        failed++;
        console.error(`[SCHEDULED-SEND] ✗ Failed ${email.prospectEmail}:`, err);
      }
    }

    console.log(`[SCHEDULED-SEND] ✓ Complete: ${sent} sent, ${failed} failed`);

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      sent,
      failed,
      processed: readyEmails.length,
    });
  } catch (error) {
    console.error("[SCHEDULED-SEND] Error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
