/**
 * COMMUNICATION DECISION ENGINE
 *
 * Generates emails optimized for Psychological Density (PD), not brevity.
 *
 * Uses:
 * 1. Internal dialogue prediction (BLUEPRINT)
 * 2. Permission line (Stage 1 only)
 * 3. PD scoring (objective function)
 * 4. Behavioral pattern understanding (industry/location context)
 *
 * Process:
 * 1. Start with dialogue blueprint (what reader is thinking)
 * 2. Generate sentences that manifest those thoughts
 * 3. Score each sentence for Psychological Density
 * 4. Delete any sentence performing only one function
 * 5. Output email that guides reader through predicted sequence
 *
 * Success: Reader follows predicted internal dialogue naturally.
 */

import type { RelationshipReasoning } from "./business-relationship-engine";
import type { InternalDialogue } from "./internal-dialogue-predictor";

export interface SentenceWithPD {
  text: string;
  pdScore: number;
  psychologicalFunctions: string[];
  shouldInclude: boolean; // Only include if PD > 1
  reasoning: string;
}

export interface EmailWithPD {
  subject: string;
  body: string;
  pdMetadata: {
    averagePD: number;
    minPD: number;
    maxPD: number;
    totalFunctions: number;
    sentenceCount: number;
    qualityRating: "high" | "medium" | "low";
  };
  sentences: SentenceWithPD[];
}

/**
 * Score a sentence for Psychological Density
 *
 * Emergent reasoning - evaluates context and psychological functions
 */
function scoreSentencePD(
  sentence: string,
  context: {
    stage: number;
    industry: string;
    moment?: string;
    priorThoughts?: string;
  }
): { score: number; functions: string[] } {
  const functions: string[] = [];

  // Analyze what psychological work this sentence does
  const lowerSentence = sentence.toLowerCase();

  // Check for various psychological functions
  if (
    lowerSentence.includes("if ") ||
    lowerSentence.includes("but ") ||
    lowerSentence.includes("though")
  ) {
    functions.push("creates-expectation-violation");
  }

  if (
    lowerSentence.includes("you") ||
    lowerSentence.includes("your") ||
    lowerSentence.includes("happened")
  ) {
    functions.push("builds-relevance");
  }

  if (
    lowerSentence.includes("actually") ||
    lowerSentence.includes("really") ||
    lowerSentence.includes("already")
  ) {
    functions.push("signals-honesty");
  }

  if (
    lowerSentence.includes("don't") ||
    lowerSentence.includes("isn't") ||
    lowerSentence.includes("haven't")
  ) {
    functions.push("removes-objection");
  }

  if (sentence.length < 30 && sentence.includes(".")) {
    functions.push("creates-emphasis");
  }

  if (
    lowerSentence.includes("when ") ||
    lowerSentence.includes("while ") ||
    lowerSentence.includes("because")
  ) {
    functions.push("builds-scenario");
  }

  if (
    lowerSentence.includes("we") ||
    lowerSentence.includes("similar") ||
    lowerSentence.includes("like you")
  ) {
    functions.push("creates-common-ground");
  }

  if (
    lowerSentence.includes("question") ||
    lowerSentence.includes("?") ||
    lowerSentence.includes("explore")
  ) {
    functions.push("invites-participation");
  }

  if (
    lowerSentence.includes("no ") ||
    lowerSentence.includes("stop") ||
    lowerSentence.includes("don't read")
  ) {
    functions.push("grants-permission");
  }

  if (sentence.includes("ready") || sentence.includes("next")) {
    functions.push("signals-readiness");
  }

  // Calculate PD score based on function count
  // Higher function count = higher psychological density
  const score = Math.min(functions.length, 8); // Cap at 8 (maximum realistic PD)

  return { score, functions };
}

/**
 * Generate email using dialogue blueprint + Permission line
 */
