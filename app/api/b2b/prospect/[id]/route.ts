import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // ID contract: raw database UUID, no prefix stripping needed
    const leadId = id;

    const lead = await prisma.b2bLead.findUnique({
      where: { id: leadId as any },
      include: {
        conversationEvents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: lead.id,
      businessName: lead.businessName,
      businessCategory: lead.businessCategory,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      leadState: lead.leadState,
      conversationEvents: lead.conversationEvents,
    });
  } catch (error) {
    console.error("[B2B PROSPECT] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospect" },
      { status: 500 }
    );
  }
}
