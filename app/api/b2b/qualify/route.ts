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
    console.log("🔵 QUALIFY: POST request received");

    // AUTH LAYER: Check authentication
    if (!(await isAdmin())) {
      console.log("🔴 QUALIFY: Auth check failed");
      return authError("Forbidden");
    }

    // VALIDATION LAYER: Parse and validate request body
    let body;
    try {
      body = await request.json();
      console.log("🔵 QUALIFY: Request body parsed", { bodyKeys: Object.keys(body) });
    } catch (parseErr) {
      console.error("🔴 QUALIFY: JSON parse error", parseErr);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { prospectId, confidenceScore, notes, status } = body;

    if (!prospectId) {
      console.error("🔴 QUALIFY: Missing prospectId");
      return NextResponse.json(
        { error: "prospectId required" },
        { status: 400 }
      );
    }

    console.log("🔵 QUALIFY: Checking if prospect exists", { prospectId });

    // VALIDATION: Check prospect exists before updating
    const prospectExists = await prisma.b2bLead.findUnique({
      where: { id: prospectId },
      select: { id: true },
    });

    if (!prospectExists) {
      console.error("🔴 QUALIFY: Prospect not found", { prospectId });
      return notFoundError("Prospect not found");
    }

    console.log("🔵 QUALIFY: Prospect exists, attempting update");

    // DATABASE CALL: Update prospect with qualification data
    try {
      console.log("🔵 QUALIFY: Starting Prisma update");
      const updated = await prisma.b2bLead.update({
        where: { id: prospectId },
        data: {
          status: status || "qualified",
          leadState: "qualified",
          notes: notes || undefined,
        },
      });
      console.log("🟢 QUALIFY: Database update succeeded", { updatedId: updated.id });
    } catch (dbError) {
      const errorMsg = dbError instanceof Error ? dbError.message : String(dbError);
      const errorCode = (dbError as any)?.code;
      const errorMeta = (dbError as any)?.meta;

      console.error("🔥 QUALIFY UPDATE ERROR:", {
        prospectId,
        message: errorMsg,
        code: errorCode,
        meta: errorMeta,
        fullError: JSON.stringify(dbError),
      });

      // Return detailed error to client for debugging
      return NextResponse.json(
        {
          error: `Qualification failed: ${errorMsg}`,
          details: {
            code: errorCode,
            meta: errorMeta,
            prospectId
          }
        },
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
