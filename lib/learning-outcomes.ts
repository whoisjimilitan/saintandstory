import { neon } from "@neondatabase/serverless";

/**
 * Learning Outcomes System
 *
 * Records what happens to prospects after outreach:
 * - Did they reply?
 * - Did they convert (standing order)?
 * - How long did it take?
 * - What were their original characteristics?
 *
 * This data feeds back into scoring to improve predictions.
 */

export async function recordOutcome(
  sql: any,
  qualifiedBusinessId: string,
  leadId: string,
  outcomeType: "converted" | "replied" | "engaged" | "ignored" | "disqualified",
  businessCategory: string,
  opportunityScoreAtTime: number,
  daysToOutcome: number,
  engagementSignals?: Record<string, any>
) {
  try {
    const outcomeValue =
      outcomeType === "converted"
        ? 1
        : outcomeType === "replied" || outcomeType === "engaged"
          ? 1
          : outcomeType === "ignored"
            ? 0
            : -1;

    await sql`
      INSERT INTO b2b_learning_outcomes (
        qualified_business_id,
        lead_id,
        outcome_type,
        outcome_value,
        business_category,
        opportunity_score_at_outcome,
        days_to_outcome,
        engagement_signals
      ) VALUES (
        ${qualifiedBusinessId},
        ${leadId},
        ${outcomeType},
        ${outcomeValue},
        ${businessCategory},
        ${opportunityScoreAtTime},
        ${daysToOutcome},
        ${JSON.stringify(engagementSignals || {})}
      )
    `;

    console.log(
      `[LEARNING] Recorded ${outcomeType} outcome for lead ${leadId}`
    );
    return true;
  } catch (error) {
    console.error("[LEARNING] Failed to record outcome:", error);
    return false;
  }
}

/**
 * Get learning insights for a category
 * Shows what scores actually converted in the past
 */
export async function getCategoryLearnings(
  sql: any,
  category: string
): Promise<{
  totalOutcomes: number;
  conversionRate: number;
  averageScoreForConversion: number;
  averageDaysToConversion: number;
  scoreRanges: Array<{
    range: string;
    conversionRate: number;
    count: number;
  }>;
}> {
  try {
    const outcomes = await sql`
      SELECT
        outcome_type,
        outcome_value,
        opportunity_score_at_outcome,
        days_to_outcome,
        COUNT(*) as count
      FROM b2b_learning_outcomes
      WHERE business_category = ${category}
      GROUP BY outcome_type, outcome_value, opportunity_score_at_outcome, days_to_outcome
      ORDER BY opportunity_score_at_outcome DESC
    `;

    const totalOutcomes = outcomes.reduce(
      (sum: number, row: any) => sum + row.count,
      0
    );
    const conversions = outcomes.filter((o: any) => o.outcome_type === "converted");
    const conversionCount = conversions.reduce((sum: number, row: any) => sum + row.count, 0);
    const conversionRate = totalOutcomes > 0 ? conversionCount / totalOutcomes : 0;

    const avgScoreForConversion =
      conversions.length > 0
        ? conversions.reduce(
            (sum: number, row: any) =>
              sum + (row.opportunity_score_at_outcome || 0) * row.count,
            0
          ) / conversionCount
        : 0;

    const avgDaysToConversion =
      conversions.length > 0
        ? conversions.reduce(
            (sum: number, row: any) =>
              sum + (row.days_to_outcome || 0) * row.count,
            0
          ) / conversionCount
        : 0;

    // Score range analysis
    const scoreRanges = [
      { min: 80, max: 100, label: "80-100" },
      { min: 60, max: 79, label: "60-79" },
      { min: 40, max: 59, label: "40-59" },
      { min: 0, max: 39, label: "0-39" },
    ];

    const rangeStats = scoreRanges.map((range) => {
      const rangeOutcomes = outcomes.filter(
        (o: any) =>
          o.opportunity_score_at_outcome >= range.min &&
          o.opportunity_score_at_outcome <= range.max
      );
      const rangeTotal = rangeOutcomes.reduce(
        (sum: number, row: any) => sum + row.count,
        0
      );
      const rangeConversions = rangeOutcomes
        .filter((o: any) => o.outcome_type === "converted")
        .reduce((sum: number, row: any) => sum + row.count, 0);

      return {
        range: range.label,
        conversionRate: rangeTotal > 0 ? rangeConversions / rangeTotal : 0,
        count: rangeTotal,
      };
    });

    return {
      totalOutcomes,
      conversionRate,
      averageScoreForConversion: Math.round(avgScoreForConversion * 100) / 100,
      averageDaysToConversion: Math.round(avgDaysToConversion),
      scoreRanges: rangeStats.filter((r) => r.count > 0),
    };
  } catch (error) {
    console.error("[LEARNING] Failed to get category learnings:", error);
    return {
      totalOutcomes: 0,
      conversionRate: 0,
      averageScoreForConversion: 0,
      averageDaysToConversion: 0,
      scoreRanges: [],
    };
  }
}