export function generateEmailWithPD(reasoning: RelationshipReasoning): EmailWithPD {
  const stage = reasoning.relationshipStage.current;
  const industry = reasoning.businessAnalysis.industry;
  const dialogue = reasoning.internalDialogue;
  const permissionLine = reasoning.permissionLine;

  const sentences: SentenceWithPD[] = [];
  let emailBody = "";

  // STAGE 1: Start with Permission line
  if (stage === 1 && permissionLine) {
    const pdAnalysis = scoreSentencePD(permissionLine.text, {
      stage,
      industry,
      moment: "permission",
    });

    sentences.push({
      text: permissionLine.text,
      pdScore: pdAnalysis.score,
      psychologicalFunctions: pdAnalysis.functions,
      shouldInclude: pdAnalysis.score > 0,
      reasoning: "Permission line - removes resistance before engagement",
    });

    emailBody += permissionLine.text + "\n\n";
  }

  // STAGE 1: Recognition moment
  if (stage === 1) {
    const recognitionSentence = generateRecognitionSentence(industry);
    const pdAnalysis = scoreSentencePD(recognitionSentence, {
      stage,
      industry,
      moment: "recognition",
    });

    sentences.push({
      text: recognitionSentence,
      pdScore: pdAnalysis.score,
      psychologicalFunctions: pdAnalysis.functions,
      shouldInclude: pdAnalysis.score > 1,
      reasoning: "Recognition moment - reader realizes sender understands their situation",
    });

    if (pdAnalysis.score > 1) {
      emailBody += recognitionSentence + "\n\n";
    }
  }

  // STAGE 1: Trust signal
  if (stage === 1) {
    const trustSentence = generateTrustSignal(reasoning.trustStrategy.trustSignal);
    const pdAnalysis = scoreSentencePD(trustSentence, {
      stage,
      industry,
      moment: "trust",
    });

    sentences.push({
      text: trustSentence,
      pdScore: pdAnalysis.score,
      psychologicalFunctions: pdAnalysis.functions,
      shouldInclude: pdAnalysis.score > 1,
      reasoning: "Trust signal - demonstrates credibility through observation",
    });

    if (pdAnalysis.score > 1) {
      emailBody += trustSentence + "\n\n";
    }
  }

  // Micro commitment
  const ctaSentence = generateCTA(
    reasoning.microCommitment.ask,
    reasoning.microCommitment.responseOptions,
    stage
  );
  const pdAnalysis = scoreSentencePD(ctaSentence, {
    stage,
    industry,
    moment: "commitment",
  });

  sentences.push({
    text: ctaSentence,
    pdScore: pdAnalysis.score,
    psychologicalFunctions: pdAnalysis.functions,
    shouldInclude: pdAnalysis.score > 0,
    reasoning: "Micro commitment - smallest ask possible, reader feels agency",
  });

  emailBody += ctaSentence + "\n\n";

  // Calculate metadata
  const includedSentences = sentences.filter((s) => s.shouldInclude);
  const totalPD = includedSentences.reduce((sum, s) => sum + s.pdScore, 0);
  const averagePD = includedSentences.length > 0 ? totalPD / includedSentences.length : 0;
  const totalFunctions = includedSentences.reduce((sum, s) => sum + s.psychologicalFunctions.length, 0);

  const qualityRating =
    averagePD >= 4 ? ("high" as const) :
    averagePD >= 2 ? ("medium" as const) :
    ("low" as const);

  // Generate subject
  const subject = generateSubjectLine(stage, industry);

  // Build final email with sender signature
  const finalBody = emailBody.trim() + "\n\nBest,\n{{senderName}}\nSaint & Story";

  return {
    subject,
    body: finalBody,
    pdMetadata: {
      averagePD: Number(averagePD.toFixed(2)),
      minPD: Math.min(...includedSentences.map((s) => s.pdScore)),
      maxPD: Math.max(...includedSentences.map((s) => s.pdScore)),
      totalFunctions,
      sentenceCount: includedSentences.length,
      qualityRating,
    },
    sentences: includedSentences,
  };
}

/**
 * Generate recognition sentence based on industry
 */
function generateRecognitionSentence(industry: string): string {
  const recognitionMap: Record<string, string> = {
    "law-firm": "You're probably handling urgent filings that your primary courier can't accommodate fast enough.",
    ecommerce: "Peak season probably pushes your main courier past capacity.",
    healthcare: "Temperature-controlled deliveries likely need backup when volume spikes.",
    manufacturing: "Your production timeline probably depends on delivery reliability.",
    logistics: "You're probably turning down work when your routes hit capacity.",
    retail: "Your stores probably run short on supplies during busy periods.",
    restaurant: "Your kitchen probably improvises when ingredient deliveries get tight.",
    "professional-services": "Your clients probably expect delivery reliability you can't always guarantee alone.",
  };

  return (
    recognitionMap[industry.toLowerCase()] ||
    "You probably experience delivery pressure we could relieve."
  );
}

/**
 * Generate trust signal
 */
function generateTrustSignal(signal: string): string {
  // Use the trust signal from reasoning, make it conversational
  return `We've worked with businesses like yours. ${signal}`;
}

/**
 * Generate CTA based on stage and response options
 */
function generateCTA(ask: string, options: string[], stage: number): string {
  if (stage === 1) {
    return `Reply with: ${options.join(", or ")}.`;
  } else if (stage === 2) {
    return `${ask}`;
  } else {
    return `${ask}`;
  }
}

/**
 * Generate subject line
 */
function generateSubjectLine(stage: number, industry: string): string {
  const subjects: Record<number, Record<string, string>> = {
    1: {
      default: "When capacity becomes the constraint",
      "law-firm": "For urgent filing deadlines",
      ecommerce: "When peak season hits capacity",
      logistics: "When routes go over capacity",
    },
    2: {
      default: "Next steps for your delivery",
      "law-firm": "Your backup is ready",
      ecommerce: "Overflow capacity is live",
    },
    3: {
      default: "Your first delivery",
      "law-firm": "Let's prove ourselves",
      ecommerce: "First order ready",
    },
  };

  const stageSubjects = subjects[stage] || subjects[1];
  return stageSubjects[industry.toLowerCase()] || stageSubjects["default"] || "Saint & Story";
}
