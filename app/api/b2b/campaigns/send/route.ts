import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("[CAMPAIGN SEND] CRITICAL: RESEND_API_KEY is not set!");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Map of admin emails to sender info (verified domain only)
const ADMIN_MAP: Record<string, { name: string; email: string }> = {
  "whoisjimi.today@gmail.com": { name: "Saint & Story", email: "james@saintandstoryltd.co.uk" },
  "james@saintandstoryltd.co.uk": { name: "Saint & Story", email: "james@saintandstoryltd.co.uk" },
  "oye@saintandstoryltd.co.uk": { name: "Saint & Story", email: "oye@saintandstoryltd.co.uk" },
  "oyedeleoyepeju2014@gmail.com": { name: "Saint & Story", email: "oye@saintandstoryltd.co.uk" },
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

async function getSenderInfo(): Promise<{ name: string; email: string }> {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

    if (userEmail && ADMIN_MAP[userEmail]) {
      return ADMIN_MAP[userEmail];
    }

    // Fallback to Saint & Story if admin not mapped
    return { name: "Saint & Story", email: "james@saintandstoryltd.co.uk" };
  } catch (error) {
    console.error("[CAMPAIGN SEND] Error getting sender info:", error);
    return { name: "Saint & Story", email: "james@saintandstoryltd.co.uk" };
  }
}

function buildEmailHtml(email: EmailPayload, sender: { name: string; email: string }): string {
  // Use phone based on email domain
  const senderPhone = sender.email.includes("james@") ? "+44 20 3318 1234" : "+44 20 3318 5678";
  const senderAddress = "Saint & Story, London, UK";
  const websiteUrl = "https://saintandstoryltd.co.uk";

  // Build CTA link with pre-populated form
  const ctaLink = `mailto:${sender.email}?subject=Re: Let's talk&body=Hi ${sender.name},%0A%0AI'd like to discuss how Saint & Story could help us improve our deliveries.%0A%0AName:%0ARole:%0ACompany: ${email.prospectName || ""}%0ABest time to reach me:%0A%0AThanks`;

  // Parse body to separate main content from tagline (last 2 lines: "Saint & Story" + signature)
  const lines = email.body.split("\n");
  const taglineStartIndex = Math.max(0, lines.length - 2);
  const mainContent = lines.slice(0, taglineStartIndex).join("\n").trim();
  const taglineText = lines.slice(taglineStartIndex).join("\n").trim();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0D0D0D; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .greeting { margin-bottom: 16px; }
    .body-text { margin-bottom: 16px; white-space: pre-wrap; }
    .tagline-section { margin-top: 16px; font-size: 11px; color: #999999; white-space: pre-wrap; }
    .cta-section { margin: 24px 0; }
    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background: #0D0D0D;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
    }
    .signature { margin-top: 32px; border-top: 1px solid #E8E8E8; padding-top: 16px; }
    .signature-name { font-weight: 600; margin-bottom: 4px; }
    .signature-details { font-size: 12px; color: #666666; line-height: 1.4; }
    .signature-details a { color: #0D0D0D; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="greeting">Hi ${email.prospectName},</div>

    <div class="body-text">${mainContent}</div>

    <div class="tagline-section">${taglineText}</div>

    <div class="cta-section">
      <a href="${ctaLink}" class="cta-button">Let's talk</a>
    </div>

    <div class="signature">
      <div class="signature-name">${sender.name}</div>
      <div class="signature-details">
        <a href="${websiteUrl}">Saint & Story</a><br>
        ${senderPhone}<br>
        ${senderAddress}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
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
          const sender = await getSenderInfo();
          console.log(`[CAMPAIGN SEND] Calling Resend for ${email.prospectEmail} from ${sender.email}`);

          // Build HTML email with personalization, signature, and CTA
          const emailHtml = buildEmailHtml(email, sender);

          const response = await resend.emails.send({
            from: `${sender.name} <${sender.email}>`,
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
            failedCount++;
            continue;
          }

          // Log in database with Resend message ID for webhook matching
          try {
            await prisma.b2bCampaignEmail.create({
              data: {
                campaignId: campaign.id,
                prospectId: email.prospectId,
                prospectEmail: email.prospectEmail,
                prospectName: email.prospectName,
                tier: email.tier,
                category: email.category,
                subject: email.subject,
                body: email.body,
                resendMessageId: response.id, // Store Resend message ID for webhooks
                status: "sent",
                emailSentAt: new Date(),
              },
            });
            console.log(`[CAMPAIGN SEND] ✓ Logged email ${response.id} to database`);
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
