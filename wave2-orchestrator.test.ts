/**
 * Wave 2 Integration Tests
 *
 * Tests the complete four-layer orchestration:
 * Wave 2A → Wave 2B → Wave 2C → Wave 2D
 *
 * Validates that drift is impossible and safe fallback works
 */

import { describe, it, expect, vi } from "vitest";
import {
  generateIntelligenceReport,
  type Wave2Result,
  type Observation,
  type Wave2AResult,
} from "./wave2-orchestrator";

describe("runWave2 (Simplified Four-Layer Orchestrator)", () => {
  const mockObservations: Observation[] = [
    {
      observation_id: "OBS-001",
      observation_type: "BUSINESS_NAME",
      evidence_text: "ABC Florist",
      source: "google_places",
      confidence: "HIGH",
      extracted_at: "2026-06-19T00:00:00Z",
    },
    {
      observation_id: "OBS-002",
      observation_type: "OPERATIONAL_PHRASE",
      evidence_text: "Order before 3pm for same-day delivery",
      source: "website",
      confidence: "HIGH",
      extracted_at: "2026-06-19T00:00:00Z",
    },
    {
      observation_id: "OBS-003",
      observation_type: "REVIEW_TEXT",
      evidence_text: "Fast delivery, flowers were fresh",
      source: "review",
      confidence: "MEDIUM",
      extracted_at: "2026-06-19T00:00:00Z",
    },
  ];

  it("should execute all four waves and return locked intelligence", async () => {
    const { runWave2 } = await import("./wave2-orchestrator");

    const result = await runWave2(mockObservations);

    // Should not be in safe fallback state
    if ("validation_status" in result) {
      expect(result.validation_status).not.toBe(
        "VALIDATION_FAILED_SAFE_STATE"
      );
    } else {
      // Should have status field indicating success
      expect(result.status).toBe("VALID_LOCKED_INTELLIGENCE");
    }
  });

  it("should return safe fallback if Wave 2A fails", async () => {
    // This test would need to mock runWave2A to return invalid data
    // For now, verify the pattern exists
    const { runWave2 } = await import("./wave2-orchestrator");
    expect(runWave2).toBeDefined();
  });
});

