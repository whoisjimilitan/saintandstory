import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUUID, formatValidationError } from "@/lib/validate-request";
import { safeDbCall } from "@/lib/safe-db-call";
import { validationError, notFoundError, databaseError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = id;

    // VALIDATION LAYER: Check UUID format before any database call
    const validation = validateUUID(leadId, "prospectId");
    if (!validation.valid) {
      const message = formatValidationError(validation.errors || []);
      return validationError(message);
    }

    // DATABASE CALL: Wrapped in safeDbCall to catch Prisma errors
    const result = await safeDbCall(
      prisma.b2bLead.findUnique({
        where: { id: leadId as any },
        include: {
          conversationEvents: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      "Understand: fetchProspect"
    );

    if (!result.success) {
      return databaseError("prisma");
    }

    const lead = result.data;
    if (!lead) {
      return notFoundError("Prospect not found");
    }

    // SUCCESS: Return prospect data in expected format
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
    console.error("🔥 UNDERSTAND UNCAUGHT ERROR:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
    });
    return databaseError("prisma");
  }
}
