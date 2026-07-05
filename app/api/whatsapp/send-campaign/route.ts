import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

/**
 * POST /api/whatsapp/send-campaign
 *
 * Send WhatsApp message to multiple prospects
 * Uses queue system to respect Meta rate limits (60 messages/min)
 *
 * REQUEST BODY:
 * {
 *   "leadIds": ["uuid1", "uuid2", ...],  // Array of prospect IDs
 *   "message": "Hello {{name}}!",        // Message ({{name}} is replaced)
 *   "campaignName": "Q3 Outreach"        // For tracking
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean,
 *   "campaignId": "uuid",
 *   "totalLeads": 10,
 *   "queued": 10,
 *   "failed": 0,
 *   "status": "queued|in_progress|completed"
 * }
 */

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP CAMPAIGN] Starting campaign send");

  // Auth check
  const email = request.headers.get("x-admin-email");
  if (!email || !ADMIN_EMAILS.includes(email)) {
    console.log("[WHATSAPP CAMPAIGN] ✗ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { leadIds, message, campaignName } = body;

    // Validate input
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "leadIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!message || message.length === 0) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    console.log(
      `[WHATSAPP CAMPAIGN] Campaign: ${campaignName}, Leads: ${leadIds.length}`
    );

    // Get all leads with phone numbers
    const leads = await prisma.b2bLead.findMany({
      where: {
        id: { in: leadIds as string[] },
        phone: { not: null },
      },
      select: {
        id: true,
        businessName: true,
        phone: true,
      },
    });

    const leadsWithPhone = leads.filter((l) => l.phone);
    const failedLeads = leadIds.length - leadsWithPhone.length;

    console.log(
      `[WHATSAPP CAMPAIGN] Leads with phone: ${leadsWithPhone.length}, Failed: ${failedLeads}`
    );

    if (leadsWithPhone.length === 0) {
      return NextResponse.json(
        { error: "No leads with phone numbers found" },
        { status: 400 }
      );
    }

    // Create campaign record in database
    const campaign = await prisma.b2bCampaign.create({
      data: {
        channel: "whatsapp",
        campaignName: campaignName || `WhatsApp Campaign ${new Date().toISOString()}`,
        totalLeads: leadsWithPhone.length,
        status: "sent",
        sentAt: new Date(),
      },
    });

    const campaignId = campaign.id;

    // Create WhatsApp campaign records for tracking
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < leadsWithPhone.length; i++) {
      const lead = leadsWithPhone[i];
      const delay = i * 1000; // 1 second delay between messages

      // Create WhatsApp message record for tracking
      await prisma.b2bCampaignWhatsApp.create({
        data: {
          campaignId: campaign.id,
          prospectId: lead.id,
          phoneNumber: lead.phone!,
          prospectName: lead.businessName,
          firstMessage: message,
          status: "pending",
        },
      });

      // Send async (non-blocking)
      setTimeout(async () => {
        try {
          // Personalize message
          const personalizedMessage = message.replace(
            /{{name}}/g,
            lead.businessName
          );

          // Call send-message endpoint
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/whatsapp/send-message`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-admin-email": email,
              },
              body: JSON.stringify({
                leadId: lead.id,
                message: personalizedMessage,
                campaignId,
              }),
            }
          );

          const sendData = await res.json();

          if (res.ok) {
            successCount++;
            // Update message status to sent
            await prisma.b2bCampaignWhatsApp.updateMany({
              where: {
                campaignId: campaign.id,
                prospectId: lead.id,
              },
              data: {
                status: "sent",
                sentAt: new Date(),
              },
            });
            console.log(
              `[WHATSAPP CAMPAIGN] ✓ Sent to ${lead.businessName} (${i + 1}/${leadsWithPhone.length})`
            );
          } else {
            errorCount++;
            console.log(
              `[WHATSAPP CAMPAIGN] ✗ Failed to send to ${lead.businessName}`
            );
          }
        } catch (error) {
          errorCount++;
          console.error(
            `[WHATSAPP CAMPAIGN] Error sending to ${lead.id}:`,
            error
          );
        }
      }, delay);
    }

    console.log(`[WHATSAPP CAMPAIGN] ✓ Campaign queued: ${campaignId}`);

    return NextResponse.json({
      success: true,
      campaignId,
      campaignName,
      totalLeads: leadIds.length,
      leadsWithPhone: leadsWithPhone.length,
      queued: leadsWithPhone.length,
      failed: failedLeads,
      status: "queued",
      message: `${leadsWithPhone.length} messages queued. Will send at 1 message/second to respect Meta rate limits.`,
    });
  } catch (error) {
    console.error("[WHATSAPP CAMPAIGN] ✗ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/whatsapp/send-campaign
 *
 * Get campaign status/metrics
 */
export async function GET(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    // Get all messages sent for this campaign
    const messages = await prisma.b2bConversationEvent.findMany({
      where: {
        type: "whatsapp",
        direction: "outbound",
        metadata: {
          path: ["campaignId"],
          equals: campaignId,
        },
      },
      select: {
        id: true,
        leadId: true,
        metadata: true,
        createdAt: true,
      },
    });

    const totalSent = messages.length;
    const failed = messages.filter((m) => m.metadata?.error).length;

    return NextResponse.json({
      success: true,
      campaignId,
      totalSent,
      failed,
      succeeded: totalSent - failed,
      successRate: totalSent > 0 ? Math.round(((totalSent - failed) / totalSent) * 100) : 0,
      messages,
    });
  } catch (error) {
    console.error("[WHATSAPP CAMPAIGN GET] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
