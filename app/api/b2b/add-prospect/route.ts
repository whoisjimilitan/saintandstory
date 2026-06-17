import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AddProspectRequest {
  businessName: string;
  businessCategory: string;
  email: string;
  city?: string;
  postcode?: string;
  contactName?: string;
  phone?: string;
  website?: string;
  niche?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddProspectRequest;

    if (!body.businessName || !body.businessCategory || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: businessName, businessCategory, email" },
        { status: 400 }
      );
    }

    const existing = await prisma.b2bLead.findFirst({
      where: { email: body.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Lead with this email already exists" },
        { status: 409 }
      );
    }

    const lead = await prisma.b2bLead.create({
      data: {
        businessName: body.businessName,
        businessCategory: body.businessCategory,
        email: body.email,
        city: body.city || null,
        postcode: body.postcode || null,
        contactName: body.contactName || null,
        phone: body.phone || null,
        website: body.website || null,
        niche: body.niche || null,
        notes: body.notes || null,
        status: "new",
        source: "manual",
        leadState: "new",
      },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Prospect added successfully",
    });
  } catch (error) {
    console.error("[B2B ADD-PROSPECT] Error:", error);
    return NextResponse.json(
      { error: "Failed to add prospect" },
      { status: 500 }
    );
  }
}
