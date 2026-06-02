import { NextRequest, NextResponse } from "next/server";
import { getConversationTimeline } from "@/lib/interpretation/events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = id;

    const timeline = await getConversationTimeline(businessId);

    const events = timeline.map(conversation => ({
      id: conversation.id,
      date: conversation.createdAt,
      type: "conversation",
      question: conversation.question,
      outcome: conversation.outcome
        ? {
            signalType: conversation.outcome.signalType,
            truthLevel: conversation.outcome.truthLevel,
            signalClassification: conversation.outcome.signalClassification,
            notes: conversation.outcome.notes,
            date: conversation.outcome.createdAt,
          }
        : null,
    }));

    return NextResponse.json({
      businessId,
      totalEvents: events.length,
      events: events.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      }),
    });
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
