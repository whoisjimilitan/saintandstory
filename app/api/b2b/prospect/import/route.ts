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
    const body = await request.json() as { googlePlaceId: string; businessName?: string; city?: string };
    const { googlePlaceId, businessName, city } = body;

    if (!googlePlaceId) {
      return NextResponse.json(
        { error: "googlePlaceId required" },
        { status: 400 }
      );
    }

    // Try to find existing prospect by Google Places ID
    const findResult = await safeDbCall(
      prisma.b2bLead.findFirst({
        where: { googlePlaceId },
        select: { id: true },
      }),
      "ImportProspect: findByGooglePlaceId"
    );

    if (!findResult.success) {
      return databaseError("prisma");
    }

    // If found, return the existing UUID
    if (findResult.data?.id) {
      return NextResponse.json({
        id: findResult.data.id,
        imported: false,
      });
    }

    // If not found, create a new prospect record
    const createResult = await safeDbCall(
      prisma.b2bLead.create({
        data: {
          googlePlaceId,
          businessName: businessName || "Unknown Business",
          city: city || undefined,
          source: "discovery",
          status: "new",
          leadState: "new",
        },
        select: { id: true },
      }),
      "ImportProspect: createNew"
    );

    if (!createResult.success || !createResult.data) {
      return databaseError("prisma");
    }

    // SUCCESS: Return the new UUID
    return NextResponse.json({
      id: createResult.data.id,
      imported: true,
    });
  } catch (error) {
    console.error("🔥 IMPORT PROSPECT UNCAUGHT ERROR:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
    });
    return databaseError("prisma");
  }
}
