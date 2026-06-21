import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/validate-request";
import { safeDbCall } from "@/lib/safe-db-call";
import { validationError, notFoundError, databaseError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prospectId = id;

    // Try lookup by UUID first, then by Google Places ID
    let lead = null;

    // FIRST ATTEMPT: UUID lookup
    if (isValidUUID(prospectId)) {
      const result = await safeDbCall(
        prisma.b2bLead.findUnique({
          where: { id: prospectId as any },
          include: {
            conversationEvents: {
              orderBy: { createdAt: "desc" },
            },
          },
        }),
        "Understand: fetchProspectByUUID"
      );

      if (!result.success) {
        return databaseError("prisma");
      }
      lead = result.data;
    }

    // SECOND ATTEMPT: Google Places ID lookup (if UUID lookup failed or ID wasn't UUID)
    if (!lead) {
      const result = await safeDbCall(
        prisma.b2bLead.findFirst({
          where: { googlePlaceId: prospectId },
          include: {
            conversationEvents: {
              orderBy: { createdAt: "desc" },
            },
          },
        }),
        "Understand: fetchProspectByGooglePlaceId"
      );

      if (!result.success) {
        return databaseError("prisma");
      }
      lead = result.data;
    }

    // Not found in either lookup
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
