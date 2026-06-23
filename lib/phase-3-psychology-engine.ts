/**
 * PHASE 3: PSYCHOLOGY ENGINE
 *
 * Detects psychological patterns in business relationships
 * Reframes strategy through psychological lens
 * Generates recommendations that address THE PERSON not just the deal
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";

export type PsychologicalPattern =
  | "loss-aversion"
  | "status-quo-bias"
  | "decision-fatigue"
  | "risk-transfer"
  | "political-incentive"
  | "social-proof";

export interface PsychologicalFinding {
  pattern: PsychologicalPattern;
  detected: boolean;
  confidence: number; // 0-100
  evidence: string[];
  implication: string;
  recommendation: string;
  psychologicalReasoning: string;
}

export interface PsychologyAnalysis {
  patterns: PsychologicalFinding[];
  dominantPattern: PsychologicalPattern | null;
  psychologicalProfile: string;
  reframedStrategy: string;
  psychologicalRecommendations: string[];
  championBlockerDynamics: {
    identified: boolean;
    champions: string[];
    blockers: string[];
    conflictReason: string;
  };
}

/**
 * DETECT LOSS AVERSION
 * People fear losing what they have
 */
export function detectLossAversion(
  intelligence: RelationshipIntelligenceObject
): PsychologicalFinding {
  const evidence: string[] = [];
  let confidence = 0;

  // Sign 1: They already have working solution
  if (
    intelligence.relationshipModel.confidenceInSolution < 30 &&
    intelligence.reasoning.alternativeTheyMayHave.length > 0
  ) {
    evidence.push("Current solution works fine (not broken)");
    confidence += 30;
  }

  // Sign 2: Low urgency despite pain
  if (
    intelligence.relationshipModel.urgency.level === "medium" &&
    intelligence.relationshipModel.currentStage < 2
  ) {
    evidence.push("Pain exists but no urgency to change");
    confidence += 25;
  }

  // Sign 3: Silence after initial contact
  if (intelligence.relationshipModel.relationshipMomentum.direction === "stalled") {
    evidence.push("Initial interest faded (decision fatigue)");
    confidence += 20;
  }

  return {
    pattern: "loss-aversion",
    detected: confidence > 40,
    confidence: Math.min(100, confidence),
    evidence,
    implication: "Prospect fears switching risk exceeds gain potential",
    recommendation:
      "Position as complement, not replacement. Offer low-risk pilot. Guarantee reversibility.",
    psychologicalReasoning:
      "Loss aversion = people weight losses 2x higher than gains. If current solution works, loss (switching risk) > gain (improvement). Solution: make perceived loss smaller.",
  };
}

/**
 * DETECT STATUS QUO BIAS
 * Inertia is powerful. People do what they've always done.
 */
export function detectStatusQuoBias(
  intelligence: RelationshipIntelligenceObject
): PsychologicalFinding {
  const evidence: string[] = [];
  let confidence = 0;

  // Sign 1: No growth signals + comfortable current state
  if (
    intelligence.facts.observedIndicators.length < 3 &&
    intelligence.relationshipModel.urgency.level === "medium"
  ) {
    evidence.push("Stable business, no external pressure to change");
    confidence += 35;
  }

  // Sign 2: Small company
  if (intelligence.facts.businessSize === "small") {
    evidence.push("Small business = reactive not strategic");
    confidence += 25;
  }

  // Sign 3: Comfortable with current solution
  if (intelligence.relationshipModel.relationshipMomentum.direction === "steady") {
    evidence.push("Status quo maintained, no momentum for change");
    confidence += 30;
  }

  return {
    pattern: "status-quo-bias",
    detected: confidence > 50,
    confidence: Math.min(100, confidence),
    evidence,
    implication: "Prospect has no internal motivation to change",
    recommendation:
      "Don't force urgency. Wait for their pain point. Build relationship now, activate later.",
    psychologicalReasoning:
      "Status quo bias = cost of change feels higher than cost of staying same. Solution: wait for external catalyst (budget cycle, growth, staffing change) that forces evaluation.",
  };
}

/**
 * DETECT DECISION FATIGUE
 * Tired people avoid decisions
 */