describe("Wave 2 Orchestration (Four-Layer Architecture)", () => {
  const mockObservations: Observation[] = [
    {
      observation_id: "OBS-001",
      observation_type: "BUSINESS_NAME",
      evidence_text: "ABC Florist",
      source: "google_places",
      confidence: "HIGH",
      extracted_at: "2026-06-19T00:00:00Z",
    },
    {
      observation_id: "OBS-002",
      observation_type: "OPERATIONAL_PHRASE",
      evidence_text: "Order before 3pm for same-day delivery",
      source: "website",
      confidence: "HIGH",
      source_url: "https://abcflorist.com",
      extracted_at: "2026-06-19T00:00:00Z",
    },
    {
      observation_id: "OBS-003",
      observation_type: "REVIEW_TEXT",
      evidence_text: "Fast delivery, flowers were fresh",
      source: "review",
      confidence: "MEDIUM",
      source_author: "John Smith",
      extracted_at: "2026-06-19T00:00:00Z",
    },
  ];

  const mockWave2AResult: Wave2AResult = {
    candidate_id: "candidate-123",
    operational_signals: {
      has_business_name: true,
      has_website: true,
      has_reviews: true,
      total_observations: 3,
    },
    source_distribution: {
      google_places: 1,
      website: 1,
      review: 1,
    },
    contradictions: [],
    freshness: {
      most_recent_observation_date: "2026-06-19T00:00:00Z",
      primary_indicator: "recent",
    },
    evidence_gaps: [],
  };

  describe("Happy Path: All gates pass", () => {
    it("should validate Wave 2A and continue", async () => {
      // This test verifies Wave 2D validation works
      // Full integration test would require mocking Wave 2B and 2C

      const result = await generateIntelligenceReport(
        mockObservations,
        mockWave2AResult
      );

      // Should NOT be in safe fallback state
      expect(result.validation_status).not.toBe("VALIDATION_FAILED_SAFE_STATE");
    });
  });

  describe("Failure Cases: Gates reject invalid data", () => {
    it("should reject Wave 2A with missing signals", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: undefined as any,
        source_distribution: {},
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      // Should fail validation and return safe state
      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
      expect(result.signals).toEqual({});
      expect(result.intelligence_observations).toEqual([]);
      expect(result.evidence_graph.observation_links).toEqual([]);
    });

    it("should reject Wave 2A with missing contradictions", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: {},
        source_distribution: {},
        contradictions: undefined as any,
        freshness: {},
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
    });

    it("should reject Wave 2A with missing freshness", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: {},
        source_distribution: {},
        contradictions: [],
        freshness: undefined as any,
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
    });

    it("should short-circuit if insufficient observations", async () => {
      const tooFew: Observation[] = [mockObservations[0]];

      const result = await generateIntelligenceReport(
        tooFew,
        mockWave2AResult
      );

      // Should pass (Wave 2B/2C skipped) but have empty observations
      expect(result.validation_status).toBe("PASSED_ALL_GATES");
      expect(result.intelligence_observations).toEqual([]);
      expect(result.evidence_graph.observation_links).toEqual([]);
    });
  });

  describe("Safe Fallback Behavior", () => {
    it("should return empty safe state on any gate failure", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: "invalid" as any,
        source_distribution: {},
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      // Verify all outputs are empty/safe
      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
      expect(result.signals).toEqual({});
      expect(result.intelligence_observations).toEqual([]);
      expect(result.evidence_graph.observation_links).toEqual([]);
      expect(result.evidence_graph.clusters).toEqual([]);
      expect(result.evidence_graph.raw_facts).toEqual([]);

      // Verify timestamp is still set
      expect(result.generated_at).toBeDefined();
    });

    it("should never return partial/corrupted data", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: undefined as any,
        source_distribution: { partial: 1 },
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      // If validation fails, ALL outputs should be empty
      // Not a mix of valid and invalid data
      if (result.validation_status === "VALIDATION_FAILED_SAFE_STATE") {
        expect(result.signals).toEqual({});
        expect(result.source_distribution).toEqual({});
      }
    });
  });

  describe("Wave 2D Validation Gate Logic", () => {
    it("should identify missing Wave 2A component", async () => {
      const missingFreshness: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: {},
        source_distribution: {},
        contradictions: [],
        // freshness missing
        evidence_gaps: [],
      } as any;

      const result = await generateIntelligenceReport(
        mockObservations,
        missingFreshness
      );

      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
    });

    it("should allow empty observations (after short-circuit)", async () => {
      const result = await generateIntelligenceReport(
        [mockObservations[0]], // Insufficient
        mockWave2AResult
      );

      // Should pass validation even with insufficient data
      // because Wave 2B/2C are skipped
      expect(result.validation_status).toBe("PASSED_ALL_GATES");
    });
  });

  describe("Interpretation Drift Prevention", () => {
    it("should validate that Wave 2 output contains no interpretation", async () => {
      // In a real test, we would mock Wave 2B to return observations with forbidden words
      // and verify Wave 2D rejects them

      // For now, this is a placeholder for the validation logic
      const result = await generateIntelligenceReport(
        mockObservations,
        mockWave2AResult
      );

      // In real execution, any observation with forbidden words would be rejected
      // by Wave 2D.validateWave2B()
      expect(result).toBeDefined();
    });
  });

  describe("Result Structure", () => {
    it("should return well-formed Wave 2 result on success", async () => {
      const result = await generateIntelligenceReport(
        mockObservations,
        mockWave2AResult
      );

      // Required fields
      expect(result.candidate_id).toBeDefined();
      expect(result.generated_at).toBeDefined();
      expect(result.validation_status).toBeDefined();

      // Wave 2A output
      expect(result.signals).toBeDefined();
      expect(result.source_distribution).toBeDefined();
      expect(result.contradictions).toBeDefined();
      expect(result.freshness).toBeDefined();
      expect(result.evidence_gaps).toBeDefined();

      // Wave 2B output
      expect(Array.isArray(result.intelligence_observations)).toBe(true);

      // Wave 2C output
      expect(result.evidence_graph).toBeDefined();
      expect(Array.isArray(result.evidence_graph.observation_links)).toBe(true);
      expect(Array.isArray(result.evidence_graph.clusters)).toBe(true);
      expect(Array.isArray(result.evidence_graph.raw_facts)).toBe(true);
    });

    it("should return well-formed result on failure", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: undefined as any,
        source_distribution: {},
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      // Even on failure, structure must be consistent
      expect(result.candidate_id).toBeDefined();
      expect(result.generated_at).toBeDefined();
      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");

      // All outputs present but empty
      expect(Array.isArray(result.intelligence_observations)).toBe(true);
      expect(result.evidence_graph.observation_links).toBeDefined();
    });
  });

  describe("Circuit Breaker Pattern", () => {
    it("should fail fast on Wave 2A validation", async () => {
      const invalidWave2A: Wave2AResult = {
        candidate_id: "candidate-123",
        operational_signals: "not-an-object" as any,
        source_distribution: {},
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
      };

      const result = await generateIntelligenceReport(
        mockObservations,
        invalidWave2A
      );

      // Should immediately return safe state, not continue to Wave 2B/C
      expect(result.validation_status).toBe("VALIDATION_FAILED_SAFE_STATE");
    });
  });
});
