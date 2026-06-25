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

    // VALIDATE: Reject non-UK postcodes
    if (postcode && !isUKPostcode(postcode)) {
      return NextResponse.json(
        { error: "Invalid UK postcode format", success: false, leads: [] },
        { status: 400 }
      );
    }

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
      take: Math.min(limit, 500),
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: leads.length,
      results: leads,
    });
  } catch (error) {
    console.error("[B2B DISCOVER] Error:", error);
    return NextResponse.json(
      { error: "Failed to search leads" },
      { status: 500 }
    );
  }
}