export function detectDecisionFatigue(
  intelligence: RelationshipIntelligenceObject
): PsychologicalFinding {
  const evidence: string[] = [];
  let confidence = 0;

  // Sign 1: Stakeholders overwhelmed (busy, growing, new hires)
  if (intelligence.facts.observedIndicators.some((ind) =>
    ind.indicator.toLowerCase().includes("new hire") ||
    ind.indicator.toLowerCase().includes("expand") ||
    ind.indicator.toLowerCase().includes("launch")
  )) {
    evidence.push("Stakeholders occupied with major initiatives");
    confidence += 35;
  }

  // Sign 2: Multiple competing priorities
  if (intelligence.relationshipModel.businessPain.secondaryPains.length > 2) {
    evidence.push("Multiple pain points = cognitive overload");
    confidence += 30;
  }

  // Sign 3: Interest then silence (decision avoidance)
  if (intelligence.relationshipModel.relationshipMomentum.daysSinceLastSignal > 10) {
    evidence.push("Engagement faded (avoiding the decision)");
    confidence += 25;
  }

  return {
    pattern: "decision-fatigue",
    detected: confidence > 45,
    confidence: Math.min(100, confidence),
    evidence,
    implication: "Prospect overwhelmed, avoiding decision-making",
    recommendation:
      "Remove cognitive load. Send one-page summary. Pre-make decision for them. Make yes as easy as silence.",
    psychologicalReasoning:
      "Decision fatigue = people avoid choices when overwhelmed. Solution: reduce options, pre-decide, make acceptance the default.",
  };
}

/**
 * DETECT RISK TRANSFER
 * Decision maker has career risk if this fails
 */
export function detectRiskTransfer(
  intelligence: RelationshipIntelligenceObject
): PsychologicalFinding {
  const evidence: string[] = [];
  let confidence = 0;

  // Sign 1: Large company, formal processes
  if (
    intelligence.facts.businessSize === "large" &&
    intelligence.relationshipModel.buyingCommittee.identified
  ) {
    evidence.push("Large org = career risk for decision maker");
    confidence += 30;
  }

  // Sign 2: Procurement or formal approval needed
  if (intelligence.relationshipModel.buyingCommittee.members.length > 2) {
    evidence.push("Multiple approval layers = personal risk");
    confidence += 35;
  }

  // Sign 3: Interest but approval delays
  if (
    intelligence.relationshipModel.currentStage === 2 &&
    intelligence.relationshipModel.relationshipMomentum.confidence < 60
  ) {
    evidence.push("Interest exists but approval slow (risk concern)");
    confidence += 30;
  }

  return {
    pattern: "risk-transfer",
    detected: confidence > 45,
    confidence: Math.min(100, confidence),
    evidence,
    implication: "Decision maker afraid of career risk if implementation fails",
    recommendation:
      "Offer fixed-price guarantee. Case studies. Implementation support. Make them look good.",
    psychologicalReasoning:
      "Risk transfer = decision maker wants provider to take implementation risk. Solution: insurance, guarantees, references, implementation support.",
  };
}

/**
 * DETECT POLITICAL INCENTIVES
 * People are incentivized by their role's goals
 */
export function detectPoliticalIncentives(
  intelligence: RelationshipIntelligenceObject
): PsychologicalFinding {
  const evidence: string[] = [];
  let confidence = 0;

  // Sign 1: Multi-stakeholder with different incentives
  if (intelligence.relationshipModel.buyingCommittee.members.length > 2) {
    evidence.push("Multiple stakeholders with different goals");
    confidence += 40;
  }

  // Sign 2: Conflict between champion and others
  if (
    intelligence.relationshipModel.buyingCommittee.blockers &&
    intelligence.relationshipModel.buyingCommittee.blockers.length > 0
  ) {
    evidence.push("Political conflict: blockers vs champions");
    confidence += 40;
  }

  // Sign 3: Large enterprise
  if (intelligence.facts.businessSize === "large") {
    evidence.push("Enterprise = high political complexity");
    confidence += 30;
  }

  return {
    pattern: "political-incentive",
    detected: confidence > 50,
    confidence: Math.min(100, confidence),
    evidence,
    implication:
      "Different stakeholders motivated by different goals (cost/risk/ROI/integration)",
    recommendation:
      "Give each stakeholder what proves value to THEM. CEO needs ROI case. CFO needs cost certainty. CTO needs integration ease.",
    psychologicalReasoning:
      "Political incentives = people evaluate based on role. CFO cares about cost, CEO about ROI, COO about risk. Solution: multi-stakeholder strategy.",
  };
}

