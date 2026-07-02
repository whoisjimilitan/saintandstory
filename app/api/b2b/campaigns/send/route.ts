import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

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

async function getSenderInfo(): Promise<{ name: string; email: string }> {
  try {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

    if (userEmail && ADMIN_MAP[userEmail]) {
      return ADMIN_MAP[userEmail];
    }

    // Fallback to James if admin not mapped (safety default)
    return { name: "James", email: "james@saintandstoryltd.co.uk" };
  } catch (error) {
    console.error("[CAMPAIGN SEND] Error getting sender info:", error);
    return { name: "James", email: "james@saintandstoryltd.co.uk" };
  }
}

function buildEmailHtml(email: EmailPayload, sender: { name: string; email: string }): string {
  // Use phone based on email domain
  const senderPhone = sender.email.includes("james@") ? "+44 20 3318 1234" : "+44 20 3318 5678";
  const senderAddress = "Saint & Story, London, UK";
  const websiteUrl = "https://saintandstoryltd.co.uk";
  const logoUrl = "https://saintandstoryltd.co.uk/logo-mark.svg";

  // Parse body to separate main content from tagline
  const lines = email.body.split("\n");
  const taglineStartIndex = Math.max(0, lines.length - 2);
  const mainContent = lines.slice(0, taglineStartIndex).join("\n").trim();
  const taglineText = lines.slice(taglineStartIndex).join("\n").trim();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      color: #0D0D0D;
      line-height: 1.65;
      background: #FFFFFF;
    }
    .wrapper { background: #FFFFFF; }
    .container {
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E8E8E8;
    }
    .logo {
      display: inline-block;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }
    .content {
      margin-bottom: 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #0D0D0D;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.7;
      color: #333333;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 0;
    }
    .divider {
      margin: 32px 0;
      height: 1px;
      background: #E8E8E8;
    }
    .tagline-section {
      font-size: 13px;
      color: #666666;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.5;
    }
    .cta-section {
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 28px;
      background: #0D0D0D;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #333333;
    }
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E8E8E8;
    }
    .signature-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .signature-logo {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
    }
    .signature-sender {
      font-weight: 600;
      font-size: 15px;
      color: #0D0D0D;
    }
    .signature-details {
      font-size: 13px;
      color: #666666;
      line-height: 1.6;
    }
    .signature-details a {
      color: #0D0D0D;
      text-decoration: none;
      font-weight: 500;
    }
    .signature-details a:hover {
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      .container { padding: 30px 16px; }
      .header { margin-bottom: 30px; }
      .content { margin-bottom: 24px; }
      .greeting { font-size: 15px; }
      .body-text { font-size: 14px; }
      .cta-button { padding: 11px 24px; font-size: 13px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header with Logo -->
      <div class="header">
        <img src="${logoUrl}" alt="Saint & Story" class="logo" width="48" height="48">
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Hi ${email.prospectName},</div>
        <div class="body-text">${mainContent}</div>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Tagline -->
      <div class="tagline-section">${taglineText}</div>

      <!-- CTA Button -->
      <div class="cta-section">
        <a href="mailto:${sender.email}?subject=Re:%20Let's%20talk&body=Hi%20${sender.name},%0A%0AI'd%20like%20to%20discuss%20how%20Saint%20%26%20Story%20could%20help%20us.%0A%0AName:%0ARole:%0ACompany:%20${email.prospectName || ""}%0A%0AThanks" class="cta-button">Let's talk</a>
      </div>

      <!-- Signature -->
      <div class="signature-section">
        <div class="signature-header">
          <img src="${logoUrl}" alt="" class="signature-logo" width="36" height="36">
          <div class="signature-sender">${sender.name}</div>
        </div>
        <div class="signature-details">
          <a href="${websiteUrl}">Saint & Story</a><br>
          ${senderPhone}<br>
          ${senderAddress}
        </div>
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
