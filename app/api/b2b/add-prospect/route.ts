import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichLeadWithOutreach } from "@/lib/b2b-enrichment-orchestrator";

interface AddProspectRequest {
  business_name: string;
  business_category: string;
  city?: string;
  postcode?: string;
  contact_name?: string;
  email: string;
  phone?: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AddProspectRequest;

    // Check if already exists
    const existing = await prisma.b2b_leads.findFirst({
      where: {
        email: body.email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Prospect already exists" },
        { status: 409 }
      );
    }

    // Create lead
    const lead = await prisma.b2b_leads.create({
      data: {
        business_name: body.business_name,
        business_category: body.business_category,
        email: body.email,
        phone: body.phone || null,
        city: body.city || null,
        postcode: body.postcode || null,
        contact_name: body.contact_name || null,
        engagement_score: 50,
        lead_tier: "B",
        pipeline_stage: "NEW",
        source: "manual",
        updated_at: new Date(),
      },
    });

    // Enrich automatically
    await enrichLeadWithOutreach(lead.id);

    return NextResponse.json(
      { success: true, lead_id: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADD_PROSPECT] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to add prospect",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
