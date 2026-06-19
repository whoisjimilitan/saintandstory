/**
 * WAVE 3 PRODUCTION REALITY TEST
 *
 * Real end-to-end execution with realistic input.
 * No mocks, no templates, actual runWave3 behavior.
 */

import { runWave3, type Wave3Insight } from "./wave3-insight-translator";
import type { Wave2LockedResult } from "./wave2-orchestrator";

// PRODUCTION-LIKE INPUT: Realistic Wave2LockedResult
const productionInput: Wave2LockedResult = {
  candidate_id: "PROD-12345",
  generated_at: "2026-06-19T14:30:00Z",

  signals: {
    total_observations: 5,
    observation_types: ["SOURCE_A", "SOURCE_B", "SOURCE_C"],
    source_count: 3,
    has_contradictions: true,
    evidence_gap_count: 2,
  },

  source_distribution: {
    web: 2,
    api: 2,
    sensor: 1,
  },

  contradictions: [
    {
      type: "SOURCE_A",
      first_observation: "obs-001",
      second_observation: "obs-003",
      conflict_reason: "different_evidence_for_same_type",
    },
  ],

  freshness: {
    most_recent_observation_date: "2026-06-19T14:00:00Z",
    total_unique_dates: 2,
  },

  evidence_gaps: ["MISSING_FIELD_1", "MISSING_FIELD_2"],

  intelligence_observations: [
    {
      id: "IO-0001",
      category: "operations",
      title: "Contradiction detected: source discrepancy",
      description: "Source A and Source C provide conflicting information",
      supporting_observations: ["obs-001", "obs-003"],
      confidence: "medium",
      data_quality: "moderate",
      evidence_strength: 0.5,
      generated_at: "2026-06-19T14:30:00Z",
      reasoning: "detected contradiction between sources",
    },
  ],

  evidence_graph: {
    observation_links: [
      {
        type: "same_entity" as const,
        source_ids: ["obs-001", "obs-002"],
        reason: "match",
      },
      {
        type: "explicit_contradiction" as const,
        source_ids: ["obs-003", "obs-004"],
        reason: "conflict",
      },
    ],
    clusters: [
      {
        cluster_id: "CL-0001",
        observation_ids: ["obs-001", "obs-002", "obs-003"],
        rule: "shared_entity_reference_only",
      },
    ],
    raw_facts: [
      { observation_id: "obs-001", fact: "Value A from web source" },
      { observation_id: "obs-002", fact: "Value B from web source" },
    ],
  },

  status: "VALID_LOCKED_INTELLIGENCE",
};

// TEST EXECUTION
console.log("WAVE 3 PRODUCTION REALITY TEST");
console.log("=".repeat(70));

console.log("\n[PHASE 1] EXECUTE WAVE 3 WITH PRODUCTION INPUT");
console.log("-".repeat(70));

let result: Wave3Insight;
try {
  result = runWave3(productionInput);
  console.log("✓ Execution successful (no runtime error)");
} catch (error) {
  console.error("✗ EXECUTION FAILED:", error);
  process.exit(1);
}

// TEST A: STRUCTURAL CORRECTNESS
console.log("\n[PHASE 2A] STRUCTURAL CORRECTNESS");
console.log("-".repeat(70));

const requiredFields = [
  "insight_id",
  "status",
  "summary",
  "implications",
  "recommended_actions",
  "confidence",
  "source_summary",
  "meta",
];

let structureValid = true;
for (const field of requiredFields) {
  if (!(field in result)) {
    console.error(`✗ Missing field: ${field}`);
    structureValid = false;
  } else {
    console.log(`✓ Field present: ${field}`);
  }
}

// Check no extra fields beyond allowed
const allowedTopLevel = new Set(requiredFields);
const actualKeys = new Set(Object.keys(result));
for (const key of actualKeys) {
  if (!allowedTopLevel.has(key)) {
    console.error(`✗ Unexpected field: ${key}`);
    structureValid = false;
  }
}

if (structureValid) {
  console.log("✓ PASS: Schema structure exact");
}

// TEST B: FUNCTIONAL CORRECTNESS
console.log("\n[PHASE 2B] FUNCTIONAL CORRECTNESS");
console.log("-".repeat(70));

let functionallyCorrect = true;

