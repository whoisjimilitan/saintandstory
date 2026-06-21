import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { safeDbCall } from "@/lib/safe-db-call";
import { validationError, notFoundError, databaseError, authError } from "@/lib/api-response";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

export async function POST(request: NextRequest) {
  try {
    // AUTH LAYER: Check authentication
    if (!(await isAdmin())) {
      return authError("Forbidden");
    }

    // VALIDATION LAYER: Parse and validate request body
    const body = await request.json() as {
      prospectId: string;
      confidenceScore?: number;
      notes?: string;
      status?: string;
    };

    const { prospectId, confidenceScore, notes, status } = body;

    if (!prospectId) {
      return NextResponse.json(
        { error: "prospectId required" },
        { status: 400 }
      );
    }

    // DATABASE CALL: Update prospect with qualification data
    const result = await safeDbCall(
      prisma.b2bLead.update({
        where: { id: prospectId },
        data: {
          status: status || "qualified",
          leadState: "qualified",
          notes: notes || undefined,
        },
      }),
      "Qualify: updateProspect"
    );

    if (!result.success) {
      return databaseError("prisma");
    }

    if (!result.data) {
      return notFoundError("Prospect not found");
    }

    // SUCCESS: Return qualification result
    return NextResponse.json({
      success: true,
      prospectId,
      status: status || "qualified",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("🔥 QUALIFY UNCAUGHT ERROR:", {
      message: errorMsg,
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return actual error to client for debugging
    return NextResponse.json(
      { error: `Qualification failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
