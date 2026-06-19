/**
 * Wave 2D: Enforcement Gate Tests
 *
 * CRITICAL: Verify that interpretation drift is impossible
 * CRITICAL: Verify that invalid data triggers safe fallback
 */

import { describe, it, expect } from "vitest";
import { Wave2DLock } from "./lock";

describe("Wave2DLock", () => {
  const lock = new Wave2DLock();

  describe("Wave 2A Validation", () => {
    it("should reject missing input", () => {
      const result = lock.validateWave2A(null as any);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("missing_wave2a_input");
    });

    it("should reject missing required fields", () => {
      const result = lock.validateWave2A({
        operational_signals: {},
        // missing freshness, contradictions, evidence_gaps
      } as any);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("missing_wave2a_field");
    });

    it("should accept valid Wave 2A input", () => {
      const result = lock.validateWave2A({
        operational_signals: { total: 5 },
        source_distribution: { google_places: 3 },
        contradictions: [],
        freshness: { newest: "2026-06-19" },
        evidence_gaps: [],
      });
      expect(result.valid).toBe(true);
      expect(result.reason).toBe("wave2a_valid");
    });

    it("should reject non-object operational_signals", () => {
      const result = lock.validateWave2A({
        operational_signals: "invalid",
        source_distribution: {},
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
      } as any);
      expect(result.valid).toBe(false);
    });

    it("should reject non-array contradictions", () => {
      const result = lock.validateWave2A({
        operational_signals: {},
        source_distribution: {},
        contradictions: "invalid",
        freshness: {},
        evidence_gaps: [],
      } as any);
      expect(result.valid).toBe(false);
    });
  });

  describe("Wave 2B Validation", () => {
    const validObsIds = new Set(["OBS-001", "OBS-002", "OBS-003"]);

    it("should accept empty observations array", () => {
      const result = lock.validateWave2B([], validObsIds);
      expect(result.valid).toBe(true);
      expect(result.reason).toBe("wave2b_empty_valid");
    });

    it("should reject non-array input", () => {
      const result = lock.validateWave2B("invalid" as any, validObsIds);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("wave2b_not_array");
    });

    it("should reject observation with missing fields", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            // missing generated_at and reasoning
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("missing_field");
    });

    it("should reject observation with invalid ID format", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "INVALID-0001",
            category: "operations",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_id");
    });

    it("should reject invalid category", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "invalid_category",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_category");
    });

    it("should reject observation with invalid confidence", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "invalid",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_confidence");
    });

    it("should reject observation with evidence_strength out of bounds", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 1.5, // Invalid: > 1.0
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_evidence_strength");
    });

    it("should reject observation referencing non-existent observation ID", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "Test",
            supporting_observations: ["OBS-999"], // Non-existent
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_observation_reference");
    });

    it("should REJECT interpretation in title", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            title: "This business appears to be growing",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("interpretation_detected");
    });

    it("should REJECT interpretation in description", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            title: "Test",
            description: "This business likely needs better service",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("interpretation_detected");
    });

    it("should REJECT interpretation in reasoning", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            title: "Test",
            description: "Test",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "This suggests a good opportunity for outreach",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("interpretation_in_reasoning");
    });

    it("should accept valid observation", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            title: "Website lists extended hours",
            description: "Website states 24/7 availability",
            supporting_observations: ["OBS-001", "OBS-002"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.85,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Direct statement from authoritative source",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(true);
      expect(result.reason).toBe("wave2b_valid");
    });
  });

  describe("Wave 2C Validation", () => {
    const validObsIds = new Set(["OBS-001", "OBS-002"]);

    it("should reject missing input", () => {
      const result = lock.validateWave2C(null as any, validObsIds);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("wave2c_missing_input");
    });

    it("should accept valid Wave 2C output", () => {
      const result = lock.validateWave2C(
        {
          observation_links: [
            {
              type: "same_entity",
              source_ids: ["OBS-001", "OBS-002"],
              reason: "Both reference the same business address",
            },
          ],
          clusters: [
            {
              cluster_id: "CL-001",
              observation_ids: ["OBS-001", "OBS-002"],
              rule: "shared_entity_reference_only",
            },
          ],
          raw_facts: [
            {
              observation_id: "OBS-001",
              fact: "Website lists Monday-Friday 9am-5pm",
            },
          ],
        },
        validObsIds
      );
      expect(result.valid).toBe(true);
      expect(result.reason).toBe("wave2c_valid");
    });

    it("should REJECT interpretation in raw_facts", () => {
      const result = lock.validateWave2C(
        {
          observation_links: [],
          clusters: [],
          raw_facts: [
            {
              observation_id: "OBS-001",
              fact: "Website appears to have good availability",
            },
          ],
        },
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("interpretation_in_fact");
    });

    it("should reject raw_fact with invalid observation reference", () => {
      const result = lock.validateWave2C(
        {
          observation_links: [],
          clusters: [],
          raw_facts: [
            {
              observation_id: "OBS-999",
              fact: "Website lists hours",
            },
          ],
        },
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invented_fact_reference");
    });

    it("should reject invalid cluster rule", () => {
      const result = lock.validateWave2C(
        {
          observation_links: [],
          clusters: [
            {
              cluster_id: "CL-001",
              observation_ids: ["OBS-001"],
              rule: "invalid_rule",
            },
          ],
          raw_facts: [],
        },
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_cluster_rule");
    });

    it("should reject invalid link type", () => {
      const result = lock.validateWave2C(
        {
          observation_links: [
            {
              type: "invalid_type" as any,
              source_ids: ["OBS-001"],
              reason: "Test",
            },
          ],
          clusters: [],
          raw_facts: [],
        },
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("invalid_link_type");
    });

    it("should REJECT interpretation in link reason", () => {
      const result = lock.validateWave2C(
        {
          observation_links: [
            {
              type: "same_entity",
              source_ids: ["OBS-001", "OBS-002"],
              reason: "Both suggest a strong opportunity",
            },
          ],
          clusters: [],
          raw_facts: [],
        },
        validObsIds
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("interpretation_in_link_reason");
    });
  });

  describe("Safe Fallback", () => {
    it("should return empty safe state", () => {
      const fallback = lock.safeFallback();
      expect(fallback.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
      expect(fallback.signals).toEqual({});
      expect(fallback.intelligence_observations).toEqual([]);
      expect(fallback.evidence_graph.observation_links).toEqual([]);
      expect(fallback.evidence_graph.clusters).toEqual([]);
      expect(fallback.evidence_graph.raw_facts).toEqual([]);
    });
  });

  describe("Interpretation Detection (Core Safety)", () => {
    const validObsIds = new Set(["OBS-001"]);

    it("should detect 'likely' in observation", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "This business likely has a delivery service",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
    });

    it("should detect 'appears' in observation", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "This business appears to be growing",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
    });

    it("should detect 'opportunity' in observation", () => {
      const result = lock.validateWave2B(
        [
          {
            id: "IO-0001",
            category: "operations",
            description: "This is a strong market opportunity",
            supporting_observations: ["OBS-001"],
            confidence: "high",
            data_quality: "strong",
            evidence_strength: 0.8,
            generated_at: "2026-06-19T00:00:00Z",
            reasoning: "Test",
          } as any,
        ],
        validObsIds
      );
      expect(result.valid).toBe(false);
    });
  });
});
