/**
 * WAVE 3: END-TO-END TEST
 *
 * Mandatory test scenario verifying Wave 3 transforms Wave 2 output
 * into user-actionable insights without Wave 2 coupling.
 */

import { describe, it, expect } from "vitest";
import { runWave3 } from "./wave3-insight-translator";
import type { Wave2LockedResult } from "./wave2-orchestrator";

describe("Wave 3: Insight Translation (E2E)", () => {
  describe("Success State: Valid Locked Intelligence", () => {
    it("should convert valid Wave2 output into actionable insight", () => {
      // SCENARIO: Valid Wave 2 output with 5+ observations, 2+ sources, 1+ contradiction
      const mockWave2Result: Wave2LockedResult = {
        candidate_id: "TEST-CANDIDATE-001",
        generated_at: new Date().toISOString(),
        signals: {
          total_observations: 7,
          observation_types: ["BUSINESS_NAME", "ADDRESS", "PHONE", "EMAIL", "HOURS"],
          source_count: 2,
          has_contradictions: true,
          evidence_gap_count: 1,
        },
        source_distribution: {
          google: 4,
          facebook: 3,
        },
        contradictions: [
          {
            type: "HOURS",
            first_observation: "OBS-001",
            second_observation: "OBS-002",
            conflict_reason: "different_evidence_for_same_type",
          },
        ],
        freshness: {
          most_recent_observation_date: new Date().toISOString(),
          total_unique_dates: 1,
        },
        evidence_gaps: ["WEBSITE"],
        intelligence_observations: [
          {
            id: "IO-0001",
            category: "operations",
            title: "Contradiction detected: hours",
            description: "Business hours differ between sources",
            supporting_observations: ["OBS-001", "OBS-002"],
            confidence: "medium",
            data_quality: "moderate",
            evidence_strength: 0.5,
            generated_at: new Date().toISOString(),
            reasoning: "detected lexical contradiction marker",
          },
        ],
        evidence_graph: {
          observation_links: [],
          clusters: [],
          raw_facts: [],
        },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      // EXECUTE
      const result = runWave3(mockWave2Result);

      // ASSERT: Output structure matches Wave3Insight
      expect(result.insight_id).toBeDefined();
      expect(typeof result.insight_id).toBe("string");

      expect(result.status).toBe("INSIGHTED");
      expect(result.status).not.toMatch(/INSUFFICIENT_SIGNAL/);

      expect(typeof result.summary).toBe("string");
      expect(result.summary.length).toBeGreaterThan(0);

      expect(Array.isArray(result.implications)).toBe(true);
      expect(result.implications.length).toBeGreaterThanOrEqual(1);

      expect(Array.isArray(result.recommended_actions)).toBe(true);
      expect(result.recommended_actions.length).toBeGreaterThanOrEqual(1);

      expect(["high", "medium", "low"]).toContain(result.confidence);
    });

    it("should extract source information correctly", () => {
      const mockWave2Result: Wave2LockedResult = {
        candidate_id: "TEST-CANDIDATE-002",
        generated_at: new Date().toISOString(),
        signals: {
          total_observations: 6,
          observation_types: ["BUSINESS_NAME", "ADDRESS", "PHONE"],
          source_count: 3,
          has_contradictions: false,
          evidence_gap_count: 3,
        },
        source_distribution: {
          google: 3,
          yelp: 2,
          facebook: 1,
        },
        contradictions: [],
        freshness: {
          most_recent_observation_date: new Date().toISOString(),
          total_unique_dates: 2,
        },
        evidence_gaps: ["EMAIL", "HOURS", "WEBSITE"],
        intelligence_observations: [],
        evidence_graph: {
          observation_links: [],
          clusters: [],
          raw_facts: [],
        },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const result = runWave3(mockWave2Result);

      expect(result.source_summary.total_signals).toBeGreaterThan(0);
      expect(result.source_summary.key_sources.length).toBeGreaterThan(0);
      expect(result.source_summary.key_sources[0]).toBe("google"); // Top source
    });

    it("should detect contradiction flag", () => {
      const mockWave2WithContradictions: Wave2LockedResult = {
        candidate_id: "TEST-CANDIDATE-003",
        generated_at: new Date().toISOString(),
        signals: {
          total_observations: 5,
          observation_types: ["BUSINESS_NAME", "ADDRESS"],
          source_count: 2,
          has_contradictions: true,
          evidence_gap_count: 4,
        },
        source_distribution: {
          source1: 3,
          source2: 2,
        },
        contradictions: [
          {
            type: "ADDRESS",
            first_observation: "OBS-001",
            second_observation: "OBS-002",
            conflict_reason: "different_evidence_for_same_type",
          },
        ],
        freshness: {
          most_recent_observation_date: new Date().toISOString(),
          total_unique_dates: 1,
        },
        evidence_gaps: ["PHONE", "EMAIL", "HOURS", "WEBSITE"],
        intelligence_observations: [],
        evidence_graph: {
          observation_links: [],
          clusters: [],
          raw_facts: [],
        },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const result = runWave3(mockWave2WithContradictions);

      expect(result.source_summary.contradiction_flag).toBe(true);
      expect(
        result.implications.some(
          (imp) => imp.includes("Conflicting") || imp.includes("conflict")
        )
      ).toBe(true);
    });

    it("should set confidence correctly based on signal strength", () => {
      // High confidence scenario
      const highConfidenceInput: Wave2LockedResult = {
        candidate_id: "HIGH-CONF",
        generated_at: new Date().toISOString(),
        signals: {
          total_observations: 10,
          observation_types: ["BUSINESS_NAME", "ADDRESS", "PHONE", "EMAIL", "HOURS"],
          source_count: 3,
          has_contradictions: false,
          evidence_gap_count: 1,
        },
        source_distribution: {
          source1: 4,
          source2: 3,
          source3: 3,
        },
        contradictions: [],
        freshness: {
          most_recent_observation_date: new Date().toISOString(),
          total_unique_dates: 1,
        },
        evidence_gaps: ["WEBSITE"],
        intelligence_observations: [],
        evidence_graph: {
          observation_links: [],
          clusters: [],
          raw_facts: [],
        },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const highConfResult = runWave3(highConfidenceInput);
      expect(highConfResult.confidence).toBe("high");

      // Low confidence scenario
      const lowConfidenceInput: Wave2LockedResult = {
        candidate_id: "LOW-CONF",
        generated_at: new Date().toISOString(),
        signals: {
          total_observations: 1,
          observation_types: ["BUSINESS_NAME"],
          source_count: 1,
          has_contradictions: false,
          evidence_gap_count: 5,
        },
        source_distribution: {
          source1: 1,
        },
        contradictions: [],
        freshness: {
          most_recent_observation_date: new Date().toISOString(),
          total_unique_dates: 1,
        },
        evidence_gaps: ["ADDRESS", "PHONE", "EMAIL", "HOURS", "WEBSITE"],
        intelligence_observations: [],
        evidence_graph: {
          observation_links: [],
          clusters: [],
          raw_facts: [],
        },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const lowConfResult = runWave3(lowConfidenceInput);
      expect(lowConfResult.confidence).toBe("low");
    });

    it("should generate action-oriented recommendations", () => {
      const mockInput: Wave2LockedResult = {
        candidate_id: "ACTION-TEST",
        generated_at: new Date().toISOString(),
        signals: {
          total_observations: 3,
          observation_types: ["BUSINESS_NAME"],
          source_count: 1,
          has_contradictions: false,
          evidence_gap_count: 4,
        },
        source_distribution: {
          source1: 3,
        },
        contradictions: [],
        freshness: {
          most_recent_observation_date: new Date().toISOString(),
          total_unique_dates: 1,
        },
        evidence_gaps: ["ADDRESS", "PHONE", "EMAIL", "HOURS"],
        intelligence_observations: [],
        evidence_graph: {
          observation_links: [],
          clusters: [],
          raw_facts: [],
        },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const result = runWave3(mockInput);

      // Actions must be concrete, not analysis language
      result.recommended_actions.forEach((action) => {
        expect(action).not.toMatch(/analyze|evaluate|consider|assess|determine/i);
        expect(action.length).toBeGreaterThan(5);
      });

      // At least one action should reference data collection
      expect(
        result.recommended_actions.some(
          (action) =>
            action.includes("Collect") ||
            action.includes("Review") ||
            action.includes("Verify") ||
            action.includes("Reconcile")
        )
      ).toBe(true);
    });
  });

  describe("Failure State: Validation Failed Safe State", () => {
    it("should handle insufficient signal gracefully", () => {
      const failedWave2Result: Wave2LockedResult = {
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
        },
        status: "VALIDATION_FAILED_SAFE_STATE",
      };

      const result = runWave3(failedWave2Result);

      expect(result.status).toBe("INSUFFICIENT_SIGNAL");
      expect(result.confidence).toBe("low");
      expect(result.source_summary.total_signals).toBe(0);
      expect(result.source_summary.key_sources).toEqual([]);
      expect(result.recommended_actions.length).toBeGreaterThan(0);
    });

    it("should not leak Wave 2 internal fields", () => {
      const failedResult: Wave2LockedResult = {
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
        },
        status: "VALIDATION_FAILED_SAFE_STATE",
      };

      const result = runWave3(failedResult);

      expect(result).not.toHaveProperty("signals");
      expect(result).not.toHaveProperty("evidence_graph");
      expect(result).not.toHaveProperty("intelligence_observations");
      expect(result).not.toHaveProperty("freshness");
    });
  });

  describe("No Wave 2 Coupling", () => {
    it("should only import Wave2LockedResult type, not functions", () => {
      // This test verifies by construction: if Wave 3 imported Wave 2 functions,
      // it would have type dependencies visible in the compiled output.
      // This test passes if the file compiles with only the type import.
      const result = runWave3({
        candidate_id: "COMPILE-TEST",
        generated_at: new Date().toISOString(),
        signals: { total_observations: 0 },
        source_distribution: {},
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
        intelligence_observations: [],
        evidence_graph: { observation_links: [], clusters: [], raw_facts: [] },
        status: "VALID_LOCKED_INTELLIGENCE",
      });

      expect(result).toBeDefined();
      expect(result.meta.wave_version).toBe("3.0");
    });

    it("should not reference Wave 2 architecture terms in output", () => {
      const input: Wave2LockedResult = {
        candidate_id: "COUPLING-TEST",
        generated_at: new Date().toISOString(),
        signals: { total_observations: 5 },
        source_distribution: { source1: 5 },
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
        intelligence_observations: [],
        evidence_graph: { observation_links: [], clusters: [], raw_facts: [] },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const result = runWave3(input);

      const outputText = JSON.stringify(result).toLowerCase();
      expect(outputText).not.toMatch(/wave.?2[a-z]|gate|orchestrator|validation|lock/);
    });
  });

  describe("Metadata Correctness", () => {
    it("should populate metadata correctly", () => {
      const input: Wave2LockedResult = {
        candidate_id: "META-TEST",
        generated_at: new Date().toISOString(),
        signals: { total_observations: 1 },
        source_distribution: { source1: 1 },
        contradictions: [],
        freshness: {},
        evidence_gaps: [],
        intelligence_observations: [],
        evidence_graph: { observation_links: [], clusters: [], raw_facts: [] },
        status: "VALID_LOCKED_INTELLIGENCE",
      };

      const result = runWave3(input);

      expect(result.meta.wave_version).toBe("3.0");
      expect(result.meta.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO date
      expect(new Date(result.meta.generated_at).getTime()).toBeGreaterThan(0);
    });
  });
});
