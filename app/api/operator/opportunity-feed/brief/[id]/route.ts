import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[OPPORTUNITY FEED] Fetching brief:", params.id);

  try {
    const opportunity = await prisma.opportunityFeed.findUnique({
      where: { id: params.id },
    });

    if (!opportunity) {
      console.log("[OPPORTUNITY FEED] Brief not found:", params.id);
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    if (!opportunity.briefHtml) {
      console.log("[OPPORTUNITY FEED] Brief not generated:", params.id);
      return NextResponse.json(
        { error: "Brief not generated yet" },
        { status: 404 }
      );
    }

    console.log("[OPPORTUNITY FEED] Brief served for:", opportunity.companyName);

    // Return HTML as response
    return new NextResponse(opportunity.briefHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Brief fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
