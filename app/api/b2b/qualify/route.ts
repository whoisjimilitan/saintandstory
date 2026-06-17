import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface QualifyRequest {
  outreach_id: string;
  prospect_first_name: string;
  prospect_role: string;
  prospect_phone: string;
  prospect_email: string;
  proposed_call_time: string;
  notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QualifyRequest;

    // Get the lead_id from outreach
    const outreach = await prisma.b2b_outreach.findUnique({
      where: { id: body.outreach_id },
      select: { lead_id: true },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "Outreach not found" },
        { status: 404 }
      );
    }

    // Create qualification record
    await prisma.b2b_prospect_qualifications.create({
      data: {
        lead_id: outreach.lead_id,
        prospect_first_name: body.prospect_first_name,
        prospect_role: body.prospect_role,
        prospect_phone: body.prospect_phone,
        prospect_email: body.prospect_email,
        proposed_call_time: body.proposed_call_time,
        notes: body.notes,
      },
    });

    // Update lead status to qualified
    await prisma.b2b_leads.update({
      where: { id: outreach.lead_id },
      data: {
        pipeline_stage: "QUALIFIED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[QUALIFY] Error:", error);
    return NextResponse.json(
      { error: "Failed to qualify" },
      { status: 500 }
    );
  }
}
