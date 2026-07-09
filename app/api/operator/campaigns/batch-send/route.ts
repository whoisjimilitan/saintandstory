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

export async function POST(request: NextRequest) {
  console.log("[BATCH-SEND] ✓ Handler invoked");

  if (!process.env.RESEND_API_KEY) {
    console.error("[BATCH-SEND] ✗ CRITICAL: RESEND_API_KEY not configured");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    );
  }

  const { businesses, mode = "now" } = await request.json();
  // mode: "now" = send all immediately, "warmup" = queue with staggered times (20/hour)
  if (!Array.isArray(businesses) || businesses.length === 0) {
    return NextResponse.json({ error: "Invalid businesses array" }, { status: 400 });
  }

  console.log(`[BATCH-SEND] Processing ${businesses.length} leads`);

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

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    const { subject, body } = generateEmail(biz);

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
        // Send now
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
      }

      sent.push(biz.email);
      console.log(`[BATCH-SEND] [${i + 1}] ✓ ${biz.email}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      failed.push({ email: biz.email, error: errorMsg });
      console.error(`[BATCH-SEND] [${i + 1}] ✗ ${biz.email}: ${errorMsg}`);
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
    sent: sent.length,
    failed: failed.length,
    total: businesses.length,
    details,
  });
}
