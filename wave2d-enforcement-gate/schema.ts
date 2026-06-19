/**
 * Wave 2D: Enforcement Gate Schema
 *
 * Defines validation result types for all Wave 2 layers.
 * If ANY layer fails validation → return empty safe state.
 */

export interface Wave2DResult {
  valid: boolean;
  reason: string;
  details?: Record<string, unknown>;
}

export interface Wave2AValidationInput {
  operational_signals?: Record<string, unknown>;
  source_distribution?: Record<string, number>;
  contradictions?: Array<Record<string, unknown>>;
  freshness?: Record<string, unknown>;
  evidence_gaps?: string[];
}

export interface Wave2BValidationInput {
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

export interface Wave2CValidationInput {
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

export interface SafeFallback {
  signals: Record<string, unknown>;
  intelligence_observations: unknown[];
  evidence_graph: {
    observation_links: unknown[];
    clusters: unknown[];
    raw_facts: unknown[];
  };
  validation_status: "VALIDATION_FAILED_SAFE_STATE";
}
