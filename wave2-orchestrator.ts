/**
 * WAVE 2: COMPLETE ORCHESTRATION
 *
 * FOUR-LAYER ARCHITECTURE:
 * - Wave 2A: Deterministic signal extraction
 * - Wave 2B: Constrained LLM observations
 * - Wave 2C: Evidence lock (pure structure)
 * - Wave 2D: Validation + enforcement gate (circuit breaker)
 *
 * If ANY layer fails validation → return empty safe state
 */

import { Wave2DLock, type SafeFallback } from "./wave2d-enforcement-gate";
import { IntelligenceAnalyzer } from "./wave2b-insights/insight-generator";
import { Wave2CEngine } from "./wave2c-evidence-lock/engine";

// Wave 2A would be imported from its module
// import { runWave2A } from "./wave2a-filter";

export interface Wave2Result {
  candidate_id: string;
  generated_at: string;

  // Wave 2A output
  signals: Record<string, unknown>;
  source_distribution: Record<string, number>;
  contradictions: Array<Record<string, unknown>>;
  freshness: Record<string, unknown>;
  evidence_gaps: string[];

  // Wave 2B output
  intelligence_observations: Array<Record<string, unknown>>;

  // Wave 2C output
  evidence_graph: {
    observation_links: Array<Record<string, unknown>>;
    clusters: Array<Record<string, unknown>>;
    raw_facts: Array<Record<string, unknown>>;
  };

  // Wave 2D output
  validation_status: "PASSED_ALL_GATES" | "VALIDATION_FAILED_SAFE_STATE";
}

export interface Observation {
  observation_id: string;
  observation_type: string;
  evidence_text: string;
  source: string;
  confidence: string;
  source_url?: string;
  source_date?: string;
  source_author?: string;
  extracted_at: string;
}

export interface Wave2AResult {
  candidate_id: string;
  operational_signals: Record<string, unknown>;
  source_distribution: Record<string, number>;
  contradictions: Array<Record<string, unknown>>;
  freshness: Record<string, unknown>;
  evidence_gaps: string[];
}

/**
 * MAIN ORCHESTRATOR: Run all four waves with validation
 *
 * CONTRACT:
 * - Input: Wave 1 observations (immutable facts)
 * - Output: Validated intelligence report OR safe fallback
 * - Guarantee: No corrupted/interpreted data propagates
 */
export async function generateIntelligenceReport(
  observations: Observation[],
  wave2aResult: Wave2AResult
): Promise<Wave2Result> {
  const validator = new Wave2DLock();

  // WAVE 2D GATE 1: Validate Wave 2A output
  const wave2aValidation = validator.validateWave2A(wave2aResult);

  if (!wave2aValidation.valid) {
    console.warn(
      `Wave 2A validation failed: ${wave2aValidation.reason}`,
      wave2aValidation.details
    );
    return createResultFromFallback(validator.safeFallback());
  }

  // SHORT-CIRCUIT: If insufficient data, skip LLM layers
  if (observations.length < 3) {
    console.info("Insufficient observations, skipping Wave 2B and 2C");
    return {
      candidate_id: wave2aResult.candidate_id,
      generated_at: new Date().toISOString(),
      signals: wave2aResult.operational_signals,
      source_distribution: wave2aResult.source_distribution,
      contradictions: wave2aResult.contradictions,
      freshness: wave2aResult.freshness,
      evidence_gaps: wave2aResult.evidence_gaps,
      intelligence_observations: [],
      evidence_graph: {
        observation_links: [],
        clusters: [],
        raw_facts: [],
      },
      validation_status: "PASSED_ALL_GATES",
    };
  }

  // WAVE 2B: Generate constrained observations
  const analyzer = new IntelligenceAnalyzer();
  let wave2b: Array<Record<string, unknown>> = [];

  try {
    wave2b = await analyzer.generateIntelligenceObservations(
      wave2aResult,
      observations
    );
  } catch (error) {
    console.error("Wave 2B generation failed:", error);
    return createResultFromFallback(validator.safeFallback());
  }

  // WAVE 2D GATE 2: Validate Wave 2B output
  const validObsIds = new Set(observations.map((o) => o.observation_id));
  const wave2bValidation = validator.validateWave2B(
    wave2b as any,
    validObsIds
  );

  if (!wave2bValidation.valid) {
    console.warn(
      `Wave 2B validation failed: ${wave2bValidation.reason}`,
      wave2bValidation.details
    );
    return createResultFromFallback(validator.safeFallback());
  }

  // WAVE 2C: Generate evidence lock
  const engine = new Wave2CEngine();
  let wave2c: Record<string, unknown>;

  try {
    wave2c = await engine.run({
      signals: wave2aResult.operational_signals,
      observations,
      contradictions: wave2aResult.contradictions,
      freshness: wave2aResult.freshness,
    });
  } catch (error) {
    console.error("Wave 2C generation failed:", error);
    return createResultFromFallback(validator.safeFallback());
  }

  // WAVE 2D GATE 3: Validate Wave 2C output
  const wave2cValidation = validator.validateWave2C(wave2c as any, validObsIds);

  if (!wave2cValidation.valid) {
    console.warn(
      `Wave 2C validation failed: ${wave2cValidation.reason}`,
      wave2cValidation.details
    );
    return createResultFromFallback(validator.safeFallback());
  }

  // ALL GATES PASSED: Return complete report
  console.info("All Wave 2 gates passed, returning validated report");

  return {
    candidate_id: wave2aResult.candidate_id,
    generated_at: new Date().toISOString(),

    // Wave 2A: Raw signals
    signals: wave2aResult.operational_signals,
    source_distribution: wave2aResult.source_distribution,
    contradictions: wave2aResult.contradictions,
    freshness: wave2aResult.freshness,
    evidence_gaps: wave2aResult.evidence_gaps,

    // Wave 2B: Constrained observations
    intelligence_observations: wave2b,

    // Wave 2C: Evidence graph
    evidence_graph: {
      observation_links: (wave2c.observation_links as any[]) || [],
      clusters: (wave2c.clusters as any[]) || [],
      raw_facts: (wave2c.raw_facts as any[]) || [],
    },

    // Wave 2D: Validation status
    validation_status: "PASSED_ALL_GATES",
  };
}

