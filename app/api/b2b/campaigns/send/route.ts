import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { buildEmailHtml } from "@/lib/email-html-builder";
import { detectBusinessType } from "@/lib/business-pain-promise-map";

interface SenderInfo {
  name: string;
  email: string;
  role?: string;
}

if (!process.env.RESEND_API_KEY) {
  console.error("[CAMPAIGN SEND] CRITICAL: RESEND_API_KEY is not set!");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Map of admin emails to sender info (verified domain only)
// Sender name matches the logged-in user, email matches their company email
const ADMIN_MAP: Record<string, { name: string; email: string }> = {
  "whoisjimi.today@gmail.com": { name: "James", email: "james@saintandstoryltd.co.uk" },
  "james@saintandstoryltd.co.uk": { name: "James", email: "james@saintandstoryltd.co.uk" },
  "oye@saintandstoryltd.co.uk": { name: "Oye", email: "oye@saintandstoryltd.co.uk" },
  "oyedeleoyepeju2014@gmail.com": { name: "Oye", email: "oye@saintandstoryltd.co.uk" },
};

interface EmailPayload {
  prospectId?: string;
  prospectName: string;
  prospectEmail?: string;
  phoneNumber?: string;
  tier?: number;
  category?: string;
  subject?: string;
  body: string;
}

async function getSenderInfo(category?: string): Promise<SenderInfo> {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

    const baseInfo = userEmail && ADMIN_MAP[userEmail] ? ADMIN_MAP[userEmail] : { name: "James", email: "james@saintandstoryltd.co.uk" };

    // Get sender role from category if available
    let role: string | undefined;
    if (category) {
      const businessType = detectBusinessType(category);
      role = businessType.identity?.senderRole;
    }

    return { ...baseInfo, role };
  } catch (error) {
    console.error("[CAMPAIGN SEND] Error getting sender info:", error);
    return { name: "James", email: "james@saintandstoryltd.co.uk" };
  }
}

