/**
 * MULTI-HYPOTHESIS ENGINE
 *
 * When evidence supports multiple explanations:
 * - Generate all plausible hypotheses
 * - Evaluate each against evidence
 * - Select strongest
 * - Retain alternatives
 * - Express uncertainty if alternatives are close
 *
 * This prevents false certainty from premature commitment.
 */

export interface Hypothesis {
  name: string;
  claim: string;
  evidence_support: string[];
  contradicted_by?: string[];
  confidence: number; // 0-100
  reasoning: string;
  pressure_type?: string;
  burden?: string;
}

export interface HypothesisEvaluation {
  primary: Hypothesis;
  alternatives: Hypothesis[];
  ranking: Hypothesis[];
  should_express_uncertainty: boolean;
  recommendation_confidence: number; // Adjusted based on gap to alternatives
}

/**
 * GENERATE HYPOTHESES FROM STAR VARIANCE
 * Example: 4.8★ vs 3.2★
 */
export function generateStarVarianceHypotheses(
  best_rating: number,
  worst_rating: number,
  variance: number,
  locations: number,
  observation_count: number
): Hypothesis[] {
  return [
    {
      name: 'Quality Management Burden',
      claim: 'Owner is personally managing quality variance across locations',
      evidence_support: [
        `${variance}★ variance suggests inconsistent standards`,
        `Multiple locations (${locations}) require centralized quality oversight`,
        `Large variance indicates manual vs systematic approach`,
      ],
      confidence: 75,
      reasoning: 'Owner managing quality personally is common in growth phase',
      pressure_type: 'service-quality-inconsistency',
      burden: 'Managing consistency personally',
    },
    {
      name: 'Hiring/Training Gap',
      claim: 'Quality gap is caused by differences in hiring or training between locations',
      evidence_support: [
        `${variance}★ variance could indicate team capability differences`,
        `New locations often have weaker teams`,
        'Training standards haven\'t scaled with growth',
      ],
      confidence: 70,
      reasoning: 'Growth without parallel team development is common',
      pressure_type: 'capacity-overflow',
      burden: 'Team capability scaling',
    },
    {
      name: 'Market Segment Mismatch',
      claim: 'Quality gap reflects different customer segments or market conditions',
      evidence_support: [
        `${variance}★ variance could reflect different location demographics`,
        'Different neighborhoods have different service expectations',
        'Customer base at new location may have different quality baseline',
      ],
      confidence: 55,
      reasoning: 'Market context can create apparent quality gaps',
      pressure_type: 'geographic-service-gaps',
      burden: 'Location-specific market adaptation',
    },
    {
      name: 'Operational Immaturity',
      claim: 'New location hasn\'t yet developed proven processes',
      evidence_support: [
        `New branch (${worst_rating}★) suggests ramp-up period`,
        'Established branch (best_rating★) suggests proven model works',
        'Gap will narrow as new location matures',
      ],
      confidence: 65,
      reasoning: 'New locations typically show lower ratings initially',
      pressure_type: 'time-critical-movement',
      burden: 'Operational maturation timeline',
    },
  ];
}

/**
 * EVALUATE HYPOTHESIS AGAINST ADDITIONAL EVIDENCE
 * Does prospect data support or contradict the hypothesis?
 */
export function evaluateHypothesisAgainstEvidence(
  hypothesis: Hypothesis,
  additional_evidence: {
    company_age: number; // Years
    growth_rate: 'fast' | 'moderate' | 'slow';
    online_presence_strength: number; // 0-100
    employee_reviews_sentiment?: string;
    recent_changes?: string[];
  }
): Hypothesis {
  let adjustment = 0;

  // Fast-growing companies often have quality management burdens
  if (hypothesis.pressure_type === 'service-quality-inconsistency' && additional_evidence.growth_rate === 'fast') {
    adjustment += 10;
  }

  // Slow-growing companies less likely to have scaling issues
  if (
    hypothesis.pressure_type === 'service-quality-inconsistency' &&
    additional_evidence.growth_rate === 'slow'
  ) {
    adjustment -= 15;
  }

  // Young companies more likely to be in ramp-up phase
  if (hypothesis.pressure_type === 'time-critical-movement' && additional_evidence.company_age < 3) {
    adjustment += 15;
  }

  // Employee sentiment about management can support/contradict quality burden
  if (additional_evidence.employee_reviews_sentiment?.includes('inconsistent')) {
    adjustment += 10;
  }

  if (additional_evidence.employee_reviews_sentiment?.includes('reliable')) {
    adjustment -= 10;
  }

  return {
    ...hypothesis,
    confidence: Math.min(95, Math.max(20, hypothesis.confidence + adjustment)),
    reasoning: `${hypothesis.reasoning}\n[Adjusted +${adjustment > 0 ? '+' : ''}${adjustment}% based on company context]`,
  };
}

