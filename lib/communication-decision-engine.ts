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
import {
  generatePermissionSentence,
  generateRecognitionSentence,
  generateTrustSignal,
  generateCTA,
  calculateSentencePD,
} from "./sentence-generator";

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
 * Generate email using dialogue blueprint + Permission line
 */
export function generateEmailWithPD(reasoning: RelationshipReasoning): EmailWithPD {
  const stage = reasoning.relationshipStage.current;
  const industry = reasoning.businessAnalysis.industry;
  const location = reasoning.businessAnalysis.location;
  const dialogue = reasoning.internalDialogue;

  const sentences: SentenceWithPD[] = [];
  let emailBody = "";

  // STAGE 1: Start with Permission line
  if (stage === 1) {
    const permissionSentence = generatePermissionSentence(industry, location);
    const pdScore = calculateSentencePD(permissionSentence);

    sentences.push({
      text: permissionSentence,
      pdScore,
      psychologicalFunctions: ["grants-permission", "removes-resistance", "shows-respect"],
      shouldInclude: pdScore > 1,
      reasoning: "Permission line - gives reader permission to ignore if not relevant",
    });

    if (pdScore > 1) {
      emailBody += permissionSentence + "\n\n";
    }
  }

  // Recognition moment (all stages)
  const recognitionSentence = generateRecognitionSentence(industry, location);
  const recognitionPD = calculateSentencePD(recognitionSentence);

  sentences.push({
    text: recognitionSentence,
    pdScore: recognitionPD,
    psychologicalFunctions: ["builds-relevance", "shows-observation", "creates-recognition"],
    shouldInclude: recognitionPD > 1,
    reasoning: "Recognition - shows what they experience, lets them see themselves",
  });

  if (recognitionPD > 1) {
    emailBody += recognitionSentence + "\n\n";
  }

  // Trust signal (all stages)
  const trustSentence = generateTrustSignal(industry, location);
  const trustPD = calculateSentencePD(trustSentence);

  sentences.push({
    text: trustSentence,
    pdScore: trustPD,
    psychologicalFunctions: ["shows-behavior", "signals-honesty", "builds-confidence"],
    shouldInclude: trustPD > 1,
    reasoning: "Trust signal - shows what we do, not why we're good",
  });

  if (trustPD > 1) {
    emailBody += trustSentence + "\n\n";
  }

  // Micro commitment (CTA)
  const ctaSentence = generateCTA(stage);
  const ctaPD = calculateSentencePD(ctaSentence);

  sentences.push({
    text: ctaSentence,
    pdScore: ctaPD,
    psychologicalFunctions: ["invites-participation", "forces-decision", "removes-friction"],
    shouldInclude: ctaPD > 0,
    reasoning: "CTA - binary choice, reader has agency",
  });

  if (ctaPD > 0) {
    emailBody += ctaSentence + "\n\n";
  }

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
 * Generate subject line - simple, specific
 */
function generateSubjectLine(stage: number, industry: string): string {
  const subjects: Record<number, Record<string, string>> = {
    1: {
      default: "Your delivery backup.",
      "law-firm": "For Friday night filings.",
      ecommerce: "Your October overflow.",
      logistics: "When your routes are full.",
      restaurant: "For Friday night supply runs.",
      retail: "Monday morning stock.",
      healthcare: "Temperature-controlled backup.",
      manufacturing: "Parts on time.",
    },
    2: {
      default: "Next steps.",
      "law-firm": "You asked about backup.",
      ecommerce: "Ready when you are.",
      logistics: "Overflow capacity available.",
    },
    3: {
      default: "Let's test it.",
      "law-firm": "First delivery ready.",
      ecommerce: "First order live.",
    },
  };

  const stageSubjects = subjects[stage] || subjects[1];
  return stageSubjects[industry.toLowerCase()] || stageSubjects["default"] || "Saint & Story";
}
