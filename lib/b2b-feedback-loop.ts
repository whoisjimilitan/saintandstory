/**
 * FEEDBACK LOOP
 *
 * Uses historical outcomes to adjust future confidence
 *
 * Pipeline:
 * 1. Calculate recognition accuracy by pressure type
 * 2. Identify weak-performing pressure types
 * 3. Adjust future confidence thresholds
 * 4. Modify language calibration
 * 5. Update detection logic
 *
 * This closes the loop: past outcomes change future behavior
 */

import {
  calculateRecognitionAccuracy,
  getPoorPerformingTypes,
  queryOutcomesByPressureType,
} from './b2b-outcome-persistence';

export interface FeedbackAdjustment {
  pressure_type: string;
  current_accuracy: number;
  recommended_confidence_cap: number;
  rationale: string;
  sample_size: number;
}

export interface FeedbackReport {
  timestamp: string;
  total_outcomes: number;
  overall_accuracy: number;
  adjustments: FeedbackAdjustment[];
  recommendations: string[];
}

/**
 * Calculate what confidence cap should be for each pressure type
 * based on historical accuracy
 */
export function calculateConfidenceCaps(): Record<string, number> {
  const accuracy = calculateRecognitionAccuracy();
  const caps: Record<string, number> = {};

  Object.entries(accuracy.by_pressure_type).forEach(([type, data]) => {
    if (data.total < 5) {
      caps[type] = 0.85; // Default cap with limited data
    } else {
      // Cap confidence at 1.2x the historical accuracy
      // (allow some room for improvement but not too much)
      caps[type] = Math.min(0.95, data.rate * 1.2);
    }
  });

  return caps;
}

/**
 * Generate feedback adjustments for poor performers
 */
export function generateFeedbackAdjustments(): FeedbackAdjustment[] {
  const poor = getPoorPerformingTypes();
  return poor.map((p) => ({
    pressure_type: p.pressure_type,
    current_accuracy: p.accuracy,
    recommended_confidence_cap: Math.max(0.4, p.accuracy * 1.1), // Slight buffer
    rationale: `Recognition accuracy is ${(p.accuracy * 100).toFixed(0)}% - require higher evidence quality before sending`,
    sample_size: p.sample_size,
  }));
}

/**
 * Adjust incoming confidence based on historical performance
 * This is called during pressure detection
 */
export function applyFeedbackAdjustment(
  pressure_type: string,
  incoming_confidence: number
): number {
  const caps = calculateConfidenceCaps();
  const cap = caps[pressure_type] || 0.85;

  if (incoming_confidence > cap) {
    console.log(
      `[FEEDBACK] Capping confidence for ${pressure_type}: ${(incoming_confidence * 100).toFixed(0)}% → ${(cap * 100).toFixed(0)}%`
    );
    return cap;
  }

  return incoming_confidence;
}

/**
 * Generate complete feedback report
 */
export function generateFeedbackReport(): FeedbackReport {
  const accuracy = calculateRecognitionAccuracy();
  const adjustments = generateFeedbackAdjustments();

  const recommendations: string[] = [];

  if (accuracy.overall_rate < 0.65) {
    recommendations.push(
      '⚠️ Overall recognition accuracy < 65%. Review pressure type selection logic.'
    );
  }

  if (accuracy.overall_rate > 0.85) {
    recommendations.push(
      '✅ Overall recognition accuracy > 85%. System is performing well.'
    );
  }

  adjustments.forEach((adj) => {
    recommendations.push(
      `🔴 ${adj.pressure_type}: accuracy ${(adj.current_accuracy * 100).toFixed(0)}% - increase evidence requirement`
    );
  });

  const totalOutcomes = Object.values(accuracy.by_pressure_type).reduce(
    (sum, d) => sum + d.total,
    0
  );

  return {
    timestamp: new Date().toISOString(),
    total_outcomes: totalOutcomes,
    overall_accuracy: accuracy.overall_rate,
    adjustments,
    recommendations,
  };
}

/**
 * CRITICAL: Called during pressure detection
 * Applies historical performance to incoming confidence
 */
export function applyHistoricalFeedback(
  detected_pressure_type: string,
  detected_confidence: number
): { adjusted_confidence: number; feedback_applied: boolean } {
  const adjusted = applyFeedbackAdjustment(detected_pressure_type, detected_confidence);
  const feedback_applied = adjusted < detected_confidence;

  if (feedback_applied) {
    console.log(
      `[FEEDBACK_APPLIED] ${detected_pressure_type}: ${(detected_confidence * 100).toFixed(0)}% → ${(adjusted * 100).toFixed(0)}%`
    );
  }

  return {
    adjusted_confidence: adjusted,
    feedback_applied,
  };
}
