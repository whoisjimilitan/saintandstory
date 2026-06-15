import { neon } from "@neondatabase/serverless";
import {
  getInsightsForOutcomeCase,
  getLearningInsightsForBrief,
  findMatchingPattern
} from "@/lib/pattern-insights";

/**
 * Pattern Insights API
 *
 * Provides actionable guidance from patterns to operator interfaces.
 * All patterns are from Outcome Cases with Logistics Fit Score >= 60
 *
 * GET /api/b2b/pattern-insights?source=conversation&leadId=X
 * GET /api/b2b/pattern-insights?source=brief
 * GET /api/b2b/pattern-insights?source=outcome&blocked_outcome=X
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "conversation";

    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // CONVERSATION INTELLIGENCE
    // Show relevant insights when viewing a prospect
    if (source === "conversation") {
      const leadId = searchParams.get("leadId");
      if (!leadId) {
        return Response.json(
          { error: "leadId required for conversation source" },
          { status: 400 }
        );
      }

      // Get lead's outcome case
      const lead = (await sql`
        SELECT
          blocked_outcome,
          operational_cause,
          logistics_friction
        FROM b2b_leads
        WHERE id = ${leadId}
        LIMIT 1
      `) as Array<any>;

      if (lead.length === 0) {
        return Response.json(
          { insights: [], source: "conversation" }
        );
      }

      const insights = await getInsightsForOutcomeCase(
        sql,
        lead[0].blocked_outcome,
        lead[0].operational_cause,
        lead[0].logistics_friction
      );

      return Response.json({
        insights,
        source: "conversation",
        max_display: 3
      });
    }

    // MORNING BRIEF
    // Show top learning insights from patterns
    if (source === "brief") {
      const insights = await getLearningInsightsForBrief(sql);

      return Response.json({
        insights,
        source: "brief",
        section: "WHAT WE ARE LEARNING",
        max_display: 3
      });
    }

    // OUTCOME CASE
    // Attach insight when outcome matches a verified pattern
    if (source === "outcome") {
      const blockedOutcome = searchParams.get("blocked_outcome");
      const operationalCause = searchParams.get("operational_cause") || undefined;
      const logisticsFriction = searchParams.get("logistics_friction") || undefined;

      if (!blockedOutcome) {
        return Response.json(
          { error: "blocked_outcome required for outcome source" },
          { status: 400 }
        );
      }

      const insight = await findMatchingPattern(
        sql,
        blockedOutcome,
        operationalCause,
        logisticsFriction
      );

      return Response.json({
        insight: insight || null,
        source: "outcome",
        has_insight: insight !== null
      });
    }

    return Response.json(
      { error: "Unknown source. Use: conversation, brief, or outcome" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Pattern Insights API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
