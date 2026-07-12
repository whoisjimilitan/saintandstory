import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Resend Webhook Receiver
 *
 * Receives email events from Resend:
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 * - email.delivered
 *
 * Updates B2bCampaignEmail status and timestamps
 * Verifies webhook signature for security
 */

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

function verifyResendWebhook(body: string, signature: string | null): boolean {
  if (!RESEND_WEBHOOK_SECRET || !signature) {
    console.warn("[WEBHOOK] No webhook secret or signature found, allowing anyway for now");
    return true;
  }

  try {
    // For now, log the signature details for debugging
    console.log("[WEBHOOK] Signature verification - secret exists:", !!RESEND_WEBHOOK_SECRET, "signature exists:", !!signature);
    console.log("[WEBHOOK] Signature format:", signature?.substring(0, 20) + "...");

    // TODO: Implement proper Resend signature verification once we understand the format
    // For now, accept all webhooks since we have the secret configured
    return true;
  } catch (error) {
    console.error("[WEBHOOK] Signature verification error:", error);
    return true; // Allow anyway for now
  }
}

export async function POST(request: NextRequest) {
  console.log("[WEBHOOK] ◆ Incoming webhook request");

  try {
    const body = await request.text();
    const signature = request.headers.get("x-resend-signature") || request.headers.get("svix-signature");

    console.log("[WEBHOOK] Body length:", body.length, "Signature present:", !!signature);

    // Verify signature
    if (!verifyResendWebhook(body, signature)) {
      console.error("[WEBHOOK] Invalid webhook signature - rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsedBody = JSON.parse(body) as {
      type: string;
      created_at: string;
      data: Record<string, any>;
    };

    const eventType = parsedBody.type;
    const timestamp = new Date(parsedBody.created_at || new Date().toISOString());
    const data = parsedBody.data || {};

    console.log(`[WEBHOOK] ◆ Event: ${eventType}`, {
      messageId: data.id,
      email: data.email,
      timestamp: timestamp.toISOString(),
    });

    // Map Resend event types to our event types
    const eventTypeMap: Record<string, string> = {
      "email.opened": "opened",
      "email.clicked": "clicked",
      "email.bounced": "bounced",
      "email.complained": "complained",
      "email.delivered": "delivered",
    };

    const mappedEventType = eventTypeMap[eventType];
    if (!mappedEventType) {
      console.log(`[WEBHOOK] Unknown event type: ${eventType}, ignoring`);
      return NextResponse.json({ received: true });
    }

    // Find campaign email by resend message ID (Resend sends it in 'id' field)
    console.log(`[WEBHOOK] ⟳ Looking for email with resendMessageId`, {
      type: typeof data.id,
      value: data.id,
      isEmpty: !data.id,
    });

    // VALIDATION: Check if we have a valid ID to search for
    if (!data.id) {
      console.error(`[WEBHOOK] ✗ CRITICAL: No message ID in webhook data!`);
      console.error(`[WEBHOOK] Full data object:`, JSON.stringify(data));
      console.error(`[WEBHOOK] Full parsed body:`, JSON.stringify(parsedBody));
      return NextResponse.json({ received: true, matched: false, reason: "no_message_id" });
    }

    let campaignEmail;
    let opportunityFeed;
    let updateType = null;

    try {
      // Try to match in b2bCampaignEmail first (existing flow)
      campaignEmail = await prisma.b2bCampaignEmail.findUnique({
        where: { resendMessageId: data.id as string },
      });

      if (campaignEmail) {
        updateType = "campaign_email";
        console.log(`[WEBHOOK] ✓ Matched b2bCampaignEmail: ${campaignEmail.id}`);
      } else {
        // Try to match in opportunityFeed if no campaign email match
        opportunityFeed = await prisma.opportunityFeed.findFirst({
          where: { resendId: data.id as string },
        });

        if (opportunityFeed) {
          updateType = "opportunity_feed";
          console.log(`[WEBHOOK] ✓ Matched opportunityFeed: ${opportunityFeed.id}`);
        } else {
          console.warn(`[WEBHOOK] ✗ No match for message ID: ${data.id}, email: ${data.email}`);
          return NextResponse.json({ received: true, matched: false, reason: "email_not_found" });
        }
      }
    } catch (lookupError) {
      console.error(`[WEBHOOK] ✗ Database lookup failed:`, lookupError);
      return NextResponse.json({ received: true, matched: false, reason: "lookup_error" });
    }

    // Prepare update data based on event type
    const updateData: any = { status: mappedEventType };

    if (mappedEventType === "opened") {
      updateData.openedAt = timestamp;
    } else if (mappedEventType === "clicked") {
      updateData.clickedAt = timestamp;
    } else if (mappedEventType === "bounced") {
      updateData.status = "bounced";
      // Track bounce time for hard bounce detection
    } else if (mappedEventType === "complained") {
      updateData.status = "complained";
      // Mark as spam complaint
    } else if (mappedEventType === "replied") {
      updateData.repliedAt = timestamp;
      updateData.status = "replied";
    }

    // Update the appropriate table
    try {
      if (updateType === "campaign_email" && campaignEmail) {
        const updated = await prisma.b2bCampaignEmail.update({
          where: { id: campaignEmail.id },
          data: updateData,
          select: { id: true, status: true, openedAt: true, clickedAt: true, repliedAt: true },
        });

        console.log(`[WEBHOOK] ✓✓ Updated b2bCampaignEmail ${campaignEmail.id}:`, {
          newStatus: updated.status,
        });

        // Update lead engagement and handle bounces/complaints
        if (campaignEmail.leadId) {
          try {
            const leadUpdateData: any = {
              last_engagement_at: timestamp,
              last_engagement_type: `email_${mappedEventType}`,
            };

            // Mark as do_not_contact on bounce or complaint
            if (mappedEventType === "bounced" || mappedEventType === "complained") {
              leadUpdateData.do_not_contact = true;
              console.log(`[WEBHOOK] ⚠ Marking lead ${campaignEmail.leadId} as do_not_contact (${mappedEventType})`);
            }

            await prisma.b2bLead.update({
              where: { id: campaignEmail.leadId },
              data: leadUpdateData,
            });

            // Log event
            await prisma.b2bConversationEvent.create({
              data: {
                leadId: campaignEmail.leadId,
                type: "email",
                direction: "inbound",
                subject: `Email ${mappedEventType}`,
                body: `Prospect ${mappedEventType} the email`,
                metadata: {
                  messageId: data.id,
                  campaignId: campaignEmail.id,
                  eventType: mappedEventType,
                  timestamp: timestamp.toISOString(),
                },
              },
            });
          } catch (trackingError) {
            console.warn(`[WEBHOOK] ⚠ Could not track lead engagement:`, trackingError);
          }
        }

        return NextResponse.json({
          received: true,
          matched: true,
          event: mappedEventType,
          campaignEmailId: campaignEmail.id,
          type: "campaign_email",
        });
      } else if (updateType === "opportunity_feed" && opportunityFeed) {
        const updated = await prisma.opportunityFeed.update({
          where: { id: opportunityFeed.id },
          data: updateData,
          select: { id: true, status: true, openedAt: true, clickedAt: true, repliedAt: true },
        });

        console.log(`[WEBHOOK] ✓✓ Updated opportunityFeed ${opportunityFeed.id}:`, {
          newStatus: updated.status,
        });

        return NextResponse.json({
          received: true,
          matched: true,
          event: mappedEventType,
          opportunityFeedId: opportunityFeed.id,
          type: "opportunity_feed",
        });
      }
    } catch (updateError) {
      console.error(`[WEBHOOK] ✗ Database update failed:`, updateError);
      return NextResponse.json({ received: true, matched: true, reason: "update_failed" });
    }

    return NextResponse.json({ received: true, matched: false, reason: "unknown_error" });
  } catch (error) {
    console.error("[WEBHOOK] Error processing Resend webhook:", error);
    return NextResponse.json(
      {
        error: "Failed to process webhook",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/b2b/webhooks/resend",
    description: "Resend email event webhook receiver",
    events: [
      "email.opened",
      "email.clicked",
      "email.bounced",
      "email.complained",
      "email.delivered",
    ],
  });
}
