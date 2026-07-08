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

James`;

  return {
    subject: "Hoping you could help",
    body,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { businesses } = await request.json();

    if (!Array.isArray(businesses) || businesses.length === 0) {
      return NextResponse.json(
        { error: "Businesses array required" },
        { status: 400 }
      );
    }

    console.log(`[BATCH-SEND] Starting batch send for ${businesses.length} leads`);

    const results = {
      sent: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const biz of businesses) {
      try {
        // Upsert lead
        const lead = await prisma.b2bLead.upsert({
          where: { email: biz.email },
          update: {
            businessCategory: biz.category,
            contactName: biz.contactName,
            website: biz.website,
            source: biz.source || "campaign",
          },
          create: {
            businessName: biz.name,
            email: biz.email,
            businessCategory: biz.category,
            contactName: biz.contactName,
            website: biz.website,
            status: "new",
            source: biz.source || "campaign",
          },
        });

        // Generate email
        const { subject, body } = generateEmail(biz);

        // Send email
        const emailResponse = await resend.emails.send({
          from: "James <james@saintandstoryltd.co.uk>",
          to: biz.email,
          subject,
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #0D0D0D; }
    .content { line-height: 1.6; font-size: 14px; margin-bottom: 30px; white-space: pre-line; }
    .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8E8E8; font-size: 13px; color: #666666; }
    .cta { margin-top: 20px; padding: 12px 20px; background-color: #0D0D0D; color: white; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 13px; font-weight: 500; }
    .logo { max-width: 32px; height: auto; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://saintandstoryltd.co.uk/logo-mark.svg" alt="Saint & Story" class="logo">
    <div class="content">${body.replace(/\n/g, "<br />")}</div>
    <div class="signature">
      <strong>James</strong><br>
      Co-Founder, Saint & Story<br>
      <a href="https://saintandstoryltd.co.uk" style="color: #0D0D0D; text-decoration: none;">Check out our website</a>
    </div>
  </div>
</body>
</html>`,
        });

        if (emailResponse.error) {
          results.failed++;
          results.details.push({
            email: biz.email,
            status: "failed",
            error: emailResponse.error,
          });
          console.error(`[BATCH-SEND] Failed to send to ${biz.email}`, emailResponse.error);
          continue;
        }

        // Record outreach
        await prisma.b2bOutreach.create({
          data: {
            leadId: lead.id,
            subject,
            body,
            sentAt: new Date(),
            resendMessageId: emailResponse.data?.id || null,
            emailType: "initial",
            sent_by: "operator",
          },
        });

        results.sent++;
        results.details.push({
          email: biz.email,
          status: "sent",
          messageId: emailResponse.data?.id,
        });

        console.log(`[BATCH-SEND] Sent to ${biz.email}`);
      } catch (err) {
        results.failed++;
        results.details.push({
          email: biz.email,
          status: "error",
          error: String(err),
        });
        console.error(`[BATCH-SEND] Error for ${biz.email}:`, err);
      }
    }

    console.log(
      `[BATCH-SEND] Complete: ${results.sent} sent, ${results.failed} failed`
    );

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      total: businesses.length,
      details: results.details.slice(0, 10), // Return first 10 for preview
    });
  } catch (error) {
    console.error("[BATCH-SEND] Error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
