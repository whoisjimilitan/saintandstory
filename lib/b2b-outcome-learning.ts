/**
 * OUTCOME LEARNING SYSTEM
 *
 * Captures post-send feedback to validate/invalidate reasoning
 * Builds Recognition Accuracy as north-star metric
 * Enables continuous improvement through evidence
 *
 * This closes the Intelligence loop.
 */

export interface OutcomeSignal {
  prospect_id: string;
  pressure_type_detected: string;
  predicted_confidence: number;
  predicted_burden: string;

  // Outcome signals (captured post-send)
  email_opened: boolean;
  email_replied: boolean;
  reply_content?: string;

  // Operator/prospect feedback
  recognition_accurate?: 'yes' | 'partially' | 'no'; // Did they feel understood?
  burden_accurate?: 'yes' | 'partially' | 'no'; // Was burden identification correct?
  pressure_type_correct?: 'yes' | 'partially' | 'no'; // Was pressure type right?
  operator_notes?: string;

  // Outcome
  conversion_to_call: boolean;
  conversion_to_customer: boolean;

  timestamp: string;
}

export interface RecognitionAccuracyMetric {
  metric_name: 'recognition_accuracy';
  total_signals: number;
  accuracy_by_pressure_type: Record<string, { correct: number; total: number; rate: number }>;
  accuracy_by_confidence_level: Record<string, { correct: number; total: number; rate: number }>;
  overall_accuracy_rate: number;
  confidence_calibration_accuracy: number; // Does 80% confidence = 80% actual accuracy?
}

export interface LearningUpdate {
  what_learned: string;
  affected_component: string; // 'recognition' | 'burden' | 'pressure_type' | 'confidence_calibration'
  confidence_adjustment: Record<string, number>; // Per pressure type
  recommendation: string;
  sample_size: number; // How many signals support this learning?
}

/**
 * Record outcome signal
 */
export function recordOutcomeSignal(signal: OutcomeSignal): void {
  // In production: persist to database
  // For now: log for aggregation
  console.log('[OUTCOME_SIGNAL]', signal);
}

/**
 * Calculate Recognition Accuracy
 */
export function calculateRecognitionAccuracy(signals: OutcomeSignal[]): RecognitionAccuracyMetric {
  const byPressureType: Record<string, { correct: number; total: number }> = {};
  const byConfidenceLevel: Record<string, { correct: number; total: number }> = {};

  let total_correct = 0;
  let total_signals = 0;

  signals.forEach((signal) => {
    if (!signal.recognition_accurate) return; // No feedback

    total_signals++;

    // Count as "correct" if operator or prospect said "yes"
    const is_correct = signal.recognition_accurate === 'yes';
    if (is_correct) total_correct++;

    // By pressure type
    if (!byPressureType[signal.pressure_type_detected]) {
      byPressureType[signal.pressure_type_detected] = { correct: 0, total: 0 };
    }
    byPressureType[signal.pressure_type_detected].total++;
    if (is_correct) byPressureType[signal.pressure_type_detected].correct++;

    // By confidence level bucket
    const confidence_bucket =
      signal.predicted_confidence >= 80
        ? '80-100%'
        : signal.predicted_confidence >= 60
          ? '60-80%'
          : signal.predicted_confidence >= 40
            ? '40-60%'
            : '<40%';

    if (!byConfidenceLevel[confidence_bucket]) {
      byConfidenceLevel[confidence_bucket] = { correct: 0, total: 0 };
    }
    byConfidenceLevel[confidence_bucket].total++;
    if (is_correct) byConfidenceLevel[confidence_bucket].correct++;
  });

  // Calculate rates
  const pressureTypeRates: Record<string, { correct: number; total: number; rate: number }> = {};
  Object.entries(byPressureType).forEach(([type, counts]) => {
    pressureTypeRates[type] = {
      ...counts,
      rate: counts.total > 0 ? counts.correct / counts.total : 0,
    };
  });

  const confidenceLevelRates: Record<string, { correct: number; total: number; rate: number }> = {};
  Object.entries(byConfidenceLevel).forEach(([level, counts]) => {
    confidenceLevelRates[level] = {
      ...counts,
      rate: counts.total > 0 ? counts.correct / counts.total : 0,
    };
  });

  // Confidence calibration accuracy
  // For each confidence level, check if actual accuracy matches predicted confidence
  let calibration_error_sum = 0;
  let calibration_samples = 0;
  Object.entries(confidenceLevelRates).forEach(([level, data]) => {
    if (data.total >= 5) {
      // Only if 5+ samples
      const predicted = parseInt(level.split('-')[0]) / 100;
      const actual = data.rate;
      calibration_error_sum += Math.abs(predicted - actual);
      calibration_samples++;
    }
  });

  const confidence_calibration_accuracy =
    calibration_samples > 0
      ? 1 - calibration_error_sum / calibration_samples
      : 0; // Perfect if no calibration data yet

  return {
    metric_name: 'recognition_accuracy',
    total_signals: total_signals,
    accuracy_by_pressure_type: pressureTypeRates,
    accuracy_by_confidence_level: confidenceLevelRates,
    overall_accuracy_rate: total_signals > 0 ? total_correct / total_signals : 0,
    confidence_calibration_accuracy,
  };
}

