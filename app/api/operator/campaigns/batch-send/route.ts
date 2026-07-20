import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const CONSEQUENCE_MAP: Record<string, string> = {
  Legal: "One late delivery on a critical filing.\nYour case is dismissed.",
  Healthcare: "One late delivery on urgent supplies.\nPatient care is delayed.",
  "Estate Agents": "One late delivery on completion day.\nThe deal falls through.",
  Accounting: "One late delivery on tax documents.\nDeadline is missed.",
  Construction: "One late delivery on site materials.\nConstruction stops.",
  Hospitality: "One late delivery on supplier goods.\nService is affected.",
  Retail: "One late delivery on stock.\nSales are lost.",
  Beauty: "One late delivery on products.\nAppointments are cancelled.",
  Veterinary: "One late delivery on emergency supplies.\nTreatment is delayed.",
  Dental: "One late delivery on lab work.\nPatient appointments slip.",
  Manufacturing: "One late delivery on parts.\nProduction halts.",
  "Film/Production": "One late delivery on equipment.\nShooting is delayed.",
  "Office Supplies": "One late delivery on urgent supplies.\nOperations stall.",
  Architecture: "One late delivery on plans.\nDeadline is missed.",
  Catering: "One late delivery on event supplies.\nEvent is compromised.",
  "Property/Lettings": "One late delivery on documents.\nTransaction delays.",
  "Art/Auction": "One late delivery on artwork.\nAuction is affected.",
  Other: "One late delivery on critical items.\nOperations are impacted.",
};

interface Business {
  name: string;
  email: string;
  category: string;
  contactName?: string;
  website?: string;
  source?: string;
}

function generateEmail(business: Business) {
  const cat = business.category || "Other";
  const consequence = CONSEQUENCE_MAP[cat];

  const body = `Apologies. I know it's a little unusual emailing out of the blue.

I was researching medium-sized ${cat.toLowerCase()} practices handling time-sensitive documents because we built Saint & Story specifically for firms like yours who are vulnerable to one single point of failure: delivery.

${consequence}

Quick question: does your firm stick with one local courier or have alternatives lined up?

---
James
Co-Founder, Saint & Story
https://saintandstoryltd.co.uk`;

  return {
    subject: "Hoping you could help",
    body,
  };
}

function generateReferralCode(name: string): string {
  const initials = name.toUpperCase().slice(0, 2).padEnd(2, "S");
  const middle = name.toUpperCase().slice(0, 4).padEnd(4, "H");
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `SH-${middle.slice(0, 4)}-${suffix}`;
}

