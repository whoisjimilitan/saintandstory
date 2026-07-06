import { PROBLEMS_MAP, getProblemType } from "./problems-map";

/**
 * Psychology Analysis — Structured output from Claude before brief generation.
 *
 * This is NOT the brief. This is the ANALYSIS that informs the brief.
 * The brief writer uses this to embed psychology invisibly in human language.
 */
export interface PsychologyAnalysis {
  problem_type: string;
  inverse_incentive: string;
  loss_aversion_frame: string;
  authority_proof: string;
  social_proof: string;
  urgency_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  confidence: number;
}

/**
 * Analyze psychology from confession + problem type.
 *
 * This function takes the extracted problem and the confession context,
 * then outputs structured psychology analysis that the brief writer will use.
 *
 * INPUT: Confession text + problem type + context
 * OUTPUT: Psychology analysis (structured)
 */
export function analyzePsychology(input: {
  confession_text: string;
  problem_type: string;
  company_name?: string;
  location?: string;
  context?: string;
}): PsychologyAnalysis | null {
  const problemDef = getProblemType(input.problem_type);
  if (!problemDef) return null;

  const confessionLower = input.confession_text.toLowerCase();

  // Determine urgency level from confession signals
  const urgencySignals = {
    CRITICAL: [
      "urgent",
      "emergency",
      "now",
      "immediately",
      "today",
      "asap",
      "critical",
      "failing",
      "broken",
      "lawsuit",
      "losing money"
    ],
    HIGH: [
      "struggling",
      "problem",
      "issue",
      "need",
      "can't",
      "unable",
      "frustrated",
      "constantly",
      "every day"
    ],
    MEDIUM: ["looking for", "interested", "considering", "trying to find", "help"],
    LOW: ["curious", "wondering", "exploring", "might be", "could use"]
  };

  let urgencyLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
  let urgencyScore = 0;

  for (const signal of urgencySignals.CRITICAL) {
    if (confessionLower.includes(signal)) {
      urgencyLevel = "CRITICAL";
      urgencyScore = 0.95;
      break;
    }
  }

  if (urgencyLevel === "MEDIUM") {
    for (const signal of urgencySignals.HIGH) {
      if (confessionLower.includes(signal)) {
        urgencyLevel = "HIGH";
        urgencyScore = 0.75;
        break;
      }
    }
  }

  if (urgencyLevel === "MEDIUM") {
    for (const signal of urgencySignals.MEDIUM) {
      if (confessionLower.includes(signal)) {
        urgencyScore = 0.65;
        break;
      }
    }
  }

  if (urgencyLevel === "MEDIUM") {
    for (const signal of urgencySignals.LOW) {
      if (confessionLower.includes(signal)) {
        urgencyLevel = "LOW";
        urgencyScore = 0.45;
        break;
      }
    }
  }

  // Build psychology analysis using problem definition + confession context
  const analysis: PsychologyAnalysis = {
    problem_type: input.problem_type,

    // INVERSE INCENTIVE: What specifically breaks if they don't solve this?
    // Taken from problem definition, adapted by urgency
    inverse_incentive: problemDef.inverse_incentive,

    // LOSS AVERSION: What do they lose daily right now?
    // Combines problem definition with confession signals
    loss_aversion_frame: buildLossAversion(
      problemDef.loss_aversion_daily,
      confessionLower,
      input.company_name
    ),

    // AUTHORITY: Where can we prove understanding?
    // Problem definition demonstrates industry knowledge
    authority_proof: problemDef.authority_proof,

    // SOCIAL PROOF: Why is this solvable?
    // Implied by the confession itself: others have posted about this too
    social_proof:
      "The fact that you're posting about this means others in your world are experiencing it too.",

    // URGENCY: How time-sensitive is this?
    urgency_level: urgencyLevel,

    // CONFIDENCE: How confident are we in this analysis?
    // Higher confidence if urgency is clear + problem matches keywords
    confidence: urgencyScore
  };

  return analysis;
}

/**
 * Build loss aversion frame combining problem definition + confession signals.
 *
 * This makes the gap feel REAL and COSTLY.
 */
function buildLossAversion(
  baseFrame: string,
  confessionLower: string,
  companyName?: string
): string {
  let frame = baseFrame;

  // If they mention time/resources, emphasize those
  if (
    confessionLower.includes("time") ||
    confessionLower.includes("hours") ||
    confessionLower.includes("hours")
  ) {
    frame = `Hours spent managing what should be reliable. ${frame}`;
  }

  // If they mention team/staff, emphasize human cost
  if (
    confessionLower.includes("team") ||
    confessionLower.includes("staff") ||
    confessionLower.includes("crew")
  ) {
    frame = `Your team's frustration with unreliable processes. ${frame}`;
  }

  // If they mention reputation/customers, emphasize relationship risk
  if (
    confessionLower.includes("customers") ||
    confessionLower.includes("clients") ||
    confessionLower.includes("reputation")
  ) {
    frame = `Reputation risk with every delivery that slips. ${frame}`;
  }

  // If they mention money/revenue, emphasize financial impact
  if (confessionLower.includes("revenue") || confessionLower.includes("cost")) {
    frame = `Real money lost every day this gap exists. ${frame}`;
  }

  if (companyName) {
    frame = `At ${companyName}, ${frame.charAt(0).toLowerCase()}${frame.slice(1)}`;
  }

  return frame;
}

/**
 * Calculate confidence score for routing decision.
 *
 * Combines:
 * - Psychology analysis confidence (urgency clarity)
 * - Problem match strength (keyword matching score)
 * - Contact info completeness
 *
 * Returns 0.4 - 0.95
 */
export function calculateConfidence(input: {
  psychology: PsychologyAnalysis;
  contact_info_completeness: number; // 0 = nothing, 1 = email + name + company
  keyword_match_strength: number; // 0 = weak, 1 = multiple strong matches
}): number {
  const psychologyWeight = 0.5;
  const contactWeight = 0.3;
  const keywordWeight = 0.2;

  const score =
    input.psychology.confidence * psychologyWeight +
    input.contact_info_completeness * contactWeight +
    input.keyword_match_strength * keywordWeight;

  // Clamp between 0.4 and 0.95
  return Math.max(0.4, Math.min(0.95, score));
}

/**
 * Determine routing tier based on problem + confidence.
 *
 * AUTO_SEND: Tier 1 + confidence >= 0.80
 * APPROVAL_QUEUE: (Tier 1 + confidence 0.60-0.79) OR (Tier 2 + confidence >= 0.70)
 * BATCH: Tier 3 + confidence >= 0.60
 * DISCARD: Below minimum confidence for tier
 */
export function determineRoute(input: {
  problem_tier: 1 | 2 | 3;
  confidence: number;
}): "AUTO_SEND" | "APPROVAL_QUEUE" | "BATCH" | "DISCARD" {
  const { problem_tier, confidence } = input;

  if (problem_tier === 1) {
    if (confidence >= 0.8) return "AUTO_SEND";
    if (confidence >= 0.6) return "APPROVAL_QUEUE";
    return "DISCARD";
  }

  if (problem_tier === 2) {
    if (confidence >= 0.7) return "APPROVAL_QUEUE";
    return "DISCARD";
  }

  // Tier 3
  if (confidence >= 0.6) return "BATCH";
  return "DISCARD";
}
