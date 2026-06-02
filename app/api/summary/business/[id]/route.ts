import { NextRequest, NextResponse } from "next/server";
import {
  getBusinessEvents,
  getHypotheses,
  getReviewExcerpts,
  getOutcomeHistory,
} from "@/lib/interpretation/events";
import {
  extractPatterns,
  countOutcomeTypes,
  summarizeObservations,
} from "@/lib/interpretation/patterns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = id;

    const [business, hypotheses, reviews, outcomes] = await Promise.all([
      getBusinessEvents(businessId),
      getHypotheses(businessId),
      getReviewExcerpts(businessId),
      getOutcomeHistory(businessId),
    ]);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const patterns = extractPatterns(reviews);
    const outcomeCounts = countOutcomeTypes(outcomes);

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
      },
      whatHasBeenObserved: {
        reviewsAnalyzed: reviews.length,
        conversationsLogged: outcomes.length,
        hypothesesDocumented: hypotheses.length,
        observedPatterns: patterns.map(p => ({
          description: p.description,
          occurrences: p.occurrences,
        })),
      },
      whatRemainsUnknown: [
        hypotheses.length === 0
          ? "No hypotheses have been formulated yet"
          : null,
        outcomes.length === 0
          ? "No conversations have been logged yet"
          : null,
        patterns.length === 0
          ? "No patterns are yet visible in available data"
          : null,
      ].filter(Boolean),
      conversationOutcomes: outcomeCounts,
      dataQuality: {
        hasReviews: reviews.length > 0,
        hasConversations: outcomes.length > 0,
        hasHypotheses: hypotheses.length > 0,
        totalDataPoints: reviews.length + outcomes.length + hypotheses.length,
      },
      nextStep:
        outcomes.length === 0
          ? "No conversations logged yet. Start with the opening question."
          : "Review conversation outcomes and update hypotheses accordingly.",
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
