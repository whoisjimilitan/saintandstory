/**
 * Wave 2D: Enforcement Gate
 *
 * CIRCUIT BREAKER PATTERN
 * - Validates all Wave 2 layers
 * - If ANY layer fails → return empty safe state
 * - Prevents corrupted/interpreted data from propagating
 *
 * CRITICAL RULE:
 * If uncertain → return EMPTY SAFE STATE (not partial data)
 */

import {
  Wave2DResult,
  Wave2AValidationInput,
  Wave2BValidationInput,
  Wave2CValidationInput,
  SafeFallback,
} from "./schema";

export class Wave2DLock {
  private forbiddenInterpretationWords = [
    // Inference verbs
    "likely",
    "appears",
    "suggests",
    "indicates",
    "seems",
    "might",
    "probably",

    // Judgment adjectives
    "good",
    "bad",
    "strong",
    "weak",
    "quality",
    "performance",

    // Trajectory terms
    "growing",
    "failing",
    "trend",
    "trajectory",

    // Recommendation/action verbs
    "should",
    "need",
    "opportunity",
    "prospect",
    "recommend",
    "improve",
    "better",
    "worse",

    // Analysis terms (forbidden in factual output)
    "insight",
    "analysis",
    "pattern",
    "finding",
  ];

  /**
   * Validate Wave 2A: Deterministic signal extraction
   * MUST have all required components
   */
  validateWave2A(input: Wave2AValidationInput): Wave2DResult {
    if (!input) {
      return {
        valid: false,
        reason: "missing_wave2a_input",
      };
    }

    const required = [
      "operational_signals",
      "source_distribution",
      "freshness",
      "contradictions",
      "evidence_gaps",
    ];

    for (const field of required) {
      if (!(field in input)) {
        return {
          valid: false,
          reason: `missing_wave2a_field_${field}`,
        };
      }
    }

    // Signals must be object
    if (typeof input.operational_signals !== "object") {
      return { valid: false, reason: "wave2a_signals_not_object" };
    }

    // Contradictions must be array
    if (!Array.isArray(input.contradictions)) {
      return { valid: false, reason: "wave2a_contradictions_not_array" };
    }

    // Freshness must be object
    if (typeof input.freshness !== "object") {
      return { valid: false, reason: "wave2a_freshness_not_object" };
    }

    // Evidence gaps must be array
    if (!Array.isArray(input.evidence_gaps)) {
      return { valid: false, reason: "wave2a_gaps_not_array" };
    }

    return {
      valid: true,
      reason: "wave2a_valid",
    };
  }

  /**
   * Validate Wave 2B: Constrained observations
   * MUST be evidence-grounded, must cite real observations, no interpretation
   */
  validateWave2B(
    observations: Wave2BValidationInput[],
    validObsIds: Set<string>
  ): Wave2DResult {
    if (!Array.isArray(observations)) {
      return {
        valid: false,
        reason: "wave2b_not_array",
      };
    }

    // Empty observations array is valid
    if (observations.length === 0) {
      return {
        valid: true,
        reason: "wave2b_empty_valid",
      };
    }

    for (let i = 0; i < observations.length; i++) {
      const obs = observations[i];

      // Required fields
      const requiredFields = [
        "id",
        "category",
        "description",
        "supporting_observations",
        "confidence",
        "data_quality",
        "evidence_strength",
        "generated_at",
        "reasoning",
      ];

      for (const field of requiredFields) {
        if (!(field in obs)) {
          return {
            valid: false,
            reason: `wave2b_missing_field_${field}_at_index_${i}`,
          };
        }
      }

      // ID must exist and start with IO-
      if (typeof obs.id !== "string" || !obs.id.startsWith("IO-")) {
        return {
          valid: false,
          reason: `wave2b_invalid_id_at_index_${i}`,
        };
      }

      // Category must be valid
      const validCategories = [
        "operations",
        "customer_experience",
        "digital_presence",
        "market_activity",
        "reputation",
        "service_delivery",
        "staffing",
        "growth",
        "consistency",
        "other",
      ];
      if (!validCategories.includes(obs.category)) {
        return {
          valid: false,
          reason: `wave2b_invalid_category_${obs.category}_at_index_${i}`,
        };
      }

      // Description and title must be strings
      if (
        typeof obs.description !== "string" ||
        (obs.title && typeof obs.title !== "string")
      ) {
        return {
          valid: false,
          reason: `wave2b_invalid_text_fields_at_index_${i}`,
        };
      }

      // Supporting observations must be array of strings
      if (!Array.isArray(obs.supporting_observations)) {
        return {
          valid: false,
          reason: `wave2b_supporting_obs_not_array_at_index_${i}`,
        };
      }

      // All supporting observation IDs must exist
      for (const id of obs.supporting_observations) {
        if (!validObsIds.has(id)) {
          return {
            valid: false,
            reason: `wave2b_invalid_observation_reference_${id}_at_index_${i}`,
          };
        }
      }

      // Confidence must be valid
      if (!["high", "medium", "low"].includes(obs.confidence)) {
        return {
          valid: false,
          reason: `wave2b_invalid_confidence_${obs.confidence}_at_index_${i}`,
        };
      }

      // Data quality must be valid
      if (!["strong", "moderate", "weak"].includes(obs.data_quality)) {
        return {
          valid: false,
          reason: `wave2b_invalid_data_quality_${obs.data_quality}_at_index_${i}`,
        };
      }

      // Evidence strength must be 0.0-1.0
      if (
        typeof obs.evidence_strength !== "number" ||
        obs.evidence_strength < 0 ||
        obs.evidence_strength > 1
      ) {
        return {
          valid: false,
          reason: `wave2b_invalid_evidence_strength_${obs.evidence_strength}_at_index_${i}`,
        };
      }

      // generated_at must be ISO8601
      if (typeof obs.generated_at !== "string" || isNaN(Date.parse(obs.generated_at))) {
        return {
          valid: false,
          reason: `wave2b_invalid_timestamp_at_index_${i}`,
        };
      }

      // CRITICAL: Check for interpretation in title and description
      const textToCheck =
        `${obs.title || ""} ${obs.description || ""}`.toLowerCase();
      if (this.containsInterpretation(textToCheck)) {
        return {
          valid: false,
          reason: `wave2b_interpretation_detected_at_index_${i}`,
          details: { text: textToCheck },
        };
      }

      // CRITICAL: Check for interpretation in reasoning
      if (this.containsInterpretation((obs.reasoning || "").toLowerCase())) {
        return {
          valid: false,
          reason: `wave2b_interpretation_in_reasoning_at_index_${i}`,
        };
      }
    }

    return {
      valid: true,
      reason: "wave2b_valid",
    };
  }

