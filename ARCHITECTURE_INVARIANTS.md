# WAVE 2E: ARCHITECTURE INVARIANTS

**Purpose:** Prevent architectural regression through automated invariant enforcement

**Status:** ✅ IMPLEMENTED

Date: 2026-06-19

---

## OVERVIEW

This document defines the 14 architectural invariants that MUST NOT change without explicit approval. Each invariant is enforced by automated tests that fail the build if violated.

**These are not code style preferences. These are structural guarantees.**

---

## WHY INVARIANTS MATTER

Without invariant enforcement, future contributors might:
- Add a second entry point (`generateIntelligence()`) "for convenience"
- Export Wave2DLock "so tests can mock it"
- Add a "fast path" that skips some gates
- Create alternate result types for partial states
- Introduce circular dependencies

Each of these would silently weaken the architecture.

**Invariant tests prevent this by failing the build automatically.**

---

## THE 14 INVARIANTS

---

## INVARIANT 1: Single Entry Point

**Statement:** Exactly one public function is exported from the orchestrator.

**Why it matters:**
- Guarantees all Wave 2 execution goes through `runWave2()`
- Prevents alternate entry points that might skip gates
- Simplifies debugging (only one path to instrument)
- Makes contract clear to callers

**What would violate this:**
```typescript
// ❌ BAD: Adding alternate entry point
export async function runWave2Fast(observations) { ... }
export async function generateIntelligence(obs) { ... }
export async function executeWave2Simple(obs) { ... }
```

**How tests enforce it:**
```
✓ Count exported functions (must be exactly 1)
✓ Assert function name is 'runWave2'
✓ Assert no 'run', 'execute', 'generate' variants exist
✓ Check source has exactly one 'export async function'
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 1: Single Entry Point`

---

## INVARIANT 2: Private Implementation Functions

**Statement:** Wave 2A, 2B, and 2C implementation functions are NOT exported.

**Why it matters:**
- `executeWave2A`, `executeWave2B`, `executeWave2C` cannot be called independently
- Prevents bypassing validation gates
- Forces all execution through `runWave2()` linear path
- Ensures gates are mandatory, not optional

**What would violate this:**
```typescript
// ❌ BAD: Making Wave 2A callable directly
export async function executeWave2A(observations) { ... }

// This allows:
const signals = await executeWave2A(obs);  // Bypasses all gates!
```

**How tests enforce it:**
```
✓ Assert executeWave2A is undefined (not exported)
✓ Assert executeWave2B is undefined (not exported)
✓ Assert executeWave2C is undefined (not exported)
✓ Verify functions exist in source but without 'export' keyword
✓ Verify functions are only called from runWave2()
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 2: Private Implementation Functions`

---

## INVARIANT 3: Wave2DLock Not Exported from Orchestrator

**Statement:** Wave2DLock is not re-exported from the orchestrator module.

**Why it matters:**
- Prevents callers from instantiating Wave2DLock directly
- Prevents callers from calling validation methods independently
- Forces all validation to happen inside `runWave2()` as inline gates
- Wave2DLock is implementation detail, not public API

**What would violate this:**
```typescript
// ❌ BAD: Re-exporting Wave2DLock
export { Wave2DLock } from "./wave2d-enforcement-gate/lock";

// This allows:
import { Wave2DLock } from "./wave2-orchestrator";
const lock = new Wave2DLock();
lock.validateWave2A(signals);  // Bypasses all gates!
```

**How tests enforce it:**
```
✓ Assert Wave2DLock is undefined in module exports
✓ Verify source has import but no export of Wave2DLock
✓ Count instantiations of Wave2DLock (must be exactly 1, inside runWave2)
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 3: Wave2DLock Not Exported from Orchestrator`

---

## INVARIANT 4: Result Type is Canonical

**Statement:** Only one result type is exported: `Wave2LockedResult`

**Why it matters:**
- No partial result types exist (`Wave2AOnlyResult`, `PartialResult`, etc.)
- Type system enforces gates passed or validation failed
- No way to accidentally accept partial/corrupted data downstream
- Clear contract: every result from Wave 2 is either fully valid or empty

**What would violate this:**
```typescript
// ❌ BAD: Creating alternate result types
export interface Wave2AAndBResult { ... }  // Partial state
export interface Wave2SimpleResult { ... }  // Skipped gates
export interface FastWave2Result { ... }  // Partial validation
```

