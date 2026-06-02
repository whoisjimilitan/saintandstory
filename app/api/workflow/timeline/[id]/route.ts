import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * TIMELINE: Chronological reality
 *
 * Single ordered stream of:
 * - reviews
 * - hypotheses
 * - conversations
 * - outcomes
 * - assumption events
 *
 * User can see what happened, when, in what order.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = id;

    const [reviews, hypotheses, conversations] = await Promise.all([
      prisma.review.findMany({
        where: { businessId },
      }),
      prisma.hypothesis.findMany({
        where: { businessId },
      }),
      prisma.conversation.findMany({
        where: { businessId },
        include: { outcome: true },
      }),
    ]);

    // Combine all events into single timeline
    const timelineEvents: any[] = [];

    // Add reviews
    reviews.forEach(r => {
      timelineEvents.push({
        id: `review-${r.id}`,
        date: r.createdAt,
        type: "review",
        title: "Review published",
        data: {
          text: r.text.substring(0, 100) + "...",
          rating: r.rating,
          author: r.author,
        },
      });
    });

    // Add hypotheses
    hypotheses.forEach(h => {
      timelineEvents.push({
        id: `hypothesis-${h.id}`,
        date: h.createdAt,
        type: "hypothesis",
        title: "Hypothesis formulated",
        data: {
          statement: h.statement,
          status: h.status,
        },
      });
    });

    // Add conversations and outcomes
    conversations.forEach(c => {
      timelineEvents.push({
        id: `conversation-${c.id}`,
        date: c.createdAt,
        type: "conversation",
        title: "Conversation conducted",
        data: {
          question: c.question,
        },
      });

      if (c.outcome) {
        timelineEvents.push({
          id: `outcome-${c.outcome.id}`,
          date: c.outcome.createdAt,
          type: "outcome",
          title: "Outcome recorded",
          data: {
            signal: c.outcome.signalType,
            truthLevel: c.outcome.truthLevel,
            notes: c.outcome.notes?.substring(0, 100),
          },
        });
      }
    });

    // Sort by date
    timelineEvents.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      businessId,
      totalEvents: timelineEvents.length,
      events: timelineEvents.map(e => ({
        ...e,
        date: e.date.toISOString(),
      })),
      eventTypes: {
        review: timelineEvents.filter(e => e.type === "review").length,
        hypothesis: timelineEvents.filter(e => e.type === "hypothesis").length,
        conversation: timelineEvents.filter(e => e.type === "conversation")
          .length,
        outcome: timelineEvents.filter(e => e.type === "outcome").length,
      },
      explanation:
        "This timeline shows everything that happened with this business, in order. It preserves the complete history of discovery.",
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