/**
 * Generate learning update from metrics
 */
export function generateLearningUpdates(metric: RecognitionAccuracyMetric): LearningUpdate[] {
  const updates: LearningUpdate[] = [];

  // Learning 1: Pressure type accuracy
  Object.entries(metric.accuracy_by_pressure_type).forEach(([type, data]) => {
    if (data.total >= 10) {
      // Only with sufficient sample
      const accuracy = data.rate;

      if (accuracy < 0.6) {
        updates.push({
          what_learned: `${type} recognition is only ${(accuracy * 100).toFixed(0)}% accurate - need to investigate`,
          affected_component: 'recognition',
          confidence_adjustment: { [type]: -20 }, // Reduce confidence for this type
          recommendation: `Review detection signals for ${type}. May need to refine hypothesis selection.`,
          sample_size: data.total,
        });
      }

      if (accuracy > 0.85) {
        updates.push({
          what_learned: `${type} recognition is highly accurate (${(accuracy * 100).toFixed(0)}%)`,
          affected_component: 'recognition',
          confidence_adjustment: { [type]: +10 }, // Can be more confident
          recommendation: `Continue current approach for ${type} recognition.`,
          sample_size: data.total,
        });
      }
    }
  });

  // Learning 2: Confidence calibration
  if (metric.confidence_calibration_accuracy < 0.8) {
    updates.push({
      what_learned: `Confidence calibration is off by ${((1 - metric.confidence_calibration_accuracy) * 100).toFixed(0)}%`,
      affected_component: 'confidence_calibration',
      confidence_adjustment: {},
      recommendation: 'Recalibrate confidence scoring - system is over/under-confident',
      sample_size: Object.values(metric.accuracy_by_confidence_level).reduce((sum, d) => sum + d.total, 0),
    });
  }

  return updates;
}

/**
 * NORTH-STAR METRIC: Recognition Accuracy
 * This is what matters most to Intelligence 3.0
 */
export function reportRecognitionAccuracy(signals: OutcomeSignal[]): {
  rate: number;
  confidence: string;
  trend: string;
  recommendation: string;
} {
  const metric = calculateRecognitionAccuracy(signals);
  const accuracy = metric.overall_accuracy_rate;

  let confidence = 'LOW';
  if (metric.total_signals >= 30) confidence = 'MEDIUM';
  if (metric.total_signals >= 100) confidence = 'HIGH';
  if (metric.total_signals >= 500) confidence = 'VERY HIGH';

  let trend = 'TOO EARLY TO SAY';
  // In production, compare vs prior period
  if (accuracy >= 0.8) trend = 'EXCELLENT';
  else if (accuracy >= 0.7) trend = 'GOOD';
  else if (accuracy >= 0.6) trend = 'ACCEPTABLE';
  else trend = 'POOR';

  let recommendation = '';
  if (accuracy < 0.6) {
    recommendation = 'System is not accurately understanding business reality. Halt scaling until fixed.';
  } else if (accuracy < 0.75) {
    recommendation = 'Accuracy needs improvement. Review pressure type detection and burden identification.';
  } else if (accuracy >= 0.8) {
    recommendation = 'System is accurately understanding most businesses. Safe to scale.';
  }

  return {
    rate: accuracy,
    confidence,
    trend,
    recommendation,
  };
}
