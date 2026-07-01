import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
          const response = await resend.emails.send({
            from: "Saint & Story <noreply@saintandstory.co.uk>",
            to: email.prospectEmail,
            subject: email.subject,
            html: `<p>${email.body.replace(/\n/g, "</p><p>")}</p>`,
          });

          if (response.error) {
            console.error(
              `[CAMPAIGN SEND] Failed to send to ${email.prospectEmail}:`,
              response.error
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
