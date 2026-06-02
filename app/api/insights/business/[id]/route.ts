import { NextRequest, NextResponse } from "next/server";
import {
  getBusinessEvents,
  getHypotheses,
  getReviewExcerpts,
} from "@/lib/interpretation/events";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;

    const [business, hypotheses, reviews] = await Promise.all([
      getBusinessEvents(businessId),
      getHypotheses(businessId),
      getReviewExcerpts(businessId),
    ]);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        placeId: business.placeId,
      },
      hypotheses: hypotheses.map(h => ({
        id: h.id,
        statement: h.statement,
        status: h.status,
        evidenceCount: h.evidenceCount,
        createdAt: h.createdAt,
      })),
      reviews: {
        total: reviews.length,
        excerpts: reviews.slice(0, 5).map(r => ({
          id: r.id,
          text: r.text,
          rating: r.rating,
          author: r.author,
        })),
      },
      conversations: {
        total: business.conversations.length,
        recent: business.conversations.slice(0, 5).map(c => ({
          id: c.id,
          question: c.question,
          outcome: c.outcome
            ? {
                signalType: c.outcome.signalType,
                truthLevel: c.outcome.truthLevel,
                signalClassification: c.outcome.signalClassification,
              }
            : null,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching business insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
