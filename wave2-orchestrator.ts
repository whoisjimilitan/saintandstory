/**
 * WAVE 2: COMPLETE ORCHESTRATION
 *
 * ⚠️  CRITICAL ARCHITECTURAL CONSTRAINT
 *
 * EXACTLY ONE EXECUTION PATH: runWave2()
 *
 * Wave 2D is the MANDATORY exit gate for ALL results.
 * It is IMPOSSIBLE to invoke Wave 2A, 2B, or 2C without 2D validation.
 *
 * FOUR-LAYER ARCHITECTURE (LINEAR, NO BYPASSES):
 * - Wave 2A: Deterministic signal extraction
 * - Wave 2D GATE 1: Validate Wave 2A completeness
 * - Wave 2B: Constrained LLM observations
 * - Wave 2D GATE 2: Validate Wave 2B constraints
 * - Wave 2C: Evidence lock (pure structure)
 * - Wave 2D GATE 3: Validate Wave 2C purity
 * - OUTPUT: Locked intelligence OR empty safe state
 *
 * If ANY gate fails → entire output returns empty safe state (no partial data)
 *
 * CALLER MUST USE: await runWave2(observations)
 * NO OTHER ENTRY POINT EXISTS.
 * NO LAYER CAN BE CALLED INDEPENDENTLY.
 */

import { Wave2DLock } from "./wave2d-enforcement-gate/lock";
import type { SafeFallback, Wave2DResult } from "./wave2d-enforcement-gate/schema";
import { IntelligenceAnalyzer } from "./wave2b-insights/insight-generator";
import { Wave2CEngine } from "./wave2c-evidence-lock/engine";

// ============================================================================
// PUBLIC EXPORTS: ONLY TYPES AND ONE FUNCTION
// ============================================================================

/**
 * The ONLY valid result type from Wave 2
 * Guaranteed to have passed all four gates OR be empty safe state
 */
export interface Wave2LockedResult {
  candidate_id: string;
  generated_at: string;

  // Wave 2A: Deterministic extraction (guaranteed by Gate 1)
  signals: Record<string, unknown>;
  source_distribution: Record<string, number>;
  contradictions: Array<Record<string, unknown>>;
  freshness: Record<string, unknown>;
  evidence_gaps: string[];

  // Wave 2B: Constrained observations (guaranteed by Gate 2)
  intelligence_observations: Wave2BObservation[];

  // Wave 2C: Evidence graph (guaranteed by Gate 3)
  evidence_graph: Wave2CResult;

  // Wave 2D: Validation status (GATE RESULT)
  status: "VALID_LOCKED_INTELLIGENCE" | "VALIDATION_FAILED_SAFE_STATE";

  // Failure reason (if status is VALIDATION_FAILED_SAFE_STATE)
  failure_reason?: string;
}

/**
 * Input type: Raw observations from Wave 1
 */
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

// ============================================================================
// PRIVATE TYPES (INTERNAL ONLY - DO NOT EXPORT)
// ============================================================================

interface Wave2AResult {
  candidate_id: string;
  operational_signals: Record<string, unknown>;
  source_distribution: Record<string, number>;
  contradictions: Array<Record<string, unknown>>;
  freshness: Record<string, unknown>;
  evidence_gaps: string[];
}

interface Wave2BObservation {
  id: string;
  category: string;
  title: string;
  description: string;
  supporting_observations: string[];
  confidence: "high" | "medium" | "low";
  data_quality: "strong" | "moderate" | "weak";
  evidence_strength: number;
  generated_at: string;
  reasoning: string;
}

interface Wave2CResult {
  observation_links: Array<{
    type: "same_entity" | "temporal_order" | "explicit_contradiction";
    source_ids: string[];
    reason: string;
  }>;
  clusters: Array<{
    cluster_id: string;
    observation_ids: string[];
    rule: string;
  }>;
  raw_facts: Array<{
    observation_id: string;
    fact: string;
  }>;
}

// ============================================================================
// THE ONLY PUBLIC ENTRY POINT
// ============================================================================

