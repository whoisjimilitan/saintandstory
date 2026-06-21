import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[UNDERSTAND-TRACE] Request input:", { id, type: typeof id, length: (id as string)?.length });
    // ID contract: raw database UUID, no prefix stripping needed
    const leadId = id;

    console.log("[UNDERSTAND] ========== REQUEST START ==========");
    console.log(`[UNDERSTAND] Incoming prospectId: "${leadId}"`);
    console.log(`[UNDERSTAND] ID type: ${typeof leadId}`);
    console.log(`[UNDERSTAND] ID length: ${leadId.length}`);
    console.log(`[UNDERSTAND] ID format check: ${leadId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'valid UUID' : 'NOT valid UUID'}`);

    console.log("[UNDERSTAND] Running Prisma query: findUnique on b2bLead");
    const lead = await prisma.b2bLead.findUnique({
      where: { id: leadId as any },
      include: {
        conversationEvents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    console.log(`[UNDERSTAND] Query result: ${lead ? 'FOUND' : 'NOT FOUND'}`);
    if (lead) {
      console.log(`[UNDERSTAND] Record details: businessName="${lead.businessName}", status="${lead.status}"`);
    } else {
      console.log(`[UNDERSTAND] No record found for ID: "${leadId}"`);
      console.log(`[UNDERSTAND] Checking if this ID was returned by Discover...`);
    }

    if (!lead) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    console.log(`[UNDERSTAND] ========== RETURNING SUCCESS ==========`);
    const response = {
      id: lead.id,
      businessName: lead.businessName,
      businessCategory: lead.businessCategory,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      leadState: lead.leadState,
      conversationEvents: lead.conversationEvents,
    };
    console.log(`[UNDERSTAND] Response ID: "${response.id}"`);
    console.log(`[UNDERSTAND] Response businessName: "${response.businessName}"`);
    return NextResponse.json(response);
  } catch (error) {
    console.error("🔥 UNDERSTAND ERROR:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Failed to fetch prospect" },
      { status: 500 }
    );
  }
}
