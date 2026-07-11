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
    const businessName = searchParams.get("businessName") || "";
    const postcode = searchParams.get("postcode") || "";

    const query = businessName || postcode;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    console.log(`[CONTACTS SEARCH] ════════════════════════════`);
    console.log(`[CONTACTS SEARCH] Searching database for: ${query}`);
    console.log(`[CONTACTS SEARCH] Search type: ${postcode ? 'postcode' : 'businessName'}`);

    let whereClause: any;

    if (postcode) {
      // Search only postcode
      console.log(`[CONTACTS SEARCH] Querying postcode field`);
      whereClause = {
        postcode: { contains: postcode, mode: "insensitive" },
      };
    } else {
      // Search business name
      console.log(`[CONTACTS SEARCH] Querying businessName field`);
      whereClause = {
        businessName: { contains: businessName, mode: "insensitive" },
      };
    }

    const results = await prisma.contact.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    console.log(`[CONTACTS SEARCH] ✓ Query completed`);
    console.log(`[CONTACTS SEARCH] Results found: ${results.length}`);

    if (results.length === 0) {
      console.log(`[CONTACTS SEARCH] ℹ️  No contacts matched query`);
    } else {
      console.log(`[CONTACTS SEARCH] First result: ${results[0]?.businessName}`);
    }

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("[CONTACTS SEARCH] ✗ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to search",
      },
      { status: 500 }
    );
  }
}
