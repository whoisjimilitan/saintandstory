import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, companyName, city } = body;

    if (!email || !companyName || !city) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create B2B lead from ad campaign (Email channel)
    const lead = await prisma.b2bLead.create({
      data: {
        businessName: companyName,
        email,
        city,
        channel: "email",
        company_size: "medium", // Ad targets medium/enterprise businesses
        source: "email_ad",
        status: "new",
      },
    });

    // Log the lead capture event
    await prisma.b2bLeadSource.create({
      data: {
        leadId: lead.id,
        source: "email_ad",
        metadata: { campaign: "recurring_courier_20250627" },
      },
    });

    return Response.json({
      success: true,
      leadId: lead.id,
      message: "Lead captured! Check your email for next steps.",
    });
  } catch (error) {
    console.error("[EMAIL LEAD CAPTURE] Error:", error);
    return Response.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}