function generateReferralEmail(business: Business, referralCode: string) {
  const body = `Hi ${business.contactName || "there"},

You deal with urgent deliveries and collections all the time at ${business.name || business.email}

We're a same-day courier — and we pay referral bonuses when you mention us:

• £20 per single job referral
• £100 when a referred client does 3 consecutive jobs with us

That's it. No sales calls, no pressure. Just say "I know a reliable courier" when the moment comes up.

James
0203 432 3991`;

  return {
    subject: `£20-£100 referral bonus`,
    body,
  };
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`\n${"=".repeat(80)}`);
  console.log(`[BATCH-SEND] Handler invoked at ${timestamp}`);

  if (!process.env.RESEND_API_KEY) {
    console.error("[BATCH-SEND] CRITICAL ERROR: RESEND_API_KEY not configured");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const { businesses, mode = "now", campaignType = "cold_outreach" } = await request.json();
  if (!Array.isArray(businesses) || businesses.length === 0) {
    console.error("[BATCH-SEND] ERROR: Invalid businesses array");
    return NextResponse.json({ error: "Invalid businesses array" }, { status: 400 });
  }

  console.log(`[BATCH-SEND] RECEIVED ${businesses.length} businesses`);
  console.log(`[BATCH-SEND] Campaign type: ${campaignType}`);
  console.log(`[BATCH-SEND] Mode: ${mode}`);

  // GUARDRAIL: Check Resend daily limit (100 per day)
  const RESEND_DAILY_LIMIT = 100;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const emailsSentToday = await prisma.b2bCampaignEmail.count({
      where: {
        status: "sent",
        emailSentAt: { gte: today },
      },
    });

    const emailsInQueue = await prisma.b2bCampaignEmail.count({
      where: {
        status: "pending",
        scheduledFor: { not: null },
      },
    });

    const totalCommitted = emailsSentToday + emailsInQueue + businesses.length;

    if (totalCommitted > RESEND_DAILY_LIMIT) {
      const remaining = Math.max(0, RESEND_DAILY_LIMIT - emailsSentToday - emailsInQueue);
      console.error(`[BATCH-SEND] ✗ DAILY LIMIT EXCEEDED: ${emailsSentToday} sent + ${emailsInQueue} queued + ${businesses.length} requested = ${totalCommitted} > ${RESEND_DAILY_LIMIT}`);
      return NextResponse.json(
        {
          error: `Daily email limit exceeded`,
          details: `You've sent ${emailsSentToday} emails today and have ${emailsInQueue} queued. Resend allows 100/day. You can send ${remaining} more today.`,
          limit: RESEND_DAILY_LIMIT,
          sentToday: emailsSentToday,
          queuedToday: emailsInQueue,
          remaining: remaining,
        },
        { status: 429 }
      );
    }

    const remaining = RESEND_DAILY_LIMIT - emailsSentToday - emailsInQueue;
    console.log(`[BATCH-SEND] Daily limit check: ${emailsSentToday} sent, ${emailsInQueue} queued, ${remaining} remaining`);
  } catch (err) {
    console.error("[BATCH-SEND] Error checking daily limit:", err);
    // Don't fail the whole request if limit check fails, but log it
  }

  const now = new Date();
  let campaign;
  let campaignError = null;

  try {
    campaign = await prisma.b2bCampaign.create({
      data: {
        channel: "email",
        campaignName: `Campaign ${now.toISOString().split('T')[0]}`,
        totalLeads: businesses.length,
        status: "sent",
        sentAt: now,
      },
    });
    console.log(`[BATCH-SEND] ✓ Campaign created: ${campaign.id}`);
  } catch (err) {
    campaignError = err;
    console.error("[BATCH-SEND] ✗ Campaign creation failed:", err);
    return NextResponse.json({ error: "Campaign creation failed" }, { status: 500 });
  }

  const sent: string[] = [];
  const failed: Array<{ email: string; error: string }> = [];

  const referralCodes: Array<{ email: string; code: string }> = [];

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];

    // Generate referral code if this is a referral campaign
    let referralCode: string | null = null;
    if (campaignType === "referral") {
      referralCode = generateReferralCode(biz.contactName || biz.name);
    }

    const { subject, body } = campaignType === "referral" && referralCode
      ? generateReferralEmail(biz, referralCode)
      : generateEmail(biz);

    try {
      console.log(`[BATCH-SEND] [${i + 1}/${businesses.length}] ${biz.email}`);

      // 1. Find or create lead
      let lead = await prisma.b2bLead.findFirst({ where: { email: biz.email } });

      if (lead) {
        lead = await prisma.b2bLead.update({
          where: { id: lead.id },
          data: {
            businessCategory: biz.category || lead.businessCategory,
            contactName: biz.contactName || lead.contactName,
            website: biz.website || lead.website,
            source: biz.source || lead.source || "campaign",
          },
        });
      } else {
        lead = await prisma.b2bLead.create({
          data: {
            businessName: biz.name,
            email: biz.email,
            businessCategory: biz.category,
            contactName: biz.contactName,
            website: biz.website,
            status: "new",
            source: biz.source || "campaign",
          },
        });
      }

      let messageId: string | null = null;

      if (mode === "warmup") {
        // Queue email with staggered schedule (20 per hour = 3 min apart)
        const scheduledFor = new Date(now.getTime() + (i * 3 * 60 * 1000));

        await prisma.b2bCampaignEmail.create({
          data: {
            campaignId: campaign.id,
            leadId: lead.id,
            prospectEmail: biz.email,
            prospectName: biz.name,
            category: biz.category || "Other",
            subject,
            body,
            status: "pending",
            scheduledFor,
          },
        });

        console.log(`[BATCH-SEND] [${i + 1}] ⧖ Queued for ${scheduledFor.toISOString()}`);
      } else {
        // Send now - with delay to prevent rate limiting
        console.log(`[BATCH-SEND] [${i + 1}] Sending via Resend to ${biz.email}`);
        const emailResponse = await resend.emails.send({
          from: "James <james@saintandstoryltd.co.uk>",
          to: biz.email,
          subject,
          html: body,
          replyTo: "hello@saintandstoryltd.co.uk",
        });

        console.log(`[BATCH-SEND] [${i + 1}] Resend response:`, {
          hasError: !!emailResponse.error,
          error: emailResponse.error,
          messageId: emailResponse.data?.id,
        });

        if (emailResponse.error || !emailResponse.data?.id) {
          throw new Error(`Resend failed: ${JSON.stringify(emailResponse.error) || "No message ID"}`);
        }

        // Add delay between sends to prevent Resend rate limiting
        if (i < businesses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        messageId = emailResponse.data.id;

        // Record in B2bCampaignEmail — THIS IS THE SOURCE OF TRUTH
        try {
          const emailRecord = await prisma.b2bCampaignEmail.create({
            data: {
              campaignId: campaign.id,
              leadId: lead.id,
              prospectEmail: biz.email,
              prospectName: biz.name,
              category: biz.category || "Other",
              subject,
              body,
              emailSentAt: now,
              resendMessageId: messageId,
              status: "sent",
            },
          });
          console.log(`[BATCH-SEND] [${i + 1}] ✓ Created b2bCampaignEmail: ${emailRecord.id}`);
        } catch (createErr) {
          console.error(`[BATCH-SEND] [${i + 1}] ✗ Failed to create b2bCampaignEmail:`, createErr);
          throw createErr;
        }

        // Update B2bLead engagement summary
        try {
          await prisma.b2bLead.update({
            where: { id: lead.id },
            data: {
              pipeline_stage: "propose",
              leadState: "emailed",
              last_engagement_at: now,
              email_sent_at: now,
              last_engagement_type: "email",
            },
          });
          console.log(`[BATCH-SEND] [${i + 1}] ✓ Updated B2bLead engagement`);
        } catch (updateErr) {
          console.error(`[BATCH-SEND] [${i + 1}] ✗ Failed to update B2bLead:`, updateErr);
          throw updateErr;
        }

        // NOTE: Referrer record creation disabled for now - will be added back after schema migration
        // Keep referral codes in response for operator visibility
        if (campaignType === "referral" && referralCode) {
          referralCodes.push({ email: biz.email, code: referralCode });
          console.log(`[BATCH-SEND] [${i + 1}] ℹ Referral code generated: ${referralCode}`);
        }
      }

      sent.push(biz.email);
      console.log(`[BATCH-SEND] [${i + 1}] ✓ ${biz.email}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      failed.push({ email: biz.email, error: errorMsg });
      console.error(`[BATCH-SEND] [${i + 1}] ✗ ${biz.email}: ${errorMsg}`);
      console.error(`[BATCH-SEND] Full error:`, err);
      // Log first error in detail so we can debug
      if (i === 0) {
        console.error(`[BATCH-SEND] FIRST EMAIL FAILED - Full stack:`, err);
      }
    }
  }

  console.log(`[BATCH-SEND] ✓ Complete: ${sent.length} sent, ${failed.length} failed`);

  await prisma.$disconnect();

  // Combine sent and failed for details array
  const details = [
    ...sent.map(email => ({ email, status: "sent" })),
    ...failed.slice(0, 10).map(f => ({ email: f.email, status: "failed", error: f.error })),
  ];

  return NextResponse.json({
    success: true,
    campaignId: campaign.id,
    campaignType,
    sent: sent.length,
    failed: failed.length,
    total: businesses.length,
    details,
    ...(campaignType === "referral" && { referralCodes }),
  });
}
