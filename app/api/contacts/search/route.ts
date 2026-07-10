import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user?.emailAddresses[0]?.emailAddress ?? "";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    console.log(`[CONTACTS SEARCH] Searching for: ${query}`);

    // Search by keyword (business name, contact name, industry) or postcode
    const results = await prisma.contact.findMany({
      where: {
        OR: [
          { businessName: { contains: query, mode: "insensitive" } },
          { contactName: { contains: query, mode: "insensitive" } },
          { postcode: { contains: query, mode: "insensitive" } },
          { industry: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { status: "asc" }, // not_called first
      take: 50,
    });

    console.log(
      `[CONTACTS SEARCH] ✓ Found ${results.length} matching contacts`
    );

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("[CONTACTS SEARCH] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to search",
      },
      { status: 500 }
    );
  }
}