/**
 * DETECT SOCIAL PROOF
 * People follow what others do
 */
export function detectSocialProof(
  intelligence: RelationshipIntelligenceObject
): PsychologicalFinding {
  const evidence: string[] = [];
  let confidence = 0;

  // Sign 1: Industry-specific pain (common in sector)
  if (intelligence.facts.observedIndicators.length > 2) {
    evidence.push("Industry-specific challenge (others face same)");
    confidence += 35;
  }

  // Sign 2: Regulatory/compliance requirements
  if (
    intelligence.facts.industry === "Healthcare" ||
    intelligence.facts.industry === "Financial Services"
  ) {
    evidence.push("Industry compliance = social proof valuable");
    confidence += 40;
  }

  // Sign 3: Growth signals (following competitor moves)
  if (intelligence.reasoning.alternativeTheyMayHave.length > 1) {
    evidence.push("Competitive landscape = others using similar solutions");
    confidence += 25;
  }

  return {
    pattern: "social-proof",
    detected: confidence > 50,
    confidence: Math.min(100, confidence),
    evidence,
    implication: "Prospect will evaluate based on what competitors/peers do",
    recommendation:
      "Show what similar companies do. Case studies from sector. Industry reports. Peer adoption.",
    psychologicalReasoning:
      "Social proof = people follow the herd. If peers adopted, feels safer. Solution: case studies, industry reports, peer references.",
  };
}

/**
 * ANALYZE FULL PSYCHOLOGY
 */
export function analyzePsychology(
  intelligence: RelationshipIntelligenceObject
): PsychologyAnalysis {
  // Detect all patterns
  const patterns: PsychologicalFinding[] = [
    detectLossAversion(intelligence),
    detectStatusQuoBias(intelligence),
    detectDecisionFatigue(intelligence),
    detectRiskTransfer(intelligence),
    detectPoliticalIncentives(intelligence),
    detectSocialProof(intelligence),
  ];

  // Find dominant pattern
  const detected = patterns.filter((p) => p.detected).sort((a, b) => b.confidence - a.confidence);
  const dominantPattern = detected.length > 0 ? detected[0].pattern : null;

  // Generate psychological profile
  const profile =
    detected.length > 0
      ? `${detected[0].pattern.toUpperCase()}: ${detected[0].implication}`
      : "No dominant psychological pattern detected";

  // Generate reframed strategy
  const reframedStrategy =
    detected.length > 0
      ? `The primary barrier is psychological (${detected[0].pattern}), not logical. ${detected[0].recommendation}`
      : "Psychological barriers are low. Focus on logical business case.";

  // Generate psychological recommendations
  const psychologicalRecommendations = detected
    .slice(0, 3)
    .map((p) => `• ${p.pattern}: ${p.recommendation}`);

  // Analyze champion/blocker dynamics
  const champions = intelligence.relationshipModel.buyingCommittee.members.filter(
    (m) => m.sentiment === "positive"
  );
  const blockers = intelligence.relationshipModel.buyingCommittee.blockers || [];
  const conflictReason =
    champions.length > 0 && blockers.length > 0
      ? `Champions want efficiency (${champions[0]?.title}), blockers fear risk (${blockers[0]})`
      : "No clear conflict";

  return {
    patterns,
    dominantPattern,
    psychologicalProfile: profile,
    reframedStrategy,
    psychologicalRecommendations,
    championBlockerDynamics: {
      identified: champions.length > 0 || blockers.length > 0,
      champions: champions.map((c) => c.name),
      blockers,
      conflictReason,
    },
  };
}

/**
 * INTEGRATE PSYCHOLOGY INTO STRATEGY
 */
export function integratePhsychologyIntoStrategy(
  intelligence: RelationshipIntelligenceObject,
  psychology: PsychologyAnalysis
): any {
  // Return enhanced strategy with psychological insights
  return {
    ...intelligence.strategy,
    psychologicalContext: psychology.psychologicalProfile,
    psychologicalBarrier: psychology.dominantPattern,
    psychologicalRecommendations: psychology.psychologicalRecommendations,
    reframedStrategy: psychology.reframedStrategy,
    championBlockerAnalysis: psychology.championBlockerDynamics,
  };
}