/**
 * CANONICAL WAVE 2 EXECUTION PATTERN
 *
 * ⚠️  THIS IS THE ONLY WAY TO RUN WAVE 2
 *
 * CONTRACT:
 * - Input: Observations from Wave 1 (immutable facts)
 * - Output: Locked intelligence report OR empty safe state
 * - Guarantee: ALL results have passed Wave 2D validation gates
 *
 * EXECUTION PATH (MANDATORY, LINEAR, NO BYPASSES):
 *   Wave 2A (extract)
 *     ↓ [Wave 2D Gate 1 validates]
 *     ↓ MUST PASS or return empty
 *   Wave 2B (observations)
 *     ↓ [Wave 2D Gate 2 validates]
 *     ↓ MUST PASS or return empty
 *   Wave 2C (evidence lock)
 *     ↓ [Wave 2D Gate 3 validates]
 *     ↓ MUST PASS or return empty
 *   OUTPUT (locked intelligence OR empty safe state)
 *
 * IMPOSSIBILITIES:
 * ✗ Cannot call Wave 2A independently (not exported)
 * ✗ Cannot call Wave 2B independently (not exported)
 * ✗ Cannot call Wave 2C independently (not exported)
 * ✗ Cannot bypass Wave 2D (gates are inline, not optional)
 * ✗ Cannot get partial/corrupted data (circuit breaker enforced)
 */
export async function runWave2(
  observations: Observation[]
): Promise<Wave2LockedResult> {
  // Create Wave 2D validator (ONLY instantiated here)
  const validator = new Wave2DLock();
  const validObsIds = new Set(observations.map((o) => o.observation_id));

  // ========================================================================
  // WAVE 2A: DETERMINISTIC SIGNAL EXTRACTION
  // ========================================================================
  const wave2a = await executeWave2A(observations);

  // ======== WAVE 2D GATE 1: VALIDATE WAVE 2A ========
  let gateA: Wave2DResult;
  try {
    gateA = validator.validateWave2A(wave2a);
  } catch (error) {
    console.error(`[WAVE 2D GATE 1 EXCEPTION] Validator threw exception:`, error);
    return createEmptySafeState("Wave 2D Gate 1 threw exception");
  }
  if (!gateA.valid) {
    console.warn(`[WAVE 2D GATE 1 FAILURE] Wave 2A validation failed: ${gateA.reason}`);
    return createEmptySafeState("Wave 2A failed Gate 1");
  }

  // ========================================================================
  // WAVE 2B: CONSTRAINED INTELLIGENCE OBSERVATIONS
  // ========================================================================
  const wave2b = await executeWave2B(wave2a, observations);

  // ======== WAVE 2D GATE 2: VALIDATE WAVE 2B ========
  let gateB: Wave2DResult;
  try {
    gateB = validator.validateWave2B(wave2b, validObsIds);
  } catch (error) {
    console.error(`[WAVE 2D GATE 2 EXCEPTION] Validator threw exception:`, error);
    return createEmptySafeState("Wave 2D Gate 2 threw exception");
  }
  if (!gateB.valid) {
    console.warn(`[WAVE 2D GATE 2 FAILURE] Wave 2B validation failed: ${gateB.reason}`);
    return createEmptySafeState("Wave 2B failed Gate 2");
  }

  // ========================================================================
  // WAVE 2C: EVIDENCE LOCK (PURE STRUCTURE)
  // ========================================================================
  const wave2c = await executeWave2C(wave2a, observations);

  // ======== WAVE 2D GATE 3: VALIDATE WAVE 2C ========
  let gateC: Wave2DResult;
  try {
    gateC = validator.validateWave2C(wave2c, validObsIds);
  } catch (error) {
    console.error(`[WAVE 2D GATE 3 EXCEPTION] Validator threw exception:`, error);
    return createEmptySafeState("Wave 2D Gate 3 threw exception");
  }
  if (!gateC.valid) {
    console.warn(`[WAVE 2D GATE 3 FAILURE] Wave 2C validation failed: ${gateC.reason}`);
    return createEmptySafeState("Wave 2C failed Gate 3");
  }

  // ========================================================================
  // ALL GATES PASSED: RETURN LOCKED INTELLIGENCE
  // ========================================================================
  console.info("[WAVE 2D SUCCESS] All three gates passed. Returning locked intelligence.");

  return {
    candidate_id: wave2a.candidate_id,
    generated_at: new Date().toISOString(),

    // From Wave 2A (validated by Gate 1)
    signals: wave2a.operational_signals,
    source_distribution: wave2a.source_distribution,
    contradictions: wave2a.contradictions,
    freshness: wave2a.freshness,
    evidence_gaps: wave2a.evidence_gaps,

    // From Wave 2B (validated by Gate 2)
    intelligence_observations: wave2b,

    // From Wave 2C (validated by Gate 3)
    evidence_graph: wave2c,

    // Wave 2D result
    status: "VALID_LOCKED_INTELLIGENCE",
  };
}

// ============================================================================
// PRIVATE IMPLEMENTATIONS (NOT EXPORTED - CANNOT BE CALLED DIRECTLY)
// ============================================================================

