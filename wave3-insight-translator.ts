/**
 * WAVE 3: INSIGHT TRANSLATION LAYER
 *
 * Converts Wave2LockedResult into user-actionable insights.
 *
 * CRITICAL CONSTRAINT: Wave 3 is a black box transformation only.
 * No Wave 2 re-evaluation.
 * No new validation.
 * No architectural coupling.
 */

import type { Wave2LockedResult } from "./wave2-orchestrator";
import { randomUUID } from "crypto";

export interface Wave3Insight {
  insight_id: string;
  status: "INSIGHTED" | "INSUFFICIENT_SIGNAL";
  summary: string;
  implications: string[];
  recommended_actions: string[];
  confidence: "high" | "medium" | "low";
  source_summary: {
    total_signals: number;
    key_sources: string[];
    contradiction_flag: boolean;
  };
  meta: {
    generated_at: string;
    wave_version: "3.0";
  };
}

/**
 * Translate Wave 2 locked intelligence into user-facing insights and actions.
 * Single pass, no re-validation, no Wave 2 coupling.
 */
export function runWave3(input: Wave2LockedResult): Wave3Insight {
  // FAILURE STATE: Insufficient signal
  if (input.status === "VALIDATION_FAILED_SAFE_STATE") {
    return {
      insight_id: randomUUID(),
      status: "INSUFFICIENT_SIGNAL",
      summary: "No validated intelligence available",
      implications: ["Signal extraction failed or insufficient data"],
      recommended_actions: ["Collect additional observations", "Re-run Wave 2 ingestion"],
      confidence: "low",
      source_summary: {
        total_signals: 0,
        key_sources: [],
        contradiction_flag: false,
      },
      meta: {
        generated_at: new Date().toISOString(),
        wave_version: "3.0",
      },
    };
  }

  // SUCCESS STATE: Valid locked intelligence
  if (input.status === "VALID_LOCKED_INTELLIGENCE") {
    // Extract source distribution
    const sourceEntries = Object.entries(input.source_distribution || {})
      .sort(([, a], [, b]) => (typeof b === "number" && typeof a === "number" ? b - a : 0))
      .slice(0, 3);
    const topSources = sourceEntries.map(([source]) => source);

    // Count total signals
    const totalSignals =
      (input.intelligence_observations?.length || 0) +
      (input.contradictions?.length || 0) +
      (input.evidence_gaps?.length || 0);

    // Determine contradiction flag
    const hasContradictions = (input.contradictions?.length || 0) > 0;

    // Generate primary insight from operational signals
    const signals = input.signals as Record<string, unknown>;
    const observationCount = (typeof signals?.total_observations === "number" ? signals.total_observations : 0) || 0;
    const gapCount = input.evidence_gaps?.length || 0;

    // Insight generation logic
    let primaryInsight = "";
    let confidenceLevel: "high" | "medium" | "low" = "medium";

    if (observationCount >= 5 && gapCount <= 2 && !hasContradictions) {
      primaryInsight = "Strong and consistent business intelligence with complete core data.";
      confidenceLevel = "high";
    } else if (observationCount >= 3 && gapCount <= 4) {
      primaryInsight = "Moderate business intelligence with some data gaps.";
      confidenceLevel = "medium";
    } else if (observationCount >= 1) {
      primaryInsight = "Limited business intelligence; additional data collection recommended.";
      confidenceLevel = "low";
    } else {
      primaryInsight = "Insufficient intelligence for decision-making.";
      confidenceLevel = "low";
    }

    // Generate implications
    const implications: string[] = [];

    if (hasContradictions) {
      implications.push("Conflicting information detected; verify with primary sources.");
    }

    if (gapCount > 0) {
      implications.push(
        `Missing ${gapCount} key data fields; completeness affects reliability.`
      );
    }

    if (topSources.length > 0) {
      implications.push(`Information sourced from ${topSources.join(", ")}.`);
    }

    // Generate recommended actions
    const recommendedActions: string[] = [];

    if (gapCount > 0) {
      recommendedActions.push("Collect missing business data fields");
    }

    if (hasContradictions) {
      recommendedActions.push("Reconcile conflicting information with business owner");
    }

    recommendedActions.push("Review and validate intelligence summary");

    return {
      insight_id: randomUUID(),
      status: "INSIGHTED",
      summary: primaryInsight,
      implications: implications.slice(0, 3),
      recommended_actions: recommendedActions.slice(0, 3),
      confidence: confidenceLevel,
      source_summary: {
        total_signals: totalSignals,
        key_sources: topSources,
        contradiction_flag: hasContradictions,
      },
      meta: {
        generated_at: new Date().toISOString(),
        wave_version: "3.0",
      },
    };
  }

  // Fallback (should never reach here, but defensive)
  return {
    insight_id: randomUUID(),
    status: "INSUFFICIENT_SIGNAL",
    summary: "Unexpected result state",
    implications: ["Result status could not be interpreted"],
    recommended_actions: ["Re-run processing"],
    confidence: "low",
    source_summary: {
      total_signals: 0,
      key_sources: [],
      contradiction_flag: false,
    },
    meta: {
      generated_at: new Date().toISOString(),
      wave_version: "3.0",
    },
  };
}
