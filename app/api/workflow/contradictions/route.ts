import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CONTRADICTIONS: Most important screen
 *
 * Shows assumptions challenged by reality.
 *
 * This screen exists specifically to surface learning.
 * It is where the system demonstrates honesty about what it got wrong.
 */

export async function GET() {
  try {
    const assumptions = await prisma.assumption.findMany({
      where: {
        // Only show assumptions that have been tested and found contradicting
        status: "weak",
      },
      orderBy: { updatedAt: "desc" },
    });

    const contradictions = assumptions.map(assumption => ({
      id: assumption.id,
      assumption: {
        statement: assumption.statement,
        previousStatus: "emerging", // Would be historical
        currentStatus: "weak",
      },
      contradiction: {
        description: "Reality provided evidence contradicting this assumption",
        evidence: [], // Would be populated from outcomes
        learnedInstead: "See conversation outcomes to understand contradiction",
      },
      impactOnHypotheses: {
        affectedCount: 0, // Would be calculated from hypotheses linked to this assumption
        description: "Hypotheses based on this assumption may need revision",
      },
      actions: [
        {
          label: "View supporting outcomes",
          href: `/workflow/outcomes?assumption=${assumption.id}`,
        },
        {
          label: "Update assumption",
          type: "edit",
        },
      ],
    }));

    return NextResponse.json({
      totalContradictions: contradictions.length,
      contradictions: contradictions,
      significance:
        "Contradictions are learning opportunities. They show where our assumptions diverged from reality. Each contradiction should trigger hypothesis revision.",
      nextAction:
        contradictions.length === 0
          ? {
              type: "run_conversations",
              label: "Conduct more conversations to find contradictions",
            }
          : {
              type: "revise_hypotheses",
              label: "Revise hypotheses based on contradictions",
            },
    });
  } catch (error) {
    console.error("Error fetching contradictions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