**How tests enforce it:**
```
✓ Assert Wave2LockedResult is exported
✓ Assert Wave2Result is undefined
✓ Assert Wave2AOnlyResult is undefined
✓ Assert PartialWave2Result is undefined
✓ Verify status field has exactly two possible values
✓ Assert both are: "VALID_LOCKED_INTELLIGENCE" and "VALIDATION_FAILED_SAFE_STATE"
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 4: Result Type is Canonical`

---

## INVARIANT 5: Export Types Only

**Statement:** Only public types and the entry function are exported.

**Why it matters:**
- Clear separation between public API and implementation
- Prevents accidental export of internal types (Wave2AResult, etc.)
- Limits API surface to what's necessary
- Prevents misuse through incomplete types

**What would violate this:**
```typescript
// ❌ BAD: Exporting implementation types
export type Wave2AResult { ... }
export function createEmptySafeState() { ... }
export class Wave2DLock { ... }
```

**How tests enforce it:**
```
✓ Assert only these are exported:
  - runWave2 (function)
  - Wave2LockedResult (type)
  - Observation (type)
✓ Assert Wave2AResult is not exported
✓ Assert internal functions are not exported
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 5: Export Types Only`

---

## INVARIANT 6: Gate Execution is Mandatory

**Statement:** All three validation gates execute in order and are not optional.

**Why it matters:**
- Every successful result has passed all three gates
- Gates are inline, not conditional
- No branching or shortcuts possible
- Audit trail is always complete

**What would violate this:**
```typescript
// ❌ BAD: Making gates optional
if (enableGate2) {
  const check = lock.validateWave2B(wave2b, validObsIds);
  if (!check.valid) return createEmptySafeState();
}

// ❌ BAD: Skipping gates
if (observations.length > 100) {
  return { status: "VALID_LOCKED_INTELLIGENCE", ... };  // Skip gates!
}
```

**How tests enforce it:**
```
✓ Count gate validations (must be exactly 3)
✓ Verify each gate is called exactly once
✓ Assert gates are in order: 2A → Gate1 → 2B → Gate2 → 2C → Gate3
✓ Verify no conditional skipping of gates
✓ Assert each gate failure returns empty safe state
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 6: Gate Execution is Mandatory`

---

## INVARIANT 7: No Circular Dependencies

**Statement:** Wave 2 modules have no circular dependency relationships.

**Why it matters:**
- Clear dependency direction prevents coupling loops
- Easier to test and reason about
- Prevents subtle bugs from initialization order
- Dependency graph is acyclic

**What would violate this:**
```typescript
// orchestrator.ts
import { Wave2BEngine } from "./wave2b-insights";

// wave2b-insights.ts
import { runWave2 } from "./wave2-orchestrator";  // ❌ Circular!
```

**How tests enforce it:**
```
✓ Verify orchestrator imports Wave2DLock (correct direction)
✓ Assert Wave2DLock doesn't import orchestrator (no circle)
✓ Verify wave2b doesn't import wave2c (independent)
✓ Verify wave2c doesn't import wave2b (independent)
✓ All modules importable without circular resolution errors
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 7: No Circular Dependencies`

---

## INVARIANT 8: Safe State is Canonical

**Statement:** The empty safe state returned on gate failure is always the same structure.

**Why it matters:**
- Callers always get consistent structure (no surprises)
- Type system matches implementation
- Easy to recognize failure state
- No partial field variations possible

**What would violate this:**
```typescript
// ❌ BAD: Different safe states for different gates
if (!gateA.valid) {
  return { signals: {}, status: "FAILED" };  // Incomplete!
}

if (!gateB.valid) {
  return { signals: {}, intelligence_observations: [], status: "FAILED" };  // Different structure!
}
```

**How tests enforce it:**
```
✓ Verify structure of empty safe state
✓ Assert it has all required fields
✓ Assert all arrays are empty []
✓ Assert all objects are empty {}
✓ Assert every gate failure uses createEmptySafeState()
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 8: Safe State is Canonical`

---

## INVARIANT 9: No Alternate Code Paths

**Statement:** The linear gate execution path is the only logical path through Wave 2.

**Why it matters:**
- Simplifies reasoning about execution
- No hidden branches that skip gates
- No "fast paths" that bypass validation
- Code complexity is minimized

