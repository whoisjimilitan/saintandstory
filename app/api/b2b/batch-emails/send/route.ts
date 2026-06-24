import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// Map admin emails to display names
const ADMIN_MAP: Record<string, { name: string; email: string }> = {
  "whoisjimi.today@gmail.com": { name: "James", email: "james@saintandstoryltd.co.uk" },
  "james@saintandstoryltd.co.uk": { name: "James", email: "james@saintandstoryltd.co.uk" },
  "oye@saintandstoryltd.co.uk": { name: "Oye", email: "oye@saintandstoryltd.co.uk" },
  "oyedeleoyepeju2014@gmail.com": { name: "Oye", email: "oye@saintandstoryltd.co.uk" },
};

interface EmailToSend {
  prospectId: string;
  subject: string;
  body: string;
  toEmail?: string;
}

async function getSenderInfo(): Promise<{ name: string; email: string } | null> {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

    if (userEmail && ADMIN_MAP[userEmail]) {
      return ADMIN_MAP[userEmail];
    }

    // Fallback to default if admin not mapped
    return { name: "James", email: "james@saintandstoryltd.co.uk" };
  } catch (error) {
    console.error("[SENDER_INFO] Error getting current user:", error);
    return { name: "James", email: "james@saintandstoryltd.co.uk" };
  }
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

    // Get sender info (who's logged in)
    const sender = await getSenderInfo();
    if (!sender) {
      return NextResponse.json(
        { error: "Could not determine sender" },
        { status: 401 }
      );
    }

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

        // Append sender signature to email body if not already present
        let emailBody = email.body;
        if (!emailBody.includes(`From: ${sender.name}`) && !emailBody.includes(`- ${sender.name}`)) {
          emailBody = `${email.body}\n\n---\n${sender.name}\nSaint & Story\n${sender.email}`;
        }

        // Send email via Resend - personalized by sender
        const result = await resend.emails.send({
          from: `${sender.name} <${sender.email}>`,
          to: recipientEmail,
          subject: email.subject,
          html: emailBody,
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
            body: emailBody,
            sentAt: now,
            resendMessageId: result.data?.id,
            emailType: "initial",
            sent_by: sender.name.toLowerCase(), // "james" or "oye"
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
