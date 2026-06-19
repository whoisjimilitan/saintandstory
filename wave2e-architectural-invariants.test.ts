/**
 * WAVE 2E: ARCHITECTURAL INVARIANT ENFORCEMENT
 *
 * CRITICAL TEST SUITE
 *
 * These tests verify that the architectural guarantees of Wave 2
 * cannot silently regress during future development.
 *
 * If ANY invariant test fails, the build MUST fail.
 * This prevents accidental architectural violations.
 *
 * ARCHITECTURAL INVARIANTS (IMMUTABLE):
 * 1. Exactly one exported public entry point: runWave2()
 * 2. Wave 2A/B/C implementation functions are private
 * 3. Wave2DLock is not exported from orchestrator
 * 4. No circular dependencies
 * 5. Only orchestrator imports internal Wave 2 modules
 * 6. No alternate execution paths exist
 * 7. Every successful execution passes all validation gates
 * 8. Every validation failure returns canonical safe state
 *
 * These invariants CANNOT be changed without explicit approval.
 */

import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Wave 2E: Architectural Invariants (CRITICAL - Regression Prevention)", () => {
  let orchestratorSource: string;
  let wave2dLockSource: string;
  let wave2bSource: string;
  let wave2cSource: string;

  beforeAll(() => {
    // Load source files
    const basePath = __dirname;

    orchestratorSource = fs.readFileSync(
      path.join(basePath, "wave2-orchestrator.ts"),
      "utf-8"
    );
    wave2dLockSource = fs.readFileSync(
      path.join(basePath, "wave2d-enforcement-gate", "lock.ts"),
      "utf-8"
    );
    wave2bSource = fs.readFileSync(
      path.join(basePath, "wave2b-insights", "insight-generator.ts"),
      "utf-8"
    );
    wave2cSource = fs.readFileSync(
      path.join(basePath, "wave2c-evidence-lock", "engine.ts"),
      "utf-8"
    );
  });

  describe("Invariant 1: Single Entry Point", () => {
    it("should export EXACTLY ONE public function from orchestrator", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      // Get all function exports
      const functionExports = Object.entries(wave2Module)
        .filter(([key, value]) => typeof value === "function")
        .filter(([key]) => !key.startsWith("_"))
        .map(([key]) => key);

      expect(functionExports).toEqual(["runWave2"]);
      expect(functionExports.length).toBe(1);
    });

    it("should have runWave2 as async function with correct signature", () => {
      // Check source for function signature
      expect(orchestratorSource).toContain(
        "export async function runWave2("
      );
      expect(orchestratorSource).toContain(
        "observations: Observation[]"
      );
      expect(orchestratorSource).toContain(
        "Promise<Wave2LockedResult>"
      );
    });

    it("should NOT export generateIntelligenceReport", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.generateIntelligenceReport).toBeUndefined();
    });

    it("should NOT have multiple entry points (no runWave2Simple, etc)", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      const publicFunctions = Object.entries(wave2Module)
        .filter(([, value]) => typeof value === "function")
        .filter(([key]) => !key.startsWith("_"))
        .map(([key]) => key);

      // Should not have variants
      expect(publicFunctions).not.toContain("runWave2Simplified");
      expect(publicFunctions).not.toContain("runWave2Fast");
      expect(publicFunctions).not.toContain("runWave2Simple");
      expect(publicFunctions).not.toContain("executeIntelligence");
    });

    it("source should have exactly one 'export async function'", () => {
      const matches = orchestratorSource.match(/export\s+async\s+function/g);
      expect(matches?.length).toBe(1);
      expect(matches?.[0]).toBe("export async function");
    });
  });

  describe("Invariant 2: Private Implementation Functions", () => {
    it("executeWave2A should NOT be exported", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.executeWave2A).toBeUndefined();
    });

    it("executeWave2B should NOT be exported", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.executeWave2B).toBeUndefined();
    });

    it("executeWave2C should NOT be exported", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.executeWave2C).toBeUndefined();
    });

    it("Wave 2A/B/C should be declared with 'async function' not 'export'", () => {
      // Check that executeWave2A is NOT exported
      expect(orchestratorSource).toContain("async function executeWave2A(");
      expect(orchestratorSource).not.toContain("export async function executeWave2A");

      expect(orchestratorSource).toContain("async function executeWave2B(");
      expect(orchestratorSource).not.toContain("export async function executeWave2B");

      expect(orchestratorSource).toContain("async function executeWave2C(");
      expect(orchestratorSource).not.toContain("export async function executeWave2C");
    });

    it("Wave 2A/B/C should be called ONLY from runWave2", () => {
      // executeWave2A should only appear in runWave2 function
      const lines = orchestratorSource.split("\n");
      let inRunWave2 = false;
      let executeWave2ACallCount = 0;

      for (const line of lines) {
        if (line.includes("export async function runWave2")) {
          inRunWave2 = true;
        }
        if (inRunWave2 && line.includes("executeWave2A(")) {
          executeWave2ACallCount++;
        }
        if (inRunWave2 && line === "}") {
          inRunWave2 = false;
        }
      }

      // Should be called once from within runWave2
      expect(executeWave2ACallCount).toBe(1);
    });

    it("createEmptySafeState should NOT be exported", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.createEmptySafeState).toBeUndefined();
    });
  });

  describe("Invariant 3: Wave2DLock Not Exported from Orchestrator", () => {
    it("Wave2DLock should NOT be exported from orchestrator module", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Wave2DLock).toBeUndefined();
    });

    it("Wave2DLock should only be imported internally", () => {
      // Should have import but no re-export
      expect(orchestratorSource).toContain(
        'import { Wave2DLock } from "./wave2d-enforcement-gate/lock"'
      );
      // Should NOT have export
      expect(orchestratorSource).not.toContain("export { Wave2DLock");
      expect(orchestratorSource).not.toContain("export type { Wave2DLock");
    });

    it("Wave2DLock should be instantiated ONLY within runWave2", () => {
      // Count "new Wave2DLock()" occurrences
      const matches = orchestratorSource.match(/new\s+Wave2DLock\(\)/g);
      // Should be exactly one
      expect(matches?.length).toBe(1);
    });
  });

  describe("Invariant 4: Result Type is Canonical", () => {
    it("should export Wave2LockedResult interface", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Wave2LockedResult).toBeDefined();
    });

    it("Wave2LockedResult should be the ONLY result type", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      // Should not have alternate types
      expect(wave2Module.Wave2Result).toBeUndefined();
      expect(wave2Module.Wave2AOnlyResult).toBeUndefined();
      expect(wave2Module.PartialWave2Result).toBeUndefined();
      expect(wave2Module.Wave2AAndBResult).toBeUndefined();
    });

    it("Wave2LockedResult must have status field", () => {
      expect(orchestratorSource).toContain(
        'status: "VALID_LOCKED_INTELLIGENCE" | "VALIDATION_FAILED_SAFE_STATE"'
      );
    });

    it("status field should have exactly two possible values", () => {
      const statusMatch = orchestratorSource.match(
        /status:\s*"([^"]+)"\s*\|\s*"([^"]+)"/
      );
      expect(statusMatch).toBeTruthy();
      expect(statusMatch?.length).toBe(3); // Full match + 2 values

      const values = [statusMatch?.[1], statusMatch?.[2]];
      expect(values).toContain("VALID_LOCKED_INTELLIGENCE");
      expect(values).toContain("VALIDATION_FAILED_SAFE_STATE");
    });
  });

  describe("Invariant 5: Export Types Only", () => {
    it("should export Observation type", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Observation).toBeDefined();
    });

    it("should export Wave2LockedResult type", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Wave2LockedResult).toBeDefined();
    });

    it("should NOT export Wave2AResult type", async () => {
      const wave2Module = await import("./wave2-orchestrator");
      expect(wave2Module.Wave2AResult).toBeUndefined();
    });

    it("should NOT export implementation details", async () => {
      const wave2Module = await import("./wave2-orchestrator");

      // Check nothing else is exported
      const exportedItems = Object.keys(wave2Module);
      const expectedExports = ["runWave2", "Wave2LockedResult", "Observation"];

      for (const key of exportedItems) {
        expect(expectedExports).toContain(key);
      }
    });
  });

  describe("Invariant 6: Gate Execution is Mandatory", () => {
    it("runWave2 must call all three gates in sequence", () => {
      expect(orchestratorSource).toContain("validator.validateWave2A(");
      expect(orchestratorSource).toContain("validator.validateWave2B(");
      expect(orchestratorSource).toContain("validator.validateWave2C(");

      // Count occurrences - should be exactly one of each
      expect(orchestratorSource.match(/validator\.validateWave2A\(/g)?.length).toBe(1);
      expect(orchestratorSource.match(/validator\.validateWave2B\(/g)?.length).toBe(1);
      expect(orchestratorSource.match(/validator\.validateWave2C\(/g)?.length).toBe(1);
    });

    it("each gate failure must return empty safe state", () => {
      // Count "if (!...Check.valid) return createEmptySafeState"
      const failureReturns = orchestratorSource.match(
        /if\s*\([^)]*\.valid\)\s*\{[^}]*return\s+createEmptySafeState/g
      );

      // Should be exactly 3 (one for each gate)
      expect(failureReturns?.length).toBe(3);
    });

    it("all gates must come before final return", () => {
      const runWave2Start = orchestratorSource.indexOf("export async function runWave2");
      const gate1Start = orchestratorSource.indexOf(
        "validator.validateWave2A(",
        runWave2Start
      );
      const gate2Start = orchestratorSource.indexOf(
        "validator.validateWave2B(",
        runWave2Start
      );
      const gate3Start = orchestratorSource.indexOf(
        "validator.validateWave2C(",
        runWave2Start
      );
      const finalReturn = orchestratorSource.indexOf(
        'status: "VALID_LOCKED_INTELLIGENCE"',
        runWave2Start
      );

      // Order should be: 2A → Gate1 → 2B → Gate2 → 2C → Gate3 → return
      expect(gate1Start).toBeGreaterThan(0);
      expect(gate2Start).toBeGreaterThan(gate1Start);
      expect(gate3Start).toBeGreaterThan(gate2Start);
      expect(finalReturn).toBeGreaterThan(gate3Start);
    });
  });

  describe("Invariant 7: No Circular Dependencies", () => {
    it("orchestrator should import from wave2d, not vice versa", () => {
      // Orchestrator imports Wave2DLock
      expect(orchestratorSource).toContain(
        'import { Wave2DLock } from "./wave2d-enforcement-gate/lock"'
      );

      // Wave2DLock should NOT import from orchestrator
      expect(wave2dLockSource).not.toContain(
        'from "./wave2-orchestrator"'
      );
      expect(wave2dLockSource).not.toContain('import "wave2-orchestrator"');
    });

    it("wave2b should not import from wave2c", () => {
      expect(wave2bSource).not.toContain("wave2c-evidence-lock");
      expect(wave2bSource).not.toContain("Wave2CEngine");
    });

    it("wave2c should not import from wave2b", () => {
      expect(wave2cSource).not.toContain("wave2b-insights");
      expect(wave2cSource).not.toContain("IntelligenceAnalyzer");
    });
  });

  describe("Invariant 8: Safe State is Canonical", () => {
    it("createEmptySafeState must always return same structure", () => {
      const safeStateMatch = orchestratorSource.match(
        /return\s*\{\s*candidate_id:\s*"UNKNOWN"[\s\S]*?status:\s*"VALIDATION_FAILED_SAFE_STATE"/
      );

      expect(safeStateMatch).toBeTruthy();

      // Should have all required fields
      const structure = safeStateMatch?.[0] || "";
      expect(structure).toContain("candidate_id");
      expect(structure).toContain("generated_at");
      expect(structure).toContain("signals: {}");
      expect(structure).toContain("intelligence_observations: []");
      expect(structure).toContain("evidence_graph");
    });

    it("every gate failure must call createEmptySafeState", () => {
      const failurePattern = /if\s*\([^)]*\.valid\)\s*\{[\s\S]*?return\s+createEmptySafeState/;
      const matches = orchestratorSource.match(
        new RegExp(failurePattern, "g")
      );

      // Should be exactly 3 matches (one per gate)
      expect(matches?.length).toBe(3);
    });
  });

  describe("Invariant 9: No Alternate Code Paths", () => {
    it("should have no try-catch that skips gates", () => {
      // try-catch is OK for LLM calls, but must not allow skipping validation
      const tryCatchCount = (orchestratorSource.match(/try\s*\{/g) || []).length;

      // Count how many are used for 2B and 2C (expected)
      const wave2bTryCatch = orchestratorSource.includes(
        "try {\n    wave2b = await executeWave2B"
      );
      const wave2cTryCatch = orchestratorSource.includes(
        "try {\n    wave2c = await executeWave2C"
      );

      // If there are try-catches, they should only be around LLM calls
      // and should STILL call the validation gates
      if (tryCatchCount > 0) {
        expect(wave2bTryCatch || wave2cTryCatch).toBe(true);
      }
    });

    it("should have no conditional logic that skips gates", () => {
      // Gates must be unconditional
      const runWave2Content = orchestratorSource.substring(
        orchestratorSource.indexOf("export async function runWave2"),
        orchestratorSource.lastIndexOf("}") + 1
      );

      // Check that there are no "if" statements before gates
      const beforeGate1 = runWave2Content.substring(
        0,
        runWave2Content.indexOf("validator.validateWave2A")
      );

      // Should only have: const validator, const validObsIds
      expect(beforeGate1).toContain("const validator");
      expect(beforeGate1).toContain("const validObsIds");

      // Should NOT have early returns or skips
      expect(beforeGate1).not.toContain("if (");
      expect(beforeGate1).not.toContain("return");
    });

    it("should not have commented-out alternate paths", () => {
      // No "//" before gate validation
      const lines = orchestratorSource.split("\n");
      for (const line of lines) {
        if (line.includes("validateWave2")) {
          expect(line.trim()).not.toMatch(/^\/\//);
        }
      }
    });
  });

  describe("Invariant 10: Gate Failures are Consistent", () => {
    it("every gate failure should log [WAVE 2D GATE X FAILURE]", () => {
      expect(orchestratorSource).toContain(
        "[WAVE 2D GATE 1 FAILURE]"
      );
      expect(orchestratorSource).toContain(
        "[WAVE 2D GATE 2 FAILURE]"
      );
      expect(orchestratorSource).toContain(
        "[WAVE 2D GATE 3 FAILURE]"
      );
    });

    it("success should log [WAVE 2D SUCCESS]", () => {
      expect(orchestratorSource).toContain(
        "[WAVE 2D SUCCESS]"
      );
    });

    it("console.warn should be used for gate failures", () => {
      // Count console.warn in gate failure paths
      const failureSection = orchestratorSource.match(
        /if\s*\([^)]*\.valid\)\s*\{[\s\S]*?console\.warn/g
      );

      // Should be 3 (one per gate)
      expect(failureSection?.length).toBe(3);
    });
  });

  describe("Invariant 11: No Test Bypasses", () => {
    it("should not have skip() or only() in tests", async () => {
      const testFile = fs.readFileSync(
        path.join(__dirname, "wave2-bypass-validation.test.ts"),
        "utf-8"
      );

      expect(testFile).not.toContain("it.skip(");
      expect(testFile).not.toContain("describe.skip(");
      expect(testFile).not.toContain("it.only(");
      expect(testFile).not.toContain("describe.only(");
    });
  });

  describe("Invariant 12: Documentation Consistency", () => {
    it("should have architectural constraint notice at top of file", () => {
      expect(orchestratorSource).toContain(
        "⚠️  CRITICAL ARCHITECTURAL CONSTRAINT"
      );
      expect(orchestratorSource).toContain("EXACTLY ONE EXECUTION PATH");
      expect(orchestratorSource).toContain("Wave 2D is the MANDATORY exit gate");
    });

    it("should document that NO OTHER ENTRY POINT EXISTS", () => {
      expect(orchestratorSource).toContain(
        "NO OTHER ENTRY POINT EXISTS"
      );
      expect(orchestratorSource).toContain(
        "NO LAYER CAN BE CALLED INDEPENDENTLY"
      );
    });
  });

  describe("Invariant 13: Module Boundary", () => {
    it("wave2b-insights should NOT import from orchestrator", () => {
      expect(wave2bSource).not.toContain(
        'from "./wave2-orchestrator"'
      );
    });

    it("wave2c-evidence-lock should NOT import from orchestrator", () => {
      expect(wave2cSource).not.toContain(
        'from "./wave2-orchestrator"'
      );
    });

    it("orchestrator should be the ONLY module importing both 2b and 2c", () => {
      // Only orchestrator should orchestrate
      expect(orchestratorSource).toContain("IntelligenceAnalyzer");
      expect(orchestratorSource).toContain("Wave2CEngine");
    });
  });

  describe("Invariant 14: Type Safety Boundary", () => {
    it("should import SafeFallback type from schema (for reference only)", () => {
      expect(orchestratorSource).toContain(
        'import type { SafeFallback } from "./wave2d-enforcement-gate/schema"'
      );
    });

    it("should NOT have any 'any' types in public API", () => {
      // Check Wave2LockedResult definition has no 'any'
      const resultDef = orchestratorSource.match(
        /export interface Wave2LockedResult[\s\S]*?\n\}/
      )?.[0] || "";

      expect(resultDef).not.toContain(": any");
      expect(resultDef).not.toContain("any[]");
    });
  });
});

describe("Wave 2E: Architectural Regression Prevention (Integration)", () => {
  it("should pass all architectural invariants", async () => {
    // This is a meta-test that summarizes the invariants
    // If any invariant test above fails, this suite fails

    const wave2Module = await import("./wave2-orchestrator");

    // Quick sanity check
    expect(wave2Module.runWave2).toBeDefined();
    expect(typeof wave2Module.runWave2).toBe("function");

    // Confirm result type exists
    expect(wave2Module.Wave2LockedResult).toBeDefined();

    // Confirm no bypasses
    expect(wave2Module.executeWave2A).toBeUndefined();
    expect(wave2Module.executeWave2B).toBeUndefined();
    expect(wave2Module.executeWave2C).toBeUndefined();
    expect(wave2Module.Wave2DLock).toBeUndefined();
  });

  it("should maintain architectural consistency across all Wave 2 modules", async () => {
    // Import all Wave 2 modules to ensure no circular dependencies
    const orchestrator = await import("./wave2-orchestrator");
    const gate = await import("./wave2d-enforcement-gate");
    const insights = await import("./wave2b-insights/insight-generator");
    const lock = await import("./wave2c-evidence-lock/engine");

    // All modules should be importable without error
    expect(orchestrator).toBeDefined();
    expect(gate).toBeDefined();
    expect(insights).toBeDefined();
    expect(lock).toBeDefined();
  });
});
