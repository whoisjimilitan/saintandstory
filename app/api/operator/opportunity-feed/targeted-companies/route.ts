import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Get list of companies already targeted (in OpportunityFeed)
 *
 * Used by Discover page to deduplicate search results.
 * Returns company names that have already been added to the system.
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all unique company names from OpportunityFeed
    const targetedCompanies = await prisma.opportunityFeed.findMany({
      select: { companyName: true },
      distinct: ["companyName"],
      where: {
        companyName: { not: { equals: null } }
      }
    });

    const companies = targetedCompanies
      .map(c => (c.companyName || "").toLowerCase())
      .filter(name => name.length > 0);

    console.log(`[TARGETED-COMPANIES] Found ${companies.length} already-targeted companies`);

    return NextResponse.json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    console.error("[TARGETED-COMPANIES] Error:", error);
    // Return empty list on error (fail gracefully)
    return NextResponse.json({
      success: true,
      count: 0,
      companies: []
    });
  }
}
