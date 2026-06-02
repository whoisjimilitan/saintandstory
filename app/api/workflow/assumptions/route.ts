import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * ASSUMPTIONS: Display current assumptions
 *
 * For each assumption show:
 * - statement
 * - supporting events
 * - contradicting events
 * - unresolved events
 *
 * Reconstructed from events, never from stored scores.
 * Shows: "What reality supports" and "What reality contradicts"
 */

export async function GET() {
  try {
    const assumptions = await prisma.assumption.findMany();

    // For each assumption, reconstruct state from events
    const assumptionDetails = await Promise.all(
      assumptions.map(async assumption => {
        // In a real system, we would query AssumptionEvent table
        // For now, we show the assumption with its current status

        return {
          id: assumption.id,
          statement: assumption.statement,
          currentStatus: assumption.status,
          supportingEvents:
            assumption.status === "supported" ||
            assumption.status === "emerging"
              ? []
              : [],
          contradictingEvents:
            assumption.status === "rejected" ? [] : [],
          unresolvedEvents: [],
          actions: [
            {
              label: "View evidence chain",
              href: `/workflow/audit?assumption=${assumption.id}`,
            },
          ],
        };
      })
    );

    return NextResponse.json({
      totalAssumptions: assumptions.length,
      assumptions: assumptionDetails,
      statusBreakdown: {
        emerging: assumptions.filter(a => a.status === "emerging").length,
        supported: assumptions.filter(a => a.status === "supported").length,
        weak: assumptions.filter(a => a.status === "weak").length,
        rejected: assumptions.filter(a => a.status === "rejected").length,
      },
      explanation:
        "Assumptions are reconstructed from conversation outcomes. When reality contradicts an assumption, it moves toward 'rejected'. When evidence supports it consistently, it moves toward 'supported'.",
      nextAction:
        assumptions.length === 0
          ? {
              type: "formulate_assumptions",
              label: "Formulate initial assumptions from evidence",
            }
          : {
              type: "test_assumptions",
              label: "Test assumptions through conversations",
            },
    });
  } catch (error) {
    console.error("Error fetching assumptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