/**
 * Convert safe fallback into Wave 2 result format
 */
function createResultFromFallback(fallback: SafeFallback): Wave2Result {
  return {
    candidate_id: "UNKNOWN",
    generated_at: new Date().toISOString(),
    signals: fallback.signals,
    source_distribution: {},
    contradictions: [],
    freshness: {},
    evidence_gaps: [],
    intelligence_observations: fallback.intelligence_observations,
    evidence_graph: fallback.evidence_graph as any,
    validation_status: "VALIDATION_FAILED_SAFE_STATE",
  };
}

/**
 * Utility: Extract candidate_id from observations
 */
export function extractCandidateId(observations: Observation[]): string {
  if (observations.length > 0) {
    // All observations for same candidate should have same candidate_id
    // This is a heuristic; in real code, would be passed explicitly
    return observations[0].observation_id.split("-")[0];
  }
  return "UNKNOWN";
}

/**
 * SIMPLIFIED FOUR-LAYER ORCHESTRATOR
 *
 * Direct linear execution with validation gates.
 * If ANY layer fails → return empty safe state immediately.
 *
 * This is the canonical Wave 2 execution pattern.
 */
export async function runWave2(
  observations: Observation[]
): Promise<SafeFallback | Record<string, unknown>> {
  const lock = new Wave2DLock();
  const validObsIds = new Set(observations.map((o) => o.observation_id));

  // WAVE 2A: Deterministic signal extraction
  const wave2a = await runWave2A(observations);

  // WAVE 2D GATE 1: Validate Wave 2A
  const aCheck = lock.validateWave2A(wave2a);
  if (!aCheck.valid) {
    console.warn(`Wave 2A failed validation: ${aCheck.reason}`);
    return lock.safeFallback();
  }

  // WAVE 2B: Constrained observations
  const wave2b = await runWave2B(wave2a, observations);

  // WAVE 2D GATE 2: Validate Wave 2B
  const bCheck = lock.validateWave2B(wave2b, validObsIds);
  if (!bCheck.valid) {
    console.warn(`Wave 2B failed validation: ${bCheck.reason}`);
    return lock.safeFallback();
  }

  // WAVE 2C: Evidence lock
  const wave2c = await runWave2C(wave2a, observations);

  // WAVE 2D GATE 3: Validate Wave 2C
  const cCheck = lock.validateWave2C(wave2c, validObsIds);
  if (!cCheck.valid) {
    console.warn(`Wave 2C failed validation: ${cCheck.reason}`);
    return lock.safeFallback();
  }

  // ALL GATES PASSED: Return locked intelligence
  return {
    candidate_id: wave2a.candidate_id,
    generated_at: new Date().toISOString(),
    signals: wave2a.operational_signals,
    source_distribution: wave2a.source_distribution,
    contradictions: wave2a.contradictions,
    freshness: wave2a.freshness,
    evidence_gaps: wave2a.evidence_gaps,
    intelligence_observations: wave2b,
    evidence_graph: wave2c,
    status: "VALID_LOCKED_INTELLIGENCE",
  };
}

/**
 * Placeholder implementations (would be imported from actual modules)
 */

async function runWave2A(observations: Observation[]): Promise<Wave2AResult> {
  // TODO: Implement Wave 2A deterministic extraction
  // For now, return minimal valid structure
  return {
    candidate_id: extractCandidateId(observations),
    operational_signals: {
      total_observations: observations.length,
    },
    source_distribution: {},
    contradictions: [],
    freshness: {
      most_recent_observation_date: new Date().toISOString(),
    },
    evidence_gaps: [],
  };
}

async function runWave2B(
  wave2a: Wave2AResult,
  observations: Observation[]
): Promise<Array<Record<string, unknown>>> {
  // TODO: Implement Wave 2B LLM constrained observations
  // For now, return empty array
  return [];
}

async function runWave2C(
  wave2a: Wave2AResult,
  observations: Observation[]
): Promise<Record<string, unknown>> {
  // TODO: Implement Wave 2C evidence lock
  // For now, return empty structure
  return {
    observation_links: [],
    clusters: [],
    raw_facts: [],
  };
}
