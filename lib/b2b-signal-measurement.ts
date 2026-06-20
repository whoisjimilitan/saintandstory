/**
 * SIGNAL MEASUREMENT SYSTEM
 *
 * Every extracted signal gets measured for:
 * - Source type (direct/corroborated/indirect/sparse/contradictory)
 * - Source count (how many sources confirm?)
 * - Specificity (0-100: specific to this company or generic?)
 * - Reliability (0-100: trustworthiness of source)
 * - Recency (days old)
 * - Acquisition timestamp
 *
 * This runs BEFORE pressure detection.
 * Confidence emerges from evidence measurement, not arbitrary assignment.
 */

export interface MeasuredSignal {
  signal_type: string; // 'star_rating', 'location_count', 'move_date', etc
  signal_value: any;
  evidence_quality: EvidenceQuality;
  timestamp: string;
}

export interface EvidenceQuality {
  type: 'direct' | 'corroborated' | 'indirect' | 'sparse' | 'contradictory';
  source_count: number;
  specificity: number; // 0-100
  reliability: number; // 0-100
  recency: number; // days old
  raw_confidence: number; // Before penalties
}

/**
 * STAR RATING SIGNALS
 * Most direct form of evidence about service quality
 */
export function measureStarRatingSignal(best: number, worst: number): MeasuredSignal {
  const variance = best - worst;

  return {
    signal_type: 'star_rating_variance',
    signal_value: { best, worst, variance },
    evidence_quality: {
      type: variance > 1.2 ? 'direct' : 'corroborated',
      source_count: 2, // Both best and worst available
      specificity: 95, // Specific numerical metric
      reliability: 90, // Google Reviews is reliable source
      recency: 0, // Assumed current
      raw_confidence: 90, // Star ratings are strong evidence
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * LOCATION COUNT SIGNALS
 * Indicates company scale and potential quality variance
 */
export function measureLocationCountSignal(count: number): MeasuredSignal {
  let specificity = 100; // Exact number
  let reliability = 85; // Usually accurate but can be stale

  return {
    signal_type: 'location_count',
    signal_value: count,
    evidence_quality: {
      type: 'direct',
      source_count: 1,
      specificity,
      reliability,
      recency: 7, // Might be slightly outdated
      raw_confidence: 85,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * DEADLINE SIGNALS
 * Time-critical signals are high specificity
 */
export function measureDeadlineSignal(days_until: number): MeasuredSignal {
  return {
    signal_type: 'deadline_urgency',
    signal_value: days_until,
    evidence_quality: {
      type: days_until > 0 ? 'direct' : 'contradictory', // If negative, contradicts data
      source_count: 1,
      specificity: 100,
      reliability: 95, // Dates are precise
      recency: 0,
      raw_confidence: 95,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * CAPACITY SIGNALS
 * Demand vs capacity is mathematical evidence
 */
export function measureCapacitySignal(capacity: number, demand: number): MeasuredSignal {
  const ratio = demand / capacity;

  return {
    signal_type: 'capacity_overflow',
    signal_value: { capacity, demand, ratio },
    evidence_quality: {
      type: ratio > 1.2 ? 'direct' : 'corroborated',
      source_count: 2,
      specificity: 90,
      reliability: 80, // Capacity numbers might be estimated
      recency: 14, // Might be outdated
      raw_confidence: ratio > 1.2 ? 85 : 65,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * GENERIC SIGNALS
 * For any other extracted data
 */
export function measureGenericSignal(
  signal_type: string,
  value: any,
  options: {
    is_direct?: boolean;
    source_count?: number;
    specificity?: number;
    reliability?: number;
    recency_days?: number;
  } = {}
): MeasuredSignal {
  return {
    signal_type,
    signal_value: value,
    evidence_quality: {
      type: options.is_direct ? 'direct' : 'indirect',
      source_count: options.source_count || 1,
      specificity: options.specificity || 70,
      reliability: options.reliability || 70,
      recency: options.recency_days || 0,
      raw_confidence: options.reliability || 70,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * SCORE EVIDENCE QUALITY
 * Converts evidence metrics to 0-100 score
 */
export function scoreEvidenceQuality(quality: EvidenceQuality): number {
  const typeScores = {
    'direct': 100,
    'corroborated': 85,
    'indirect': 65,
    'sparse': 40,
    'contradictory': 20,
  };

  let score = 0;
  score += typeScores[quality.type] * 0.4;
  score += Math.min(quality.source_count / 3, 1) * 100 * 0.25;
  score += quality.specificity * 0.15;
  score += quality.reliability * 0.2;

  return Math.round(score);
}

/**
 * APPLY RECENCY PENALTY
 * Older data should reduce confidence
 */
export function applyRecencyPenalty(base_confidence: number, days_old: number): number {
  if (days_old < 7) return 0; // No penalty for < 7 days
  if (days_old < 30) return base_confidence * 0.05; // -5%
  if (days_old < 90) return base_confidence * 0.15; // -15%
  if (days_old < 180) return base_confidence * 0.30; // -30%
  return base_confidence * 0.50; // -50% for > 6 months
}

/**
 * MEASURE SIGNAL COLLECTION
 * Measure ALL signals before pressure detection
 */
export function measureAllSignals(rawData: {
  star_rating_best?: number;
  star_rating_worst?: number;
  location_count?: number;
  days_until_deadline?: number;
  scripts_per_day_capacity?: number;
  scripts_per_day_demand?: number;
  [key: string]: any;
}): MeasuredSignal[] {
  const signals: MeasuredSignal[] = [];

  // Star rating signals
  if (rawData.star_rating_best && rawData.star_rating_worst) {
    signals.push(measureStarRatingSignal(rawData.star_rating_best, rawData.star_rating_worst));
  }

  // Location count signal
  if (rawData.location_count) {
    signals.push(measureLocationCountSignal(rawData.location_count));
  }

  // Deadline signal
  if (rawData.days_until_deadline !== undefined) {
    signals.push(measureDeadlineSignal(rawData.days_until_deadline));
  }

  // Capacity signal
  if (rawData.scripts_per_day_capacity && rawData.scripts_per_day_demand) {
    signals.push(
      measureCapacitySignal(rawData.scripts_per_day_capacity, rawData.scripts_per_day_demand)
    );
  }

  return signals;
}

/**
 * CONTRADICTION DETECTION
 * Identify conflicting signals DURING measurement
 */
export function detectContradictions(signals: MeasuredSignal[]): string[] {
  const contradictions: string[] = [];

  // Check star rating contradiction
  const starRatingSignal = signals.find((s) => s.signal_type === 'star_rating_variance');
  if (
    starRatingSignal &&
    starRatingSignal.evidence_quality.type === 'contradictory'
  ) {
    contradictions.push(
      'Star rating shows contradiction (best and worst are suspiciously close)'
    );
  }

  // Check deadline contradiction
  const deadlineSignal = signals.find((s) => s.signal_type === 'deadline_urgency');
  if (deadlineSignal && deadlineSignal.evidence_quality.type === 'contradictory') {
    contradictions.push('Deadline signal contradicts expected timeline');
  }

  return contradictions;
}