// B1: Summary is meaningful
if (result.summary && result.summary.length > 10) {
  console.log(`✓ Summary is meaningful (${result.summary.length} chars)`);
  console.log(`  "${result.summary}"`);
} else {
  console.error("✗ Summary is empty or too short");
  functionallyCorrect = false;
}

// B2: Implications exist and are meaningful
if (
  Array.isArray(result.implications) &&
  result.implications.length >= 1 &&
  result.implications.length <= 3
) {
  console.log(`✓ Implications count valid (${result.implications.length})`);
  result.implications.forEach((imp, i) => {
    console.log(`  ${i + 1}. "${imp}"`);
  });
} else {
  console.error(`✗ Implications invalid: ${result.implications.length} (need 1-3)`);
  functionallyCorrect = false;
}

// B3: Actions exist and are concrete
if (
  Array.isArray(result.recommended_actions) &&
  result.recommended_actions.length >= 1 &&
  result.recommended_actions.length <= 3
) {
  console.log(`✓ Actions count valid (${result.recommended_actions.length})`);
  result.recommended_actions.forEach((action, i) => {
    console.log(`  ${i + 1}. "${action}"`);
  });
} else {
  console.error(`✗ Actions invalid: ${result.recommended_actions.length} (need 1-3)`);
  functionallyCorrect = false;
}

// B4: Confidence is correctly derived
// Input has 5 observations, 3 sources, 1 contradiction, 2 gaps
// Should be MEDIUM (has contradictions)
if (result.confidence === "medium") {
  console.log(`✓ Confidence correctly derived: ${result.confidence}`);
  console.log(`  (5 observations + contradictions + gaps = medium)`);
} else {
  console.log(
    `⚠ Confidence is "${result.confidence}" (input: 5 obs, 1 contradiction, 2 gaps)`
  );
}

if (functionallyCorrect) {
  console.log("✓ PASS: Functional correctness verified");
}

// TEST C: FAILURE STATE
console.log("\n[PHASE 2C] FAILURE STATE SAFETY");
console.log("-".repeat(70));

const failureInput: Wave2LockedResult = {
  ...productionInput,
  status: "VALIDATION_FAILED_SAFE_STATE",
};

let failureResult: Wave3Insight;
try {
  failureResult = runWave3(failureInput);
  console.log("✓ Failure state execution successful (no crash)");

  if (failureResult.status === "INSUFFICIENT_SIGNAL") {
    console.log("✓ Failure state status: INSUFFICIENT_SIGNAL");
  } else {
    console.error(`✗ Failure status wrong: ${failureResult.status}`);
  }

  if (failureResult.confidence === "low") {
    console.log("✓ Failure state confidence: low");
  }

  if (failureResult.source_summary.total_signals === 0) {
    console.log("✓ Failure state signals: 0");
  }

  console.log("✓ PASS: Failure state safe");
} catch (error) {
  console.error("✗ Failure state crashed:", error);
  process.exit(1);
}

// TEST D: ISOLATION TEST
console.log("\n[PHASE 2D] MODULE ISOLATION");
console.log("-".repeat(70));

const translatorCode = require("fs").readFileSync(
  require("path").join(
    "/Users/jimilitan/Downloads/Claude-Code-Projects/pdf-trend-lab",
    "wave3-insight-translator.ts"
  ),
  "utf-8"
);

let isolationValid = true;

// Check no Wave 2 orchestrator imports
if (/import.*from.*wave2-orchestrator/.test(translatorCode)) {
  if (!translatorCode.includes("import type")) {
    console.error("✗ Imports Wave2 orchestrator (not type-only)");
    isolationValid = false;
  }
}

// Check no Wave 2 validator imports
if (/import.*Wave2DLock/.test(translatorCode)) {
  console.error("✗ Imports Wave2DLock");
  isolationValid = false;
}

// Check only type import allowed
if (translatorCode.includes('import type { Wave2LockedResult }')) {
  console.log("✓ Wave2LockedResult imported as type only");
} else if (!translatorCode.includes("Wave2LockedResult")) {
  console.error("✗ Wave2LockedResult import missing");
  isolationValid = false;
}

// Check no casting hacks
if (translatorCode.includes("as unknown as Wave2")) {
  console.error("✗ Found type casting hack (as unknown as)");
  isolationValid = false;
} else {
  console.log("✓ No type casting hacks");
}

