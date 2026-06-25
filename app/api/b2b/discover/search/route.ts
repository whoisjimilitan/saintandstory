import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SearchQuery {
  postcode?: string;
  city?: string;
  status?: string;
  limit?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const postcode = searchParams.get("postcode");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const location = searchParams.get("location") || "United Kingdom"; // DEFAULT: UK
    const limit = parseInt(searchParams.get("limit") || "500", 10);

    if (!query && !postcode && !city) {
      return NextResponse.json(
        { error: "At least one filter required: query, postcode or city" },
        { status: 400 }
      );
    }

    // UK postcode pattern validation
    const isUKPostcode = (pc: string) => {
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(pc);
    };

    // US location detection - reject US-based results
    const isUSLocation = (loc: string | null | undefined) => {
      if (!loc) return false;
      const upperLoc = loc.toUpperCase().trim();
      const usStates = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'NM', 'NV', 'AR', 'MS', 'KS', 'IA', 'NE', 'ID', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'WY', 'VT'];
      return usStates.includes(upperLoc) || /^\d{5}(-\d{4})?$/.test(loc);
    };

    // VALIDATE: Reject non-UK postcodes
    if (postcode && !isUKPostcode(postcode)) {
      return NextResponse.json(
        { error: "Invalid UK postcode format", success: false, leads: [] },
        { status: 400 }
      );
    }

    // US states to exclude from results
    const usStates = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'NM', 'NV', 'AR', 'MS', 'KS', 'IA', 'NE', 'ID', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'WY', 'VT'];

    const leads = await prisma.b2bLead.findMany({
      where: {
        ...(query && {
          OR: [
            {
              businessName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              businessCategory: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        }),
        ...(postcode && {
          postcode: {
            startsWith: postcode.toUpperCase(),
          },
        }),
        ...(city && {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }),
        ...(status && { status }),
      },
      select: {
        id: true,
        businessName: true,
        businessCategory: true,
        email: true,
        phone: true,
        city: true,
        postcode: true,
        status: true,
        leadState: true,
        createdAt: true,
        painPoint: true,
        businessEvidence: true,
      },
      take: Math.min(limit, 1000),
      orderBy: { createdAt: "desc" },
    });

    // STRICT: Filter out US-based results at application level (more reliable than DB regex)
    // Check both city and postcode for US patterns
    const ukOnlyLeads = leads.filter(lead => {
      const city = (lead.city || "").toUpperCase().trim();
      const postcode = (lead.postcode || "").toUpperCase().trim();

      // Reject if city is US state abbreviation
      if (usStates.includes(city)) return false;

      // Reject if postcode contains US state abbreviation
      for (const state of usStates) {
        if (postcode.includes(state)) return false;
      }

      // Reject if postcode is ZIP code pattern (5 digits or 5+4 digits)
      if (/^\d{5}(-\d{4})?$/.test(postcode)) return false;

      // Reject if city is a state name (common US state names)
      const usStateNames = ['california', 'texas', 'florida', 'new york', 'pennsylvania', 'illinois', 'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia', 'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana', 'missouri', 'maryland', 'wisconsin', 'colorado', 'minnesota', 'south carolina', 'alabama', 'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'utah', 'nevada', 'arkansas', 'mississippi', 'kansas', 'iowa', 'nebraska', 'idaho', 'hawaii', 'new hampshire', 'maine', 'montana', 'rhode island', 'delaware', 'south dakota', 'north dakota', 'alaska', 'wyoming', 'vermont'];
      if (usStateNames.includes(city.toLowerCase())) return false;

      return true;
    });

    return NextResponse.json({
      success: true,
      count: ukOnlyLeads.length,
      results: ukOnlyLeads,
    });
  } catch (error) {
    console.error("[B2B DISCOVER] Error:", error);
    return NextResponse.json(
      { error: "Failed to search leads" },
      { status: 500 }
    );
  }
}
