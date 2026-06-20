/**
 * PSYCHOLOGY VALIDATOR - Wave 1 (Minimal)
 *
 * Checks if email contains all required RRAT components.
 * Wave 1: Simple presence checks
 * Wave 4: Full Humanity Score with 10 components
 *
 * This validator gates email quality before sending.
 * Fails email if any required component is missing or too generic.
 */

export interface ValidationResult {
  pass: boolean;
  score: number;
  components: {
    recognition_present: boolean;
    relief_present: boolean;
    trust_present: boolean;
    action_present: boolean;
  };
  failed_rules: string[];
  reason?: string;
}

const AI_CLICHÉS = [
  "in today's",
  "as technology evolves",
  "it is important to note",
  "in an increasingly",
  "whether you're",
  "imagine a world",
  "as we move forward",
  "in conclusion",
  "ultimately",
  "the key takeaway",
  "overall",
  "in summary",
];

const BANNED_WORDS = [
  "leverage",
  "empower",
  "optimize",
  "synergy",
  "holistic",
  "transformative",
  "robust",
  "innovative",
  "cutting-edge",
  "game-changing",
  "seamless",
  "best-in-class",
  "world-class",
  "end-to-end",
];

export function validatePsychologyEmail(email: string): ValidationResult {
  const lower = email.toLowerCase();
  const failed_rules: string[] = [];
  let score = 10;

  // Check for AI clichés (hard fail on presence)
  const hasCliche = AI_CLICHÉS.some((phrase) => lower.includes(phrase));
  if (hasCliche) {
    failed_rules.push("AI_CLICHE_DETECTED");
    score -= 2;
  }

  // Check for banned corporate words (penalty per word)
  const bannedWordsFound = BANNED_WORDS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(email)
  );
  if (bannedWordsFound.length > 0) {
    failed_rules.push(`CORPORATE_LANGUAGE: ${bannedWordsFound.join(", ")}`);
    score -= bannedWordsFound.length * 0.5;
  }

  // Check for RRAT components
  const recognition_present = email.includes("One thing") || email.includes("I noticed") || email.includes("stood out");
  const relief_present = email.includes("probably") || email.includes("familiar") || email.includes("spending");
  const trust_present = email.includes("process") || email.includes("handled") || email.includes("built");
  const action_present = email.includes("?") && !email.includes("call me");

  if (!recognition_present) {
    failed_rules.push("RECOGNITION_MISSING");
    score -= 2;
  }

  if (!relief_present) {
    failed_rules.push("RELIEF_MISSING");
    score -= 2;
  }

  if (!trust_present) {
    failed_rules.push("TRUST_MISSING");
    score -= 1.5;
  }

  if (!action_present) {
    failed_rules.push("ACTION_MISSING");
    score -= 1.5;
  }

  // Check for generic template phrases
  if (email.includes("we can help") || email.includes("let me know") || email.includes("reach out")) {
    failed_rules.push("GENERIC_CTA");
    score -= 1;
  }

  // Ensure email has reasonable length (too short = incomplete)
  if (email.length < 100) {
    failed_rules.push("EMAIL_TOO_SHORT");
    score -= 1;
  }

  const pass = score >= 7 && failed_rules.length === 0;

  return {
    pass,
    score: Math.max(0, score),
    components: {
      recognition_present,
      relief_present,
      trust_present,
      action_present,
    },
    failed_rules,
    reason: failed_rules.length > 0 ? failed_rules.join("; ") : undefined,
  };
}

/**
 * Simple assessment: Does this email pass the "understood vs informed" test?
 * PASS: Prospect feels understood (specific observation, acknowledged burden)
 * FAIL: Prospect feels analyzed (generic statements, corporate language)
 */
export function passesUnderstoodTest(email: string): boolean {
  const validation = validatePsychologyEmail(email);

  // Must have recognition + relief + action (trust is secondary in Wave 1)
  const hasCoreComponents =
    validation.components.recognition_present &&
    validation.components.relief_present &&
    validation.components.action_present;

  const noFatalFlaws =
    !validation.failed_rules.includes("AI_CLICHE_DETECTED") &&
    validation.failed_rules.filter((r) => r.includes("CORPORATE_LANGUAGE")).length === 0;

  return hasCoreComponents && noFatalFlaws;
}
