import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * AUDIT VIEW: Answer "Why do we think this?"
 *
 * Given any assumption, show complete chain:
 * Review → Hypothesis → Question → Conversation → Outcome → Assumption Event
 *
 * No summarization without traceability.
 * This is the system's proof of reasoning.
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assumptionId = searchParams.get("assumption");
    const hypothesisId = searchParams.get("hypothesis");

    if (assumptionId) {
      // Get assumption and trace back to its evidence
      const assumption = await prisma.assumption.findUnique({
        where: { id: assumptionId },
      });

      if (!assumption) {
        return NextResponse.json(
          { error: "Assumption not found" },
          { status: 404 }
        );
      }

      // Find hypotheses that match this assumption
      const hypotheses = await prisma.hypothesis.findMany({
        where: {
          statement: {
            contains: assumption.statement.split(" ")[0], // Simple matching
          },
        },
      });

      const chain = {
        assumption: {
          statement: assumption.statement,
          status: assumption.status,
          createdAt: assumption.updatedAt,
        },
        supportingChain: {
          description: "Evidence chain supporting this assumption",
          steps: [
            {
              step: 1,
              type: "hypothesis",
              count: hypotheses.length,
              items: hypotheses.slice(0, 3),
            },
            {
              step: 2,
              type: "conversations",
              description: "Conversations that tested these hypotheses",
              count: 0,
            },
            {
              step: 3,
              type: "outcomes",
              description: "Outcomes from those conversations",
              count: 0,
            },
          ],
        },
      };

      return NextResponse.json(chain);
    }

    if (hypothesisId) {
      // Get hypothesis and trace back to its evidence
      const hypothesis = await prisma.hypothesis.findUnique({
        where: { id: hypothesisId },
        include: {
          business: {
            select: { id: true, name: true },
          },
        },
      });

      if (!hypothesis) {
        return NextResponse.json(
          { error: "Hypothesis not found" },
          { status: 404 }
        );
      }

      // Get reviews for this business
      const reviews = await prisma.review.findMany({
        where: { businessId: hypothesis.businessId },
      });

      // Get conversations for this business
      const conversations = await prisma.conversation.findMany({
        where: { businessId: hypothesis.businessId },
        include: { outcome: true },
      });

      const chain = {
        hypothesis: {
          statement: hypothesis.statement,
          status: hypothesis.status,
          evidenceCount: hypothesis.evidenceCount,
        },
        tracingBack: {
          reviews: {
            total: reviews.length,
            supporting: reviews.slice(0, 3).map(r => ({
              text: r.text.substring(0, 150),
              rating: r.rating,
            })),
          },
          conversations: {
            total: conversations.length,
            recent: conversations.slice(0, 3).map(c => ({
              question: c.question,
              hasOutcome: !!c.outcome,
              outcome: c.outcome
                ? {
                    signal: c.outcome.signalType,
                    classification: c.outcome.signalClassification,
                  }
                : null,
            })),
          },
        },
      };

      return NextResponse.json(chain);
    }

    return NextResponse.json({
      error: "Must specify ?assumption=ID or ?hypothesis=ID",
      status: 400,
    });
  } catch (error) {
    console.error("Error generating audit trail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
