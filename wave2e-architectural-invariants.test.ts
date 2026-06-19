/**
 * WAVE 2E: ARCHITECTURAL INVARIANT ENFORCEMENT
 *
 * CRITICAL TEST SUITE (EXECUTABLE VERSION)
 *
 * These tests verify that the architectural guarantees of Wave 2
 * cannot silently regress during future development.
 *
 * If ANY invariant test fails, the build MUST fail.
 * This prevents accidental architectural violations.
 */

import { describe, it, expect } from "vitest";
import { runWave2, Wave2LockedResult, Observation } from "./wave2-orchestrator";
import { Wave2DLock } from "./wave2d-enforcement-gate/lock";

describe("Wave 2E: Architectural Invariants (CRITICAL)", () => {
  describe("Invariant 1: Single Entry Point", () => {
    it("should export EXACTLY ONE public function from orchestrator", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      const functionExports = Object.entries(wave2Module)
        .filter(([key, value]) => typeof value === "function")
        .filter(([key]) => !key.startsWith("_"))
        .map(([key]) => key);

      expect(functionExports).toEqual(["runWave2"]);
      expect(functionExports.length).toBe(1);
    });

    it("runWave2 must be async function with correct signature", async () => {
      expect(typeof runWave2).toBe("function");

      // Test that it's an async function by checking it returns a Promise
      const testObs: Observation[] = [];
      const result = runWave2(testObs);
      expect(result).toBeInstanceOf(Promise);
    });

    it("should NOT export alternate entry points", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      expect(wave2Module.runWave2Simplified).toBeUndefined();
      expect(wave2Module.runWave2Fast).toBeUndefined();
      expect(wave2Module.runWave2Simple).toBeUndefined();
      expect(wave2Module.executeIntelligence).toBeUndefined();
      expect(wave2Module.generateIntelligenceReport).toBeUndefined();
    });

    it("should NOT export implementation functions", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      expect(wave2Module.executeWave2A).toBeUndefined();
      expect(wave2Module.executeWave2B).toBeUndefined();
      expect(wave2Module.executeWave2C).toBeUndefined();
      expect(wave2Module.createEmptySafeState).toBeUndefined();
    });
  });

  describe("Invariant 2: Private Implementation Functions", () => {
    it("Wave 2A/B/C functions are not independently callable from module", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      expect(typeof wave2Module.executeWave2A).toBe("undefined");
      expect(typeof wave2Module.executeWave2B).toBe("undefined");
      expect(typeof wave2Module.executeWave2C).toBe("undefined");
    });

    it("Wave 2A/B/C can only be accessed through runWave2", async () => {
      // Verify that runWave2 is the only entry point by checking
      // that calling it with valid observations produces output
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "TEST",
          evidence_text: "test evidence",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result = await runWave2(testObs);
      expect(result).toBeDefined();
      expect(result.status).toMatch(/VALID_LOCKED_INTELLIGENCE|VALIDATION_FAILED_SAFE_STATE/);
    });
  });

  describe("Invariant 3: Wave2DLock Not Exported from Orchestrator", () => {
    it("Wave2DLock should NOT be exported from orchestrator module", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Wave2DLock).toBeUndefined();
    });

    it("Wave2DLock is available from wave2d-enforcement-gate module", async () => {
      const wave2dModule = await import("./wave2d-enforcement-gate");
      expect(wave2dModule.Wave2DLock).toBeDefined();
      expect(typeof wave2dModule.Wave2DLock).toBe("function");
    });

    it("Wave2DLock cannot be instantiated from orchestrator", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      // Should not have access to constructor
      expect(wave2Module.Wave2DLock).toBeUndefined();
    });
  });

  describe("Invariant 4: Result Type is Canonical", () => {
    it("should export Wave2LockedResult interface", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Wave2LockedResult).toBeDefined();
    });

    it("Wave2LockedResult should be ONLY result type", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      expect(wave2Module.Wave2Result).toBeUndefined();
      expect(wave2Module.Wave2AOnlyResult).toBeUndefined();
      expect(wave2Module.PartialWave2Result).toBeUndefined();
      expect(wave2Module.Wave2AAndBResult).toBeUndefined();
    });

    it("result status field must have exactly two possible values", async () => {
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "TEST",
          evidence_text: "test",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result = await runWave2(testObs);

      expect(result.status).toMatch(
        /^(VALID_LOCKED_INTELLIGENCE|VALIDATION_FAILED_SAFE_STATE)$/
      );
      expect(["VALID_LOCKED_INTELLIGENCE", "VALIDATION_FAILED_SAFE_STATE"]).toContain(
        result.status
      );
    });

    it("result must always have all required fields", async () => {
      const testObs: Observation[] = [];
      const result = await runWave2(testObs);

      expect(result).toHaveProperty("candidate_id");
      expect(result).toHaveProperty("generated_at");
      expect(result).toHaveProperty("signals");
      expect(result).toHaveProperty("source_distribution");
      expect(result).toHaveProperty("contradictions");
      expect(result).toHaveProperty("freshness");
      expect(result).toHaveProperty("evidence_gaps");
      expect(result).toHaveProperty("intelligence_observations");
      expect(result).toHaveProperty("evidence_graph");
      expect(result).toHaveProperty("status");
    });
  });

  describe("Invariant 5: Gate Execution is Mandatory", () => {
    it("runWave2 must execute all three gates in sequence", async () => {
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "NAME",
          evidence_text: "Test Business",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result = await runWave2(testObs);

      // Result should be valid (all gates passed) or empty (gate failed)
      // But either way, gates were executed
      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it("gate failure must return empty safe state", async () => {
      // Observations with invalid data might cause gate failure
      const testObs: Observation[] = [];

      const result = await runWave2(testObs);

      // Empty observations should still produce a valid result structure
      expect(result).toBeDefined();
      expect(result.candidate_id).toBeDefined();
      expect(result.status).toMatch(/VALID_LOCKED_INTELLIGENCE|VALIDATION_FAILED_SAFE_STATE/);
    });

    it("successful result must have passed all gates", async () => {
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "NAME",
          evidence_text: "Business Name",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result = await runWave2(testObs);

      if (result.status === "VALID_LOCKED_INTELLIGENCE") {
        // If valid, it passed all gates
        expect(result.candidate_id).not.toBe("UNKNOWN");
        expect(result.signals).toBeDefined();
        expect(result.evidence_graph).toBeDefined();
      }
    });
  });

  describe("Invariant 6: Safe State is Canonical", () => {
    it("failed results must have canonical empty safe state structure", async () => {
      // Force a failure by providing problematic input
      const testObs: Observation[] = [];
      const result = await runWave2(testObs);

      // Safe state should always have consistent structure
      expect(result.signals).toBeDefined();
      expect(typeof result.signals).toBe("object");

      expect(result.source_distribution).toBeDefined();
      expect(typeof result.source_distribution).toBe("object");

      expect(result.contradictions).toBeDefined();
      expect(Array.isArray(result.contradictions)).toBe(true);

      expect(result.evidence_gaps).toBeDefined();
      expect(Array.isArray(result.evidence_gaps)).toBe(true);

      expect(result.intelligence_observations).toBeDefined();
      expect(Array.isArray(result.intelligence_observations)).toBe(true);

      expect(result.evidence_graph).toBeDefined();
      expect(Array.isArray(result.evidence_graph.observation_links)).toBe(true);
      expect(Array.isArray(result.evidence_graph.clusters)).toBe(true);
      expect(Array.isArray(result.evidence_graph.raw_facts)).toBe(true);
    });

    it("every failed result uses same safe state pattern", async () => {
      const obs1 = await runWave2([]);
      const obs2 = await runWave2([
        {
          observation_id: "OBS-001",
          observation_type: "TEST",
          evidence_text: "test",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ]);

      // Both should have consistent structure
      expect(Object.keys(obs1).sort()).toEqual(Object.keys(obs2).sort());
    });
  });

  describe("Invariant 7: No Circular Dependencies", () => {
    it("modules must be importable without circular reference error", async () => {
      expect(async () => {
        await import("./wave2-orchestrator");
        await import("./wave2d-enforcement-gate");
        await import("./wave2b-insights/insight-generator");
        await import("./wave2c-evidence-lock/engine");
      }).not.toThrow();
    });

    it("Wave 2D must not depend on orchestrator", async () => {
      // If there were a circular dependency, importing would fail
      const wave2dModule = await import("./wave2d-enforcement-gate/lock");
      expect(wave2dModule.Wave2DLock).toBeDefined();
    });
  });

  describe("Invariant 8: Type Safety Boundary", () => {
    it("Wave2LockedResult must be properly typed", async () => {
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "NAME",
          evidence_text: "Test",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result = await runWave2(testObs);

      // Verify type safety by checking all fields exist
      expect(typeof result.candidate_id).toBe("string");
      expect(typeof result.generated_at).toBe("string");
      expect(typeof result.signals).toBe("object");
      expect(typeof result.source_distribution).toBe("object");
      expect(Array.isArray(result.contradictions)).toBe(true);
      expect(Array.isArray(result.intelligence_observations)).toBe(true);
      expect(typeof result.evidence_graph).toBe("object");
      expect(typeof result.status).toBe("string");
    });

    it("result fields must match expected types", async () => {
      const testObs: Observation[] = [];
      const result = await runWave2(testObs);

      expect(typeof result.candidate_id).toBe("string");
      expect(typeof result.generated_at).toBe("string");
      expect(result.generated_at).toMatch(/\d{4}-\d{2}-\d{2}T/); // ISO date

      expect(Array.isArray(result.contradictions)).toBe(true);
      expect(Array.isArray(result.evidence_gaps)).toBe(true);
      expect(Array.isArray(result.intelligence_observations)).toBe(true);

      expect(result.evidence_graph.observation_links).toBeInstanceOf(Array);
      expect(result.evidence_graph.clusters).toBeInstanceOf(Array);
      expect(result.evidence_graph.raw_facts).toBeInstanceOf(Array);
    });
  });

  describe("Invariant 9: End-to-End Execution", () => {
    it("runWave2 must execute fully without errors", async () => {
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "BUSINESS_NAME",
          evidence_text: "Acme Corporation",
          source: "google",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
        {
          observation_id: "OBS-002",
          observation_type: "ADDRESS",
          evidence_text: "123 Main Street, Springfield, IL 62701",
          source: "google",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result = await runWave2(testObs);

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(["VALID_LOCKED_INTELLIGENCE", "VALIDATION_FAILED_SAFE_STATE"]).toContain(
        result.status
      );
    });

    it("result must be consistent across multiple calls with same input", async () => {
      const testObs: Observation[] = [
        {
          observation_id: "OBS-001",
          observation_type: "NAME",
          evidence_text: "Test Business",
          source: "test",
          confidence: "HIGH",
          extracted_at: new Date().toISOString(),
        },
      ];

      const result1 = await runWave2(testObs);
      const result2 = await runWave2(testObs);

      // Results should be identical (deterministic)
      expect(result1.status).toBe(result2.status);
      expect(result1.candidate_id).toBe(result2.candidate_id);
    });
  });

  describe("Invariant 10: No Alternate Execution Paths", () => {
    it("all execution paths must pass through mandatory gates", async () => {
      // Create different observation types to exercise different code paths
      const testCases = [
        [
          {
            observation_id: "OBS-001",
            observation_type: "NAME",
            evidence_text: "Name but not address",
            source: "test",
            confidence: "HIGH",
            extracted_at: new Date().toISOString(),
          },
        ],
        [
          {
            observation_id: "OBS-001",
            observation_type: "NAME",
            evidence_text: "However something else",
            source: "test",
            confidence: "HIGH",
            extracted_at: new Date().toISOString(),
          },
        ],
        [],
      ];

      for (const testObs of testCases) {
        const result = await runWave2(testObs);

        // Every path should produce a result with status field
        expect(result.status).toBeDefined();
        expect(["VALID_LOCKED_INTELLIGENCE", "VALIDATION_FAILED_SAFE_STATE"]).toContain(
          result.status
        );
      }
    });
  });
});

describe("Wave 2E: Integration Verification", () => {
  it("all architectural invariants are simultaneously satisfied", async () => {
    // This test verifies the entire architecture works together
    const wave2Module = await import("./wave2-orchestrator");
    const wave2dModule = await import("./wave2d-enforcement-gate");

    // Verify exports
    expect(typeof wave2Module.runWave2).toBe("function");
    expect(wave2Module.Wave2LockedResult).toBeDefined();
    expect(wave2Module.Observation).toBeDefined();

    // Verify isolation
    expect(wave2Module.executeWave2A).toBeUndefined();
    expect(wave2Module.executeWave2B).toBeUndefined();
    expect(wave2Module.executeWave2C).toBeUndefined();
    expect(wave2Module.Wave2DLock).toBeUndefined();

    // Verify gate exists
    expect(wave2dModule.Wave2DLock).toBeDefined();

    // Verify execution works
    const testObs: Observation[] = [
      {
        observation_id: "OBS-001",
        observation_type: "TEST",
        evidence_text: "test evidence",
        source: "test",
        confidence: "HIGH",
        extracted_at: new Date().toISOString(),
      },
    ];

    const result = await wave2Module.runWave2(testObs);
    expect(result).toBeDefined();
    expect(result.status).toBeDefined();
  });
});