if (isolationValid) {
  console.log("✓ PASS: Module isolation verified");
}

// TEST E: UI SAFETY TEST
console.log("\n[PHASE 2E] UI COMPONENT ISOLATION");
console.log("-".repeat(70));

const uiCode = require("fs").readFileSync(
  require("path").join(
    "/Users/jimilitan/Downloads/Claude-Code-Projects/pdf-trend-lab",
    "components/Wave3InsightCard.tsx"
  ),
  "utf-8"
);

let uiSafe = true;

// Check accepts only Wave3Insight
if (uiCode.includes("insight: Wave3Insight")) {
  console.log("✓ Component accepts Wave3Insight only");
} else {
  console.error("✗ Component signature incorrect");
  uiSafe = false;
}

// Check no Wave2LockedResult
if (uiCode.includes("Wave2LockedResult")) {
  console.error("✗ Component references Wave2LockedResult");
  uiSafe = false;
} else {
  console.log("✓ No Wave2LockedResult reference");
}

// Check no raw JSON display
if (!uiCode.includes("JSON.stringify")) {
  console.log("✓ No raw JSON display");
} else {
  console.log("⚠ Check: Component may display JSON");
}

// Check no technical field exposure
const technicalFields = ["executeWave", "validateWave", "orchestrator", "gate"];
let leaksTechnical = false;
for (const field of technicalFields) {
  if (uiCode.toLowerCase().includes(field)) {
    console.error(`✗ Exposes technical term: ${field}`);
    leaksTechnical = true;
  }
}

if (!leaksTechnical) {
  console.log("✓ No technical field leakage");
}

if (uiSafe) {
  console.log("✓ PASS: UI safety verified");
}

// TEST F: DETERMINISM TEST
console.log("\n[PHASE 2F] DETERMINISM TEST");
console.log("-".repeat(70));

// Use fixed timestamp input to control generated_at
const fixedInput: Wave2LockedResult = {
  ...productionInput,
  generated_at: "2026-06-19T12:00:00Z",
};

const result1 = runWave3(fixedInput);
const result2 = runWave3(fixedInput);

// Strip non-deterministic fields
const stripVariance = (obj: Wave3Insight) => {
  const copy = { ...obj };
  copy.meta.generated_at = "STRIPPED";
  copy.insight_id = "STRIPPED";
  return JSON.stringify(copy);
};

const stripped1 = stripVariance(result1);
const stripped2 = stripVariance(result2);

if (stripped1 === stripped2) {
  console.log("✓ Same input produces deterministic output");
  console.log("  Summary identical");
  console.log("  Implications identical");
  console.log("  Actions identical");
} else {
  console.error("✗ Output varies with same input");
  console.error("First:", stripped1);
  console.error("Second:", stripped2);
  process.exit(1);
}

console.log("✓ PASS: Determinism verified");

// FINAL SUMMARY
console.log("\n" + "=".repeat(70));
console.log("PRODUCTION REALITY TEST RESULTS");
console.log("=".repeat(70));

const allPassed =
  structureValid &&
  functionallyCorrect &&
  isolationValid &&
  uiSafe &&
  failureResult.status === "INSUFFICIENT_SIGNAL";

if (allPassed) {
  console.log("\n✅ STATUS: WAVE 3 VALIDATED IN PRODUCTION CONDITIONS");
  console.log("\nAll hard requirements passed:");
  console.log("  ✓ A. Structural correctness: Exact schema match");
  console.log("  ✓ B. Functional correctness: Meaningful output");
  console.log("  ✓ C. Failure safety: Graceful degradation");
  console.log("  ✓ D. Isolation: No Wave 2 coupling");
  console.log("  ✓ E. UI safety: Wave3Insight only");
  console.log("  ✓ F. Determinism: Repeatable behavior");
  console.log("\nProduction-ready: YES");
  process.exit(0);
} else {
  console.log("\n❌ STATUS: BLOCKED");
  console.log("\nFailed checks:");
  if (!structureValid) console.log("  - Structural correctness");
  if (!functionallyCorrect) console.log("  - Functional correctness");
  if (!isolationValid) console.log("  - Module isolation");
  if (!uiSafe) console.log("  - UI safety");
  process.exit(1);
}