/**
 * SELECT PRIMARY HYPOTHESIS
 * Rank all hypotheses, select strongest
 */
export function selectPrimaryHypothesis(hypotheses: Hypothesis[]): HypothesisEvaluation {
  // Sort by confidence
  const ranked = [...hypotheses].sort((a, b) => b.confidence - a.confidence);

  const primary = ranked[0];
  const alternatives = ranked.slice(1);

  // Calculate confidence gap between primary and runner-up
  const confidenceGap = ranked.length > 1 ? primary.confidence - ranked[1].confidence : 100;

  // If runner-up is close (< 15% gap), express uncertainty
  const shouldExpressUncertainty = confidenceGap < 15 && primary.confidence < 80;

  // Adjust recommendation confidence based on gap
  const recommendationConfidence = shouldExpressUncertainty
    ? Math.min(primary.confidence, 70) // Cap at 70% if uncertain
    : primary.confidence;

  return {
    primary,
    alternatives,
    ranking: ranked,
    should_express_uncertainty: shouldExpressUncertainty,
    recommendation_confidence: recommendationConfidence,
  };
}

/**
 * EXPLAIN HYPOTHESIS SELECTION
 * Why was this hypothesis chosen over others?
 */
export function explainHypothesisSelection(evaluation: HypothesisEvaluation): string {
  const primary = evaluation.primary;
  const runner_up = evaluation.ranking[1];

  let explanation = `
Primary Hypothesis: ${primary.name}
Confidence: ${evaluation.recommendation_confidence}%

Why this one:
${primary.evidence_support.map((e) => `  - ${e}`).join('\n')}

Competing Hypotheses:
  `;

  evaluation.alternatives.slice(0, 2).forEach((alt) => {
    explanation += `\n  - ${alt.name} (${alt.confidence}% confidence)`;
  });

  if (evaluation.should_express_uncertainty) {
    explanation += `

⚠️ UNCERTAINTY FLAG:
  Runner-up hypothesis "${runner_up.name}" is within 15% confidence gap.
  Consider presenting both to prospect for validation.
  `;
  }

  return explanation.trim();
}

/**
 * MULTI-HYPOTHESIS PRESSURE TYPE DETECTION
 * When multiple pressures are plausible, show that
 */
export function detectMultiplePressures(
  observations: string[]
): {
  dominant: string;
  confidence: number;
  alternatives: Array<{ pressure: string; confidence: number }>;
  explicit_uncertainty: boolean;
} {
  // Map observations to pressure hypotheses
  const pressureScores: Record<string, number> = {
    'service-quality-inconsistency': 0,
    'time-critical-movement': 0,
    'capacity-overflow': 0,
    'geographic-service-gaps': 0,
    'delivery-reliability': 0,
  };

  observations.forEach((obs) => {
    if (obs.toLowerCase().includes('quality') || obs.toLowerCase().includes('rating')) {
      pressureScores['service-quality-inconsistency'] += 25;
    }
    if (obs.toLowerCase().includes('deadline') || obs.toLowerCase().includes('timeline')) {
      pressureScores['time-critical-movement'] += 25;
    }
    if (obs.toLowerCase().includes('growth') || obs.toLowerCase().includes('scale')) {
      pressureScores['capacity-overflow'] += 25;
    }
    if (obs.toLowerCase().includes('location') || obs.toLowerCase().includes('geographic')) {
      pressureScores['geographic-service-gaps'] += 25;
    }
    if (obs.toLowerCase().includes('delivery') || obs.toLowerCase().includes('reliability')) {
      pressureScores['delivery-reliability'] += 25;
    }
  });

  const sorted = Object.entries(pressureScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .filter(([, score]) => score > 0);

  if (sorted.length === 0) {
    return {
      dominant: 'unknown',
      confidence: 20,
      alternatives: [],
      explicit_uncertainty: true,
    };
  }

  const [dominant_type, dominant_score] = sorted[0];
  const alternatives = sorted.slice(1).map(([pressure, score]) => ({
    pressure,
    confidence: Math.round((score / dominant_score) * 100),
  }));

  // Normalize scores to 0-100
  const normalizedDominant = Math.min(
    95,
    Math.round((dominant_score / 125) * 100)
  ); // Max 125 if all categories trigger

  // Express uncertainty if multiple pressures are close
  const topAltConfidence = alternatives[0]?.confidence || 0;
  const explicit_uncertainty = topAltConfidence > 70;

  return {
    dominant: dominant_type,
    confidence: normalizedDominant,
    alternatives: alternatives.slice(0, 2),
    explicit_uncertainty,
  };
}