**What would violate this:**
```typescript
// ❌ BAD: Alternate path that skips gates
if (observations.length < 10 && enableFastPath) {
  return quickAnalyze(observations);  // Skips all gates!
}

// ❌ BAD: Conditional gate skipping
if (skipValidation) {  // Should never exist
  return result;
}
```

**How tests enforce it:**
```
✓ Assert no conditional skipping of gates
✓ Verify no try-catch that allows gate bypass
✓ Assert no commented-out alternate paths
✓ Verify no debug/test code paths that skip validation
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 9: No Alternate Code Paths`

---

## INVARIANT 10: Gate Failures are Consistent

**Statement:** Every gate failure is logged and handled identically.

**Why it matters:**
- Audit trail is complete and consistent
- Debugging is easier (same pattern every time)
- Clear signal when gates fail
- Monitoring can detect gate failures

**What would violate this:**
```typescript
// ❌ BAD: Inconsistent failure handling
if (!gateA.valid) {
  console.error("Unexpected error");  // Unclear
  return { };  // Wrong structure
}

if (!gateB.valid) {
  // No logging, silent failure
  return createEmptySafeState();
}
```

**How tests enforce it:**
```
✓ Verify each gate logs [WAVE 2D GATE X FAILURE]
✓ Assert success logs [WAVE 2D SUCCESS]
✓ Verify console.warn is used consistently
✓ Assert each failure uses createEmptySafeState()
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 10: Gate Failures are Consistent`

---

## INVARIANT 11: No Test Bypasses

**Statement:** Test suites are not configured to skip tests.

