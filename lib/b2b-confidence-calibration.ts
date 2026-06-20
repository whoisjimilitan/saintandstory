/**
 * CONFIDENCE CALIBRATION
 *
 * Maps evidence quality and quantity to calibrated confidence scores
 * Ensures internal confidence matches actual accuracy
 *
 * This replaces arbitrary confidence with evidence-based calibration.
 */

export interface EvidenceQuality {
  type: 'direct' | 'corroborated' | 'indirect' | 'sparse' | 'contradictory';
  source_count: number; // How many independent sources confirm?
  recency: number; // Days old (0 = today, 365 = 1 year old)
  specificity: number; // 0-100: how specific vs generic?
  reliability: number; // 0-100: source reliability
}

export interface ConfidenceCalibration {
  base_confidence: number;
  evidence_quality_score: number;
  recency_penalty: number;
  contradiction_penalty: number;
  final_calibrated_confidence: number;
  calibration_reasoning: string;
}

/**
 * EVIDENCE QUALITY SCORE
 * 0-100 based on evidence characteristics
 */
export function scoreEvidenceQuality(evidence: EvidenceQuality): number {
  let score = 0;

  // Type scoring
  const typeScores = {
    'direct': 100,
    'corroborated': 85,
    'indirect': 65,
    'sparse': 40,
    'contradictory': 20,
  };
  score += typeScores[evidence.type] * 0.4;

  // Source count scoring
  // 1 source: 40%, 2 sources: 70%, 3+ sources: 100%
  const sourceScore = Math.min(evidence.source_count / 3, 1) * 100;
  score += sourceScore * 0.25;

  // Specificity scoring
  score += evidence.specificity * 0.15;

  // Reliability scoring
  score += evidence.reliability * 0.2;

  return Math.round(score);
}

/**
 * RECENCY PENALTY
 * How old is the evidence?
 */
export function applyRecencyPenalty(base_confidence: number, days_old: number): number {
  // No penalty for < 7 days
  if (days_old < 7) return 0;

  // Small penalty for < 30 days
  if (days_old < 30) return base_confidence * 0.05; // -5%

  // Medium penalty for 30-90 days
  if (days_old < 90) return base_confidence * 0.15; // -15%

  // Large penalty for 90-180 days
  if (days_old < 180) return base_confidence * 0.30; // -30%

  // Critical penalty for > 180 days
  return base_confidence * 0.50; // -50%
}

/**
 * CONTRADICTION PENALTY
 * When evidence conflicts, confidence reduces
 */
export function applyContradictionPenalty(
  base_confidence: number,
  contradiction_count: number
): number {
  if (contradiction_count === 0) return 0;
  if (contradiction_count === 1) return base_confidence * 0.20; // -20%
  if (contradiction_count === 2) return base_confidence * 0.40; // -40%
  return base_confidence * 0.60; // -60%
}

/**
 * CALIBRATE CONFIDENCE
 * Final calibrated confidence based on all factors
 */
export function calibrateConfidence(
  base_confidence: number,
  evidence_quality: EvidenceQuality,
  days_old: number,
  contradictions: number
): ConfidenceCalibration {
  const evidence_quality_score = scoreEvidenceQuality(evidence_quality);
  const recency_penalty = applyRecencyPenalty(base_confidence, days_old);
  const contradiction_penalty = applyContradictionPenalty(base_confidence, contradictions);

  const final_confidence = Math.max(
    20, // Minimum confidence even with poor evidence
    base_confidence - recency_penalty - contradiction_penalty
  );

  return {
    base_confidence,
    evidence_quality_score,
    recency_penalty,
    contradiction_penalty,
    final_calibrated_confidence: Math.round(final_confidence),
    calibration_reasoning: `
Base: ${base_confidence}%
Evidence Quality: ${evidence_quality_score}/100
Recency Penalty: -${recency_penalty}%
Contradiction Penalty: -${contradiction_penalty}%
Final: ${Math.round(final_confidence)}%

Evidence Type: ${evidence_quality.type}
Sources: ${evidence_quality.source_count}
Data Age: ${days_old} days
Specificity: ${evidence_quality.specificity}/100
    `.trim(),
  };
}

/**
 * CONFIDENCE THRESHOLDS
 * When should system express vs suppress confidence?
 */
export function getConfidenceThreshold(purpose: string): number {
  const thresholds: Record<string, number> = {
    'send_email_direct': 75, // "You are experiencing..." requires 75%+
    'send_email_exploratory': 55, // "You may be experiencing..." requires 55%+
    'recognize_burden': 70, // Must be fairly confident about burden
    'select_pressure_type': 65, // Pressure selection needs solid evidence
    'recommend_action': 80, // Recommendations need high confidence
    'claim_expertise': 85, // Expert claims need very high confidence
  };

  return thresholds[purpose] || 70;
}

/**
 * SHOULD PRESENT ALTERNATIVES?
 * When confidence is moderate, present competing hypotheses
 */
export function shouldPresentAlternatives(confidence: number): boolean {
  // If confidence < 75%, present alternatives
  return confidence < 75;
}

/**
 * GRACEFUL DEGRADATION
 * How does language naturally degrade with confidence?
 */
export function getLanguageByConfidence(confidence: number, statement: string): string {
  const base = statement;

  if (confidence >= 85) {
    return base; // "You are..."
  }

  if (confidence >= 70) {
    return base.replace('You are', 'You appear to be').replace('is', 'appears to be');
  }

  if (confidence >= 55) {
    return base
      .replace('You are', 'You may be')
      .replace('is', 'may be')
      .replace('Your', 'Your likely');
  }

  if (confidence >= 40) {
    return base
      .replace('You are', 'You could be')
      .replace('is', 'could be')
      .replace('Your', 'Your possible');
  }

  return base
    .replace('You are', 'We wonder if you might be')
    .replace('is', 'might be')
    .replace('Your', 'Your potential');
}

/**
 * EXAMPLE: Applying Calibration to Recognition
 */
export function calibrateRecognition(rawRecognition: {
  claim: string;
  evidence: {
    type: 'direct' | 'corroborated' | 'indirect' | 'sparse' | 'contradictory';
    source_count: number;
    specificity: number;
    reliability: number;
    days_old: number;
    contradictions: number;
  };
}): {
  recognition: string;
  calibrated_confidence: number;
  should_present_alternatives: boolean;
  reasoning: string;
} {
  const calibration = calibrateConfidence(
    80, // Base confidence for recognition claims
    {
      type: rawRecognition.evidence.type,
      source_count: rawRecognition.evidence.source_count,
      recency: rawRecognition.evidence.days_old,
      specificity: rawRecognition.evidence.specificity,
      reliability: rawRecognition.evidence.reliability,
    },
    rawRecognition.evidence.days_old,
    rawRecognition.evidence.contradictions
  );

  return {
    recognition: getLanguageByConfidence(
      calibration.final_calibrated_confidence,
      rawRecognition.claim
    ),
    calibrated_confidence: calibration.final_calibrated_confidence,
    should_present_alternatives: shouldPresentAlternatives(calibration.final_calibrated_confidence),
    reasoning: calibration.calibration_reasoning,
  };
}
