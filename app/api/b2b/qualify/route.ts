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

    // VALIDATION: Check prospect exists before updating
    const prospectExists = await prisma.b2bLead.findUnique({
      where: { id: prospectId },
      select: { id: true },
    });

    if (!prospectExists) {
      return notFoundError("Prospect not found");
    }

    // DATABASE CALL: Update prospect with qualification data
    let result;
    try {
      const updated = await prisma.b2bLead.update({
        where: { id: prospectId },
        data: {
          status: status || "qualified",
          leadState: "qualified",
          notes: notes || undefined,
        },
      });
      result = { success: true, data: updated };
    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      console.error("🔥 QUALIFY UPDATE ERROR:", {
        prospectId,
        error: errorMsg,
        statusCode: dbError instanceof Error ? (dbError as any).code : undefined,
      });
      return NextResponse.json(
        { error: `Database update failed: ${errorMsg}` },
        { status: 500 }
      );
    }

    if (!result.success) {
      const errorMsg = result.error?.message || "Unknown database error";
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
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
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    // Return specific error message
    return NextResponse.json(
      { error: `Qualification error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