/**
 * Wave 2A: Deterministic signal extraction
 * PRIVATE: Only callable from runWave2() via executeWave2A()
 */
async function executeWave2A(observations: Observation[]): Promise<Wave2AResult> {
  const sourceDistribution: Record<string, number> = {};
  const contradictions: Array<Record<string, unknown>> = [];
  const evidenceGaps: string[] = [];
  let mostRecentDate = new Date(0).toISOString();

  // Extract deterministic signals from observations
  for (const obs of observations) {
    // Count sources
    sourceDistribution[obs.source] = (sourceDistribution[obs.source] || 0) + 1;

    // Track most recent date
    if (obs.extracted_at > mostRecentDate) {
      mostRecentDate = obs.extracted_at;
    }

    // Detect contradictions (simple: same observation_type with conflicting evidence)
    const existingObs = observations.find(
      (o) =>
        o.observation_type === obs.observation_type &&
        o.observation_id !== obs.observation_id &&
        o.evidence_text.toLowerCase() !== obs.evidence_text.toLowerCase()
    );
    if (existingObs) {
      contradictions.push({
        type: obs.observation_type,
        first_observation: obs.observation_id,
        second_observation: existingObs.observation_id,
        conflict_reason: "different_evidence_for_same_type",
      });
    }
  }

  // Identify evidence gaps (observation types not covered)
  const commonTypes = [
    "BUSINESS_NAME",
    "ADDRESS",
    "PHONE",
    "EMAIL",
    "WEBSITE",
    "HOURS",
  ];
  const coveredTypes = new Set(observations.map((o) => o.observation_type));
  for (const type of commonTypes) {
    if (!coveredTypes.has(type) && observations.length > 0) {
      evidenceGaps.push(type);
    }
  }

  return {
    candidate_id: extractCandidateIdInternal(observations),
    operational_signals: {
      total_observations: observations.length,
      observation_types: Array.from(
        new Set(observations.map((o) => o.observation_type))
      ),
      source_count: Object.keys(sourceDistribution).length,
      has_contradictions: contradictions.length > 0,
      evidence_gap_count: evidenceGaps.length,
    },
    source_distribution: sourceDistribution,
    contradictions,
    freshness: {
      most_recent_observation_date: mostRecentDate,
      total_unique_dates: new Set(observations.map((o) => o.extracted_at)).size,
    },
    evidence_gaps: evidenceGaps,
  };
}

/**
 * Wave 2B: Constrained intelligence observations
 * PRIVATE: Only callable from runWave2() via executeWave2B()
 */
async function executeWave2B(
  wave2a: Wave2AResult,
  observations: Observation[]
): Promise<Wave2BObservation[]> {
  const analyzer = new IntelligenceAnalyzer();
  try {
    const result = await analyzer.generateIntelligenceObservations(wave2a, observations);
    return result as unknown as Wave2BObservation[];
  } catch (error) {
    console.error("[WAVE 2B ERROR]", error);
    return [];
  }
}

/**
 * Wave 2C: Evidence lock (pure structure)
 * PRIVATE: Only callable from runWave2() via executeWave2C()
 */
async function executeWave2C(
  wave2a: Wave2AResult,
  observations: Observation[]
): Promise<Wave2CResult> {
  const engine = new Wave2CEngine();
  try {
    const result = await engine.run({
      signals: wave2a.operational_signals,
      observations,
      contradictions: wave2a.contradictions,
      freshness: wave2a.freshness,
    });
    return result as unknown as Wave2CResult;
  } catch (error) {
    console.error("[WAVE 2C ERROR]", error);
    return {
      observation_links: [],
      clusters: [],
      raw_facts: [],
    } as Wave2CResult;
  }
}

/**
 * Create empty safe state (returned when any gate fails)
 * PRIVATE: Only used internally by runWave2()
 */
function createEmptySafeState(reason: string): Wave2LockedResult {
  return {
    candidate_id: "UNKNOWN",
    generated_at: new Date().toISOString(),
    signals: {},
    source_distribution: {},
    contradictions: [],
    freshness: {},
    evidence_gaps: [],
    intelligence_observations: [],
    evidence_graph: {
      observation_links: [],
      clusters: [],
      raw_facts: [],
    } as Wave2CResult,
    status: "VALIDATION_FAILED_SAFE_STATE",
    failure_reason: reason,
  };
}

/**
 * Extract candidate_id from observations
 * PRIVATE: Only used internally
 */
function extractCandidateIdInternal(observations: Observation[]): string {
  if (observations.length > 0) {
    return observations[0].observation_id.split("-")[0];
  }
  return "UNKNOWN";
}
