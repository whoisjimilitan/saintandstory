import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * OUTCOMES: Record what reality said
 *
 * Shows:
 * - outcome signal
 * - truth level
 * - notes
 * - timestamp
 *
 * Supports all truth contract outcome types.
 * No outcome scoring.
 */

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id;

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
        truthLevel: c.outcome!.truthLevel,
        classification: c.outcome!.signalClassification,
        notes: c.outcome!.notes,
      }));

    const signalCounts = {
      no_contact: outcomes.filter(o => o.signal.type === "no_contact").length,
      contacted: outcomes.filter(o => o.signal.type === "contacted").length,
      positive_response: outcomes.filter(
        o => o.signal.type === "positive_response"
      ).length,
      negative_response: outcomes.filter(
        o => o.signal.type === "negative_response"
      ).length,
      neutral_response: outcomes.filter(
        o => o.signal.type === "neutral_response"
      ).length,
      no_response: outcomes.filter(o => o.signal.type === "no_response").length,
      deal_not_possible: outcomes.filter(
        o => o.signal.type === "deal_not_possible"
      ).length,
    };

    return NextResponse.json({
      businessId,
      totalOutcomes: outcomes.length,
      outcomes: outcomes.reverse(),
      signalDistribution: signalCounts,
      truthLevels: {
        description:
          "Truth levels indicate confidence in the outcome recording",
        guess: "Assumption based on pattern only",
        inferred: "Interpretation of what was said",
        direct: "Business owner stated explicitly",
        verified: "Externally confirmed",
      },
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
    no_contact: "Business not reached",
    contacted: "Business was contacted",
    positive_response: "Positive engagement",
    negative_response: "Negative response",
    neutral_response: "Neutral response",
    no_response: "No response received",
    deal_not_possible: "Not a potential customer",
  };
  return descriptions[signalType] || "Unknown signal";
}
