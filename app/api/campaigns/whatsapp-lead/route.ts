import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, companyName, city } = body;

    if (!phone || !companyName || !city) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create B2B lead from ad campaign (WhatsApp channel)
    const lead = await prisma.b2bLead.create({
      data: {
        businessName: companyName,
        phone,
        city,
        channel: "whatsapp",
        company_size: "small", // Ad targets small businesses
        source: "whatsapp_ad",
        status: "new",
      },
    });

    // Log the lead capture event
    await prisma.b2bLeadSource.create({
      data: {
        leadId: lead.id,
        source: "whatsapp_ad",
        metadata: { campaign: "urgent_delivery_20250627" },
      },
    });

    return Response.json({
      success: true,
      leadId: lead.id,
      message: "Lead captured! Opening WhatsApp...",
    });
  } catch (error) {
    console.error("[WHATSAPP LEAD CAPTURE] Error:", error);
    return Response.json({ error: "Failed to capture lead" }, { status: 500 });
  }
}