export async function POST(request: NextRequest) {
  console.log("[CAMPAIGN SEND] Starting campaign send");

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    console.log("[CAMPAIGN SEND] ✗ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const operatorEmail = user?.emailAddresses[0]?.emailAddress ?? "";
  console.log(`[CAMPAIGN SEND] Operator: ${operatorEmail}`);

  try {
    const { campaignName, channel, emails } = await request.json() as {
      campaignName: string;
      channel: "email" | "whatsapp" | "phone";
      emails: EmailPayload[];
    };

    if (!campaignName || !channel || !emails || emails.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: campaignName, channel, emails" },
        { status: 400 }
      );
    }

    console.log(
      `[CAMPAIGN SEND] Campaign: ${campaignName} | Channel: ${channel} | Total: ${emails.length}`
    );

    // Calculate tier breakdown
    const tierBreakdown = {
      tier1: emails.filter(e => e.tier === 1).length,
      tier2: emails.filter(e => e.tier === 2).length,
      tier3: emails.filter(e => e.tier === 3).length,
    };

    // Create campaign record
    const campaign = await prisma.b2bCampaign.create({
      data: {
        channel,
        operatorId: userId,
        campaignName,
        totalLeads: emails.length,
        tierBreakdown: tierBreakdown as any,
        status: "sent",
        sentAt: new Date(),
      },
    });

    console.log(`[CAMPAIGN SEND] Campaign created: ${campaign.id}`);

    // Send emails and track in database
    let sentCount = 0;
    let failedCount = 0;

    for (const email of emails) {
      try {
        if (channel === "email") {
          // Send via Resend
          const sender = await getSenderInfo(email.category);
          console.log(`[CAMPAIGN SEND] Calling Resend for ${email.prospectEmail} from ${sender.email} (role: ${sender.role || 'none'})`);

          // Build HTML email with personalization, signature, and CTA
          const emailHtml = buildEmailHtml(email, sender);

          const response = await resend.emails.send({
            from: `Saint & Story <${sender.email}>`,
            to: email.prospectEmail,
            subject: email.subject,
            html: emailHtml,
          });

          console.log(`[CAMPAIGN SEND] Resend response:`, {
            hasError: !!response.error,
            messageId: response.data?.id,
            error: response.error
          });

          if (response.error) {
            console.error(
              `[CAMPAIGN SEND] Failed to send to ${email.prospectEmail}:`,
              response.error
            );
            failedCount++;
            continue;
          }

          if (!response.data?.id) {
            console.error(
              `[CAMPAIGN SEND] No message ID returned for ${email.prospectEmail} - Resend may have rejected the email`
            );
            console.error(`[CAMPAIGN SEND] Full response:`, response);
            failedCount++;
            continue;
          }

          const messageId = response.data.id;
          console.log(`[CAMPAIGN SEND] ◆ CRITICAL: Message ID received`, {
            type: typeof messageId,
            value: messageId,
            length: typeof messageId === 'string' ? messageId.length : 'N/A',
            isEmpty: messageId === '' || messageId === null || messageId === undefined,
          });

          // VALIDATION: Ensure messageId is a non-empty string
          if (typeof messageId !== 'string' || messageId.length === 0) {
            console.error(`[CAMPAIGN SEND] ✗ INVALID Message ID! Type: ${typeof messageId}, Value: ${messageId}`);
            console.error(`[CAMPAIGN SEND] Full Resend response:`, JSON.stringify(response));
            failedCount++;
            continue;
          }

          console.log(`[CAMPAIGN SEND] ◆ Storing email with resendMessageId: ${messageId}`);

          // Log in database with Resend message ID for webhook matching
          try {
            const stored = await prisma.b2bCampaignEmail.create({
              data: {
                campaignId: campaign.id,
                prospectId: email.prospectId,
                prospectEmail: email.prospectEmail,
                prospectName: email.prospectName,
                tier: email.tier,
                category: email.category,
                subject: email.subject,
                body: email.body,
                resendMessageId: messageId, // Store Resend message ID for webhooks
                status: "sent",
                emailSentAt: new Date(),
              },
              select: { id: true, resendMessageId: true, status: true },
            });
            console.log(`[CAMPAIGN SEND] ✓✓ Stored email in DB:`, {
              dbId: stored.id,
              resendMessageId: stored.resendMessageId,
              status: stored.status,
            });
          } catch (dbError) {
            console.error(`[CAMPAIGN SEND] Database error logging email:`, dbError);
            // Continue anyway - email was sent even if logging failed
          }

          sentCount++;
          console.log(`[CAMPAIGN SEND] ✓ Email sent to ${email.prospectEmail}`);
        } else if (channel === "whatsapp") {
          // WhatsApp sending via Twilio/Meta API
          // WHEN WHATSAPP API KEY IS AVAILABLE: Uncomment and configure
          // const whatsappResponse = await whatsappClient.messages.create({
          //   from: process.env.WHATSAPP_BUSINESS_PHONE,
          //   to: formatPhoneNumber(email.phoneNumber),
          //   body: email.body,
          // });
          // For now, log as sent for testing
          console.log(`[CAMPAIGN SEND] WhatsApp (stub) to ${email.phoneNumber}`);

          await prisma.b2bCampaignWhatsApp.create({
            data: {
              campaignId: campaign.id,
              prospectId: email.prospectId,
              phoneNumber: email.phoneNumber || "",
              prospectName: email.prospectName,
              firstMessage: email.body,
              status: "sent",
              sentAt: new Date(),
            },
          });

          sentCount++;
          console.log(`[CAMPAIGN SEND] ✓ WhatsApp message queued to ${email.phoneNumber}`);
        }
        // Phone outreach would go here in future
      } catch (error) {
        console.error(
          `[CAMPAIGN SEND] Error processing ${email.prospectEmail}:`,
          error
        );
        failedCount++;
      }
    }

    console.log(
      `[CAMPAIGN SEND] Complete: ${sentCount} sent, ${failedCount} failed`
    );

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      sentCount,
      failedCount,
      totalLeads: emails.length,
      tierBreakdown,
    });
  } catch (error) {
    console.error("[CAMPAIGN SEND] Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Campaign send failed" },
      { status: 500 }
    );
  }
}
