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
  try {
    console.log("[BATCH-SEND] ✓ Handler invoked");

    if (!process.env.RESEND_API_KEY) {
      console.error("[BATCH-SEND] ✗ CRITICAL: RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured - RESEND_API_KEY missing" },
        { status: 500 }
      );
    }

    const { businesses } = await request.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json(
        { error: "Businesses array required" },
        { status: 400 }
      );
    }

    console.log(`[BATCH-SEND] Processing ${businesses.length} leads`);

    const results = {
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    for (let i = 0; i < businesses.length; i++) {
      const biz = businesses[i];

      try {
        console.log(`[BATCH-SEND] [${i + 1}/${businesses.length}] Processing ${biz.email}`);

        // Find or create lead
        let lead = await prisma.b2bLead.findFirst({
          where: { email: biz.email },
        });

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
          console.log(`[BATCH-SEND] [${i + 1}] Updated existing lead: ${lead.id}`);
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
          console.log(`[BATCH-SEND] [${i + 1}] Created new lead: ${lead.id}`);
        }

        // Generate email
        const { subject, body } = generateEmail(biz);

        // Send via Resend
        console.log(`[BATCH-SEND] [${i + 1}] Calling Resend...`);
        const emailResponse = await resend.emails.send({
          from: "James <james@saintandstoryltd.co.uk>",
          to: biz.email,
          subject,
          html: body,
          replyTo: "hello@saintandstoryltd.co.uk",
        });

        console.log(`[BATCH-SEND] [${i + 1}] Resend response:`, {
          hasError: !!emailResponse.error,
          messageId: emailResponse.data?.id,
        });

        if (emailResponse.error) {
          console.error(`[BATCH-SEND] [${i + 1}] Resend error:`, emailResponse.error);
          results.failed++;
          results.details.push({
            email: biz.email,
            status: "failed",
            error: String(emailResponse.error),
          });
          continue;
        }

        if (!emailResponse.data?.id) {
          console.error(`[BATCH-SEND] [${i + 1}] No message ID returned`);
          results.failed++;
          results.details.push({
            email: biz.email,
            status: "failed",
            error: "No message ID",
          });
          continue;
        }

        // Record outreach
        await prisma.b2bOutreach.create({
          data: {
            leadId: lead.id,
            subject,
            body,
            sentAt: new Date(),
            resendMessageId: emailResponse.data.id,
            emailType: "initial",
            sent_by: "operator",
          },
        });

        results.sent++;
        results.details.push({
          email: biz.email,
          status: "sent",
          messageId: emailResponse.data.id,
        });

        console.log(`[BATCH-SEND] [${i + 1}] ✓ Email sent successfully`);
      } catch (err) {
        console.error(`[BATCH-SEND] [${i}] Error:`, err);
        results.failed++;
        results.details.push({
          email: biz.email,
          status: "error",
          error: String(err),
        });
      }
    }

    console.log(`[BATCH-SEND] ✓ Complete: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      total: businesses.length,
      details: results.details.slice(0, 10),
    });
  } catch (error) {
    console.error("[BATCH-SEND] Fatal error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
