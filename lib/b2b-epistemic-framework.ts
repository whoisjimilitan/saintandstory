/**
 * EPISTEMIC FRAMEWORK
 *
 * Tracks evidence type at every reasoning step
 * Distinguishes: Observation | Inference | Hypothesis | Assumption | Speculation
 *
 * This is the foundation for evidence-aware reasoning.
 * Internal only - never exposed to prospects.
 */

export type EpistemicLevel = 'observation' | 'inference' | 'hypothesis' | 'assumption' | 'speculation';

export interface EpistemicClaim {
  claim: string;
  level: EpistemicLevel;
  evidence: string[];
  confidence: number; // 0-100
  alternatives: string[];
  reasoning: string;
  warnings?: string[];
}

export interface EpistemicChain {
  stage: string;
  claims: EpistemicClaim[];
  final_conclusion: EpistemicClaim;
}

/**
 * OBSERVATION: Direct, verifiable data
 * Example: "Google reviews show 4.8★ for Leeds branch, 3.2★ for Alwoodley"
 */
export function createObservation(
  claim: string,
  evidence: string[],
  confidence: number = 95
): EpistemicClaim {
  return {
    claim,
    level: 'observation',
    evidence,
    confidence,
    alternatives: [],
    reasoning: 'Direct evidence from authoritative source',
  };
}

/**
 * INFERENCE: Logical conclusion from observations
 * Example: "Star rating variance indicates quality difference between branches"
 */
export function createInference(
  claim: string,
  evidence: string[],
  reasoning: string,
  confidence: number,
  alternatives: string[] = []
): EpistemicClaim {
  return {
    claim,
    level: 'inference',
    evidence,
    confidence,
    alternatives,
    reasoning,
  };
}

/**
 * HYPOTHESIS: Plausible explanation, not yet validated
 * Example: "Owner is personally managing quality variance"
 *
 * This is where RRAT recognition typically lives.
 * Must be flagged as hypothesis, not fact.
 */
export function createHypothesis(
  claim: string,
  evidence: string[],
  reasoning: string,
  confidence: number,
  alternatives: string[]
): EpistemicClaim {
  return {
    claim,
    level: 'hypothesis',
    evidence,
    confidence,
    alternatives,
    reasoning,
    warnings: [
      'This is an educated guess based on available data',
      'Competing hypotheses exist',
      'Validation from prospect would increase confidence',
    ],
  };
}

/**
 * ASSUMPTION: Taken as true without strong evidence
 * Example: "Owner prioritizes fixing quality variance"
 *
 * Should only be used when necessary.
 * Should be acknowledged as such.
 */
export function createAssumption(
  claim: string,
  reasoning: string,
  why_necessary: string,
  confidence: number
): EpistemicClaim {
  return {
    claim,
    level: 'assumption',
    evidence: [],
    confidence,
    alternatives: [],
    reasoning,
    warnings: [
      `Assumption (not evidence): ${why_necessary}`,
      'This may not reflect reality',
    ],
  };
}

/**
 * SPECULATION: Not enough basis for serious weight
 * Should be minimized.
 */
export function createSpeculation(
  claim: string,
  reasoning: string
): EpistemicClaim {
  return {
    claim,
    level: 'speculation',
    evidence: [],
    confidence: 20,
    alternatives: [],
    reasoning,
    warnings: ['This is speculation - insufficient evidence'],
  };
}

/**
 * VALIDATE EPISTEMIC CHAIN
 * Ensure reasoning doesn't jump epistemically levels too far
 */
export function validateEpistemicChain(chain: EpistemicChain): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const levelHierarchy = {
    'observation': 1,
    'inference': 2,
    'hypothesis': 3,
    'assumption': 4,
    'speculation': 5,
  };

  // Check for unexplained jumps
  for (let i = 0; i < chain.claims.length - 1; i++) {
    const current = chain.claims[i];
    const next = chain.claims[i + 1];

    const currentLevel = levelHierarchy[current.level];
    const nextLevel = levelHierarchy[next.level];

    // Can jump one level down (from observation to inference)
    // Cannot jump two levels (observation -> assumption)
    if (nextLevel - currentLevel > 1) {
      issues.push(
        `Unexplained jump from ${current.level} to ${next.level} at step ${i + 1}`
      );
    }

    // Cannot go backwards (inference -> observation)
    if (nextLevel < currentLevel && currentLevel > 1) {
      issues.push(
        `Invalid backward step from ${current.level} to ${next.level} at step ${i + 1}`
      );
    }
  }

  // Check final conclusion
  if (chain.final_conclusion.level === 'speculation') {
    issues.push('Final conclusion should not be speculation');
  }

  if (chain.final_conclusion.level === 'assumption' && chain.final_conclusion.confidence > 80) {
    issues.push(
      `Final conclusion is assumption with high confidence (${chain.final_conclusion.confidence}) - reduce confidence`
    );
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * CONFIDENCE INTERPRETATION
 * Map confidence to language appropriateness
 */
export function getConfidenceLanguage(confidence: number): {
  strength: string;
  qualifier: string;
  should_present_alternatives: boolean;
} {
  if (confidence >= 90) {
    return {
      strength: 'Strong',
      qualifier: '', // "Your... is..." (no qualifier needed)
      should_present_alternatives: false,
    };
  }

  if (confidence >= 75) {
    return {
      strength: 'Moderate-Strong',
      qualifier: '', // Can still be direct
      should_present_alternatives: false,
    };
  }

  if (confidence >= 60) {
    return {
      strength: 'Moderate',
      qualifier: 'appears to', // "Your situation appears to..."
      should_present_alternatives: true,
    };
  }

  if (confidence >= 45) {
    return {
      strength: 'Weak-Moderate',
      qualifier: 'may be', // "You may be..."
      should_present_alternatives: true,
    };
  }

  return {
    strength: 'Weak',
    qualifier: 'could be', // "You could be..."
    should_present_alternatives: true,
  };
}

/**
 * SUMMARY: Epistemic health of reasoning
 */
export function summarizeEpistemicHealth(chain: EpistemicChain): string {
  const observation_count = chain.claims.filter((c) => c.level === 'observation').length;
  const inference_count = chain.claims.filter((c) => c.level === 'inference').length;
  const hypothesis_count = chain.claims.filter((c) => c.level === 'hypothesis').length;
  const assumption_count = chain.claims.filter((c) => c.level === 'assumption').length;

  const total = observation_count + inference_count + hypothesis_count + assumption_count;
  const rigor_score = (observation_count * 1 + inference_count * 0.8 + hypothesis_count * 0.6 + assumption_count * 0.3) / total;

  return `
Epistemic Composition:
  Observations: ${observation_count}/${total} (${((observation_count / total) * 100).toFixed(0)}%)
  Inferences: ${inference_count}/${total}
  Hypotheses: ${hypothesis_count}/${total}
  Assumptions: ${assumption_count}/${total}

Reasoning Rigor Score: ${(rigor_score * 100).toFixed(0)}/100
Final Confidence: ${chain.final_conclusion.confidence}%

Status: ${chain.final_conclusion.confidence >= 75 && assumption_count <= 1 ? '✅ Sound reasoning' : assumption_count > 2 ? '⚠️ Assumption-heavy reasoning' : '✅ Evidence-based'}
  `.trim();
}
