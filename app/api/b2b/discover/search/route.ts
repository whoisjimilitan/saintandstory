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
    const postcode = searchParams.get("postcode");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!postcode && !city) {
      return NextResponse.json(
        { error: "At least one filter required: postcode or city" },
        { status: 400 }
      );
    }

    const leads = await prisma.b2bLead.findMany({
      where: {
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
      take: Math.min(limit, 100),
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
