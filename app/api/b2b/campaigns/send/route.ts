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
  prePopulatedReply?: string;
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
  console.error("🔴🔴🔴 [CAMPAIGN SEND] ⭐️ EMERGENCY: POST HANDLER CALLED 🔴🔴🔴");
  console.log("[CAMPAIGN SEND] Starting campaign send");

  try {
    const { userId } = await auth();
    console.error("🔴 [CAMPAIGN SEND] Auth check - userId:", userId);

    const user = await currentUser();
    console.error("🔴 [CAMPAIGN SEND] Current user:", user?.emailAddresses?.[0]?.emailAddress);

    if (!userId) {
      console.error("🔴 [CAMPAIGN SEND] ✗ Unauthorized - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const operatorEmail = user?.emailAddresses[0]?.emailAddress ?? "";
    console.error(`🔴 [CAMPAIGN SEND] Operator: ${operatorEmail}`);

    const body = await request.json();
    console.error("🔴 [CAMPAIGN SEND] Request body received:", {
      campaignName: body.campaignName,
      channel: body.channel,
      emailCount: body.emails?.length,
    });

    const { campaignName, channel, emails } = body as {
      campaignName: string;
      channel: "email" | "whatsapp" | "phone";
      emails: EmailPayload[];
    };

    if (!campaignName || !channel || !emails || emails.length === 0) {
      console.error("🔴 [CAMPAIGN SEND] ✗ Missing fields - returning 400");
      return NextResponse.json(
        { error: "Missing required fields: campaignName, channel, emails" },
        { status: 400 }
      );
    }

    console.error(
      `🔴 [CAMPAIGN SEND] ✓ Valid request: ${campaignName} | ${channel} | ${emails.length} emails`
    );

    // Calculate tier breakdown
    const tierBreakdown = {
      tier1: emails.filter(e => e.tier === 1).length,
      tier2: emails.filter(e => e.tier === 2).length,
      tier3: emails.filter(e => e.tier === 3).length,
    };

    // Create campaign record
    console.error("🔴 [CAMPAIGN SEND] Creating campaign in database...");
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

    console.error(`🔴 [CAMPAIGN SEND] ✓ Campaign created: ${campaign.id}`);

    // Verify campaign was created
    console.error(`🔴 [CAMPAIGN SEND] Campaign details:`, {
      id: campaign.id,
      name: campaign.campaignName,
      status: campaign.status,
      sentAt: campaign.sentAt,
    });

    // Send emails and track in database
    console.error(`🔴 [CAMPAIGN SEND] ✓ Starting to send ${emails.length} emails...`);
    let sentCount = 0;
    let failedCount = 0;

    for (const email of emails) {
      console.error(`🔴 [CAMPAIGN SEND] Processing email ${sentCount + failedCount + 1}/${emails.length}: ${email.prospectEmail}`);
      try {
        if (channel === "email") {
          // Send via Resend
          const sender = await getSenderInfo(email.category);
          console.error(`🔴 [CAMPAIGN SEND] Calling Resend for ${email.prospectEmail} from ${sender.email} (role: ${sender.role || 'none'})`);

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

          // Store in database with Resend message ID for webhook matching
          let stored;
          try {
            stored = await prisma.b2bCampaignEmail.create({
              data: {
                campaignId: campaign.id,
                prospectId: email.prospectId || undefined,
                prospectEmail: email.prospectEmail,
                prospectName: email.prospectName,
                tier: email.tier,
                category: email.category,
                subject: email.subject,
                body: email.body,
                resendMessageId: messageId,
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
            console.error(`[CAMPAIGN SEND] ✗✗ CRITICAL: Database save failed for ${email.prospectEmail}:`, {
              error: dbError instanceof Error ? dbError.message : String(dbError),
              email: email.prospectEmail,
              campaignId: campaign.id,
              messageId,
            });
            failedCount++;
            continue;
          }

          // Update lead engagement status if prospectId exists
          if (email.prospectId) {
            try {
              await prisma.b2bLead.update({
                where: { id: email.prospectId },
                data: {
                  last_engagement_at: new Date(),
                  last_engagement_type: "email",
                  engaged_today: true,
                },
              });
              console.log(`[CAMPAIGN SEND] ✓ Updated lead engagement: ${email.prospectId}`);
            } catch (updateError) {
              console.warn(`[CAMPAIGN SEND] ⚠ Could not update lead ${email.prospectId}:`,
                updateError instanceof Error ? updateError.message : String(updateError)
              );
            }

            // Create conversation event for audit trail
            try {
              await prisma.b2bConversationEvent.create({
                data: {
                  leadId: email.prospectId,
                  type: "email",
                  direction: "outbound",
                  subject: email.subject || "Email Sent",
                  body: email.body,
                  metadata: {
                    messageId,
                    campaignId: campaign.id,
                    sentBy: operatorEmail,
                    sentAt: new Date().toISOString(),
                  },
                },
              });
              console.log(`[CAMPAIGN SEND] ✓ Logged conversation event: ${email.prospectId}`);
            } catch (eventError) {
              console.warn(`[CAMPAIGN SEND] ⚠ Could not log event for ${email.prospectId}:`,
                eventError instanceof Error ? eventError.message : String(eventError)
              );
            }
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

    console.error(
      `🔴 [CAMPAIGN SEND] ✓✓ COMPLETE: ${sentCount} sent, ${failedCount} failed`
    );

    // Verify emails were actually created in database
    const emailsInDb = await prisma.b2bCampaignEmail.findMany({
      where: { campaignId: campaign.id },
      select: { id: true, prospectEmail: true, status: true },
    });

    console.error(`🔴 [CAMPAIGN SEND] Verification: Found ${emailsInDb.length} emails in database for campaign ${campaign.id}`);
    if (emailsInDb.length > 0) {
      const statusBreakdown: Record<string, number> = {};
      emailsInDb.forEach(e => {
        statusBreakdown[e.status] = (statusBreakdown[e.status] || 0) + 1;
      });
      console.error(`🔴 [CAMPAIGN SEND] Email status breakdown:`, statusBreakdown);
    }

    console.error(`🔴 [CAMPAIGN SEND] Returning success response with campaignId: ${campaign.id}`);
    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      sentCount,
      failedCount,
      totalLeads: emails.length,
      emailsCreated: emailsInDb.length,
      tierBreakdown,
    });
  } catch (error) {
    console.error("🔴🔴🔴 [CAMPAIGN SEND] FATAL ERROR:", error);
    console.error("🔴 Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("🔴 Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Campaign send failed" },
      { status: 500 }
    );
  }
}
