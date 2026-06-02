import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * OUTCOMES: Record what reality said
 *
 * Phase 3.3: 3-step capture
 * 1. What happened? (signal type)
 * 2. What surprised you? (unexpectedLearning)
 * 3. What does this say? (classification)
 *
 * No outcome scoring. Store exactly as entered.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = id;

    // Get all outcomes for a business
    const conversations = await prisma.conversation.findMany({
      where: { businessId },
      include: {
        outcome: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const outcomes = conversations
      .filter(c => c.outcome)
      .map(c => ({
        id: c.outcome!.id,
        conversationId: c.id,
        question: c.question,
        recordedAt: c.outcome!.createdAt,
        signal: {
          type: c.outcome!.signalType,
          description: getSignalDescription(c.outcome!.signalType),
        },
        classification: c.outcome!.signalClassification,
        unexpectedLearning: c.outcome!.unexpectedLearning,
      }));

    const signalCounts = {
      no_answer: outcomes.filter(o => o.signal.type === "no_answer").length,
      spoke_briefly: outcomes.filter(o => o.signal.type === "spoke_briefly").length,
      real_conversation: outcomes.filter(o => o.signal.type === "real_conversation").length,
      not_interested: outcomes.filter(o => o.signal.type === "not_interested").length,
      wrong_fit: outcomes.filter(o => o.signal.type === "wrong_fit").length,
    };

    return NextResponse.json({
      businessId,
      totalOutcomes: outcomes.length,
      outcomes: outcomes.reverse(),
      signalDistribution: signalCounts,
      nextAction:
        outcomes.length === 0
          ? {
              type: "log_outcome",
              label: "Record outcome from conversation",
            }
          : {
              type: "review_contradictions",
              label: "Review outcomes against hypotheses",
            },
    });
  } catch (error) {
    console.error("Error fetching outcomes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getSignalDescription(signalType: string): string {
  const descriptions: Record<string, string> = {
    no_answer: "No contact made",
    spoke_briefly: "Brief conversation",
    real_conversation: "Substantive discussion",
    not_interested: "Not interested",
    wrong_fit: "Wrong business type",
  };
  return descriptions[signalType] || "Unknown signal";
}