**Why it matters:**
- All architectural tests must run (can't be skipped)
- Build doesn't fail silently with `.skip()` or `.only()`
- Continuous enforcement of invariants
- No "temporary" test disabling

**What would violate this:**
```typescript
// ❌ BAD: Skipping tests
it.skip("should export only runWave2", () => { ... });
describe.only("Invariant 1", () => { ... });
```

**How tests enforce it:**
```
✓ Scan test files for `.skip(` (must be zero)
✓ Scan test files for `.only(` (must be zero)
✓ Verify all describe blocks run
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 11: No Test Bypasses`

---

## INVARIANT 12: Documentation Consistency

**Statement:** Code documentation accurately reflects architectural constraints.

**Why it matters:**
- Developers understand the constraints
- Documentation is single source of truth
- Prevents "accidental" violations due to misunderstanding
- Makes constraints discoverable

**What would violate this:**
```typescript
// ❌ BAD: Documentation misleading
/**
 * Run Wave 2, optionally skipping gates
 * ...
 */
export async function runWave2(observations, skipGates?) { ... }

// ❌ BAD: No architectural warning
export async function runWave2(observations) { ... }
// Missing: ⚠️  CRITICAL ARCHITECTURAL CONSTRAINT
```

**How tests enforce it:**
```
✓ Verify file contains architectural constraint notice
✓ Assert contains "EXACTLY ONE EXECUTION PATH"
✓ Assert contains "Wave 2D is the MANDATORY exit gate"
✓ Verify contains "NO OTHER ENTRY POINT EXISTS"
✓ Assert contains "NO LAYER CAN BE CALLED INDEPENDENTLY"
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 12: Documentation Consistency`

---

## INVARIANT 13: Module Boundary

**Statement:** Internal modules don't cross-import; orchestrator is sole coordinator.

**Why it matters:**
- Clear module boundaries prevent coupling
- Orchestrator is the only place that knows about all layers
- Layers are independent and testable
- Changes to one layer don't cascade

**What would violate this:**
```typescript
// ❌ BAD: wave2b imports wave2c
// wave2b-insights/insight-generator.ts
import { Wave2CEngine } from "../wave2c-evidence-lock/engine";
```

**How tests enforce it:**
```
✓ Verify wave2b doesn't import orchestrator
✓ Verify wave2c doesn't import orchestrator
✓ Verify only orchestrator imports both 2b and 2c
✓ Assert clean module boundaries
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 13: Module Boundary`

---

## INVARIANT 14: Type Safety Boundary

**Statement:** Public API has no `any` types and uses correct type imports.

**Why it matters:**
- Type safety at the boundary
- Callers get proper types, not escapes
- IDE autocomplete works correctly
- Prevents subtle type errors

**What would violate this:**
```typescript
// ❌ BAD: Using any in public type
export interface Wave2LockedResult {
  signals: any;  // ❌ No!
  observations: Record<string, any>[];  // ❌ Better but still escape
}
```

**How tests enforce it:**
```
✓ Verify no ': any' in Wave2LockedResult
✓ Verify no 'any[]' in public types
✓ Assert SafeFallback imported as type (not value)
```

**Test file:** `wave2e-architectural-invariants.test.ts`
**Test name:** `Invariant 14: Type Safety Boundary`

---

## ENFORCEMENT IN CI/CD

### GitHub Actions Example

```yaml
name: Architecture Invariants Check

on: [pull_request, push]

jobs:
  invariants:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      
      - run: npm ci
      - run: npm test wave2e-architectural-invariants.test.ts
      
      # FAIL BUILD if any invariant is violated
      - run: |
          if [ $? -ne 0 ]; then
            echo "❌ ARCHITECTURAL INVARIANTS VIOLATED"
            echo "Commit violates Wave 2 architecture constraints"
            exit 1
          fi
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Checking Wave 2 architectural invariants..."
npm test wave2e-architectural-invariants.test.ts

if [ $? -ne 0 ]; then
  echo "❌ COMMIT REJECTED: Architectural invariants violated"
  exit 1
fi

echo "✅ All invariants passed"
exit 0
```

---

## MODIFYING INVARIANTS

**These invariants are NOT intended to be static forever.**

However, any change to an invariant requires:

1. **Explicit approval** from the architecture owner (usually code review)
2. **Written justification** in a document explaining:
   - Why the invariant is no longer valid
   - What architectural change necessitated it
   - How the new constraint is enforced
3. **Updated tests** that enforce the new invariant
4. **Impact assessment** of downstream systems that depend on the old invariant

**Changing an invariant without this process is a **code review red flag**.**

---

## VERIFICATION CHECKLIST

Run before deployment:

```bash
# Run all invariant tests
npm test wave2e-architectural-invariants.test.ts

# Verify no circular dependencies
npm run check:circular-deps

# Verify module structure
npm run check:module-exports

# Type check
npm run typecheck
```

All must pass.

---

## EXAMPLE: DETECTING REGRESSION

**Scenario:** A developer adds a new entry point for convenience.

```typescript
// ❌ Code added by developer (well-intentioned)
export async function quickAnalyze(observations) {
  const a = await executeWave2A(observations);
  const b = await executeWave2B(a, observations);
  return b;  // Skip 2C and all validation!
}
```

**What happens:**

1. Developer opens PR
2. CI runs `wave2e-architectural-invariants.test.ts`
3. Test fails: "should export EXACTLY ONE public function"
4. Build is red ❌
5. PR cannot be merged
6. Developer is informed of architectural constraint
7. Code is removed or reworked

**Result:** Architectural regression prevented automatically.

---

## SUMMARY

Wave 2E provides **automated architectural enforcement** through 14 invariants:

| Invariant | Tests | Enforcement |
|-----------|-------|-------------|
| 1. Single Entry Point | 4 | Only runWave2 exported |
| 2. Private Implementation | 4 | A/B/C not exported |
| 3. Wave2DLock Not Exported | 3 | Lock stays internal |
| 4. Result Type Canonical | 5 | Only Wave2LockedResult |
| 5. Export Types Only | 2 | Limited public API |
| 6. Gate Execution Mandatory | 4 | All gates inline |
| 7. No Circular Dependencies | 4 | Clean module graph |
| 8. Safe State Canonical | 2 | Consistent failures |
| 9. No Alternate Code Paths | 3 | Linear execution |
| 10. Gate Failures Consistent | 3 | Uniform logging |
| 11. No Test Bypasses | 1 | All tests run |
| 12. Documentation Consistency | 2 | Accurate docs |
| 13. Module Boundary | 3 | Clean separation |
| 14. Type Safety Boundary | 2 | No `any` escapes |

**Total: 42 automated tests**

**Result: Future contributors cannot accidentally weaken Wave 2 architecture without failing the build.**

---

## FINAL GUARANTEE

**Wave 2E makes this guarantee:**

Every Wave 2 result you receive has either:
1. ✅ Passed all three gates (VALID_LOCKED_INTELLIGENCE)
2. ✅ Failed at least one gate and returned empty (VALIDATION_FAILED_SAFE_STATE)

**This guarantee is enforced by automated tests that fail the build if violated.**

No human review can override this. The architecture enforces itself.