  /**
   * Validate Wave 2C: Evidence lock (pure structure)
   * MUST be structural only, no interpretation, all references valid
   */
  validateWave2C(
    parsed: Wave2CValidationInput,
    validObsIds: Set<string>
  ): Wave2DResult {
    if (!parsed) {
      return {
        valid: false,
        reason: "wave2c_missing_input",
      };
    }

    // Raw facts must be pure and valid
    for (let i = 0; i < (parsed.raw_facts || []).length; i++) {
      const fact = parsed.raw_facts[i];

      if (!fact.observation_id || typeof fact.fact !== "string") {
        return {
          valid: false,
          reason: `wave2c_invalid_raw_fact_at_index_${i}`,
        };
      }

      // Fact must reference valid observation
      if (!validObsIds.has(fact.observation_id)) {
        return {
          valid: false,
          reason: `wave2c_invented_fact_reference_${fact.observation_id}_at_index_${i}`,
        };
      }

      // Fact must not contain interpretation
      if (this.containsInterpretation(fact.fact.toLowerCase())) {
        return {
          valid: false,
          reason: `wave2c_interpretation_in_fact_at_index_${i}`,
        };
      }
    }

    // Clusters must be structural only
    for (let i = 0; i < (parsed.clusters || []).length; i++) {
      const cluster = parsed.clusters[i];

      if (!Array.isArray(cluster.observation_ids)) {
        return {
          valid: false,
          reason: `wave2c_invalid_cluster_at_index_${i}`,
        };
      }

      // All cluster members must exist
      for (const id of cluster.observation_ids) {
        if (!validObsIds.has(id)) {
          return {
            valid: false,
            reason: `wave2c_invalid_cluster_reference_${id}_at_index_${i}`,
          };
        }
      }

      // Cluster rule must be exact match
      if (cluster.rule !== "shared_entity_reference_only") {
        return {
          valid: false,
          reason: `wave2c_invalid_cluster_rule_${cluster.rule}_at_index_${i}`,
        };
      }
    }

    // Links must be structural only
    for (let i = 0; i < (parsed.observation_links || []).length; i++) {
      const link = parsed.observation_links[i];

      if (!Array.isArray(link.source_ids)) {
        return {
          valid: false,
          reason: `wave2c_invalid_link_at_index_${i}`,
        };
      }

      // All link references must exist
      for (const id of link.source_ids) {
        if (!validObsIds.has(id)) {
          return {
            valid: false,
            reason: `wave2c_invalid_link_reference_${id}_at_index_${i}`,
          };
        }
      }

      // Link type must be in allowed set
      const allowedTypes = [
        "same_entity",
        "temporal_order",
        "explicit_contradiction",
      ];
      if (!allowedTypes.includes(link.type)) {
        return {
          valid: false,
          reason: `wave2c_invalid_link_type_${link.type}_at_index_${i}`,
        };
      }

      // Reason must not contain interpretation
      if (this.containsInterpretation((link.reason || "").toLowerCase())) {
        return {
          valid: false,
          reason: `wave2c_interpretation_in_link_reason_at_index_${i}`,
        };
      }
    }

    return {
      valid: true,
      reason: "wave2c_valid",
    };
  }

  /**
   * Check if text contains forbidden interpretation words
   * CRITICAL: This is the drift detector
   */
  private containsInterpretation(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.forbiddenInterpretationWords.some((word) => {
      // Word boundary check: ensure we match whole words only
      const regex = new RegExp(`\\b${word}\\b`);
      return regex.test(lowerText);
    });
  }

  /**
   * SAFE FALLBACK: Return empty state
   * Used when ANY layer fails validation
   * GUARANTEES: No corrupted/interpreted data propagates
   */
  safeFallback(): SafeFallback {
    return {
      signals: {},
      intelligence_observations: [],
      evidence_graph: {
        observation_links: [],
        clusters: [],
        raw_facts: [],
      },
      validation_status: "VALIDATION_FAILED_SAFE_STATE",
    };
  }
}
