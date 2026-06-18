import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get today's start (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all responses from today with lead details
    const responses = await prisma.b2bLead.findMany({
      where: {
        outreach: {
          some: {
            b2b_responses: {
              some: {
                responded_at: {
                  gte: today,
                },
              },
            },
          },
        },
      },
      include: {
        outreach: {
          include: {
            b2b_responses: {
              where: {
                responded_at: {
                  gte: today,
                },
              },
            },
          },
        },
      },
      orderBy: {
        last_engagement_at: "desc",
      },
    });

    // Transform to response format
    const formattedResponses = responses.flatMap((lead) =>
      lead.outreach
        .filter((outreach) => outreach.b2b_responses.length > 0)
        .flatMap((outreach) =>
          outreach.b2b_responses.map((response) => ({
            id: response.id,
            business_name: lead.businessName,
            email: lead.email,
            response_type: response.response_type,
            responded_at: response.responded_at,
            engagement_score: lead.engagement_score || 0,
            pressure_type: outreach.pressure_type || "unknown",
          }))
        )
    );

    return NextResponse.json({
      success: true,
      responses: formattedResponses,
      count: formattedResponses.length,
    });
  } catch (error) {
    console.error("[B2B RESPONSES TODAY] Error:", error);
    return NextResponse.json(
      { error: "Failed to load responses" },
      { status: 500 }
    );
  }
}
