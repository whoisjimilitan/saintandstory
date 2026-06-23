/**
 * PHASE 1: VALIDATION FRAMEWORK
 *
 * Scores engine reasoning against expert judgment
 *
 * Question: "Would an experienced salesperson agree with this?"
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";
import type { RelationshipStage } from "./relationship-intelligence-object";

// Expert assessment (ground truth)
export interface ExpertAssessment {
  stage: RelationshipStage;
  trustScore: number; // 0-100
  buyingReadiness: number; // 0-100
  primaryStakeholder: string; // Who's the decision maker?
  keyBlocker: string; // What's preventing progression?
  recommendedStrategy: string; // What should we do?
  communicationObjective: string; // Why are we communicating?
  reasoning: string; // Explanation of expert's logic
}

// Validation result
export interface ValidationScore {
  companyName: string;
  companyId: string;

  // Individual metric scores (0-100)
  stageAccuracy: number;
  trustScoreAccuracy: number;
  readinessAccuracy: number;
  stakeholderAccuracy: number;
  strategyLogic: number;
  objectiveClarity: number;

  // Overall
  overallScore: number; // 0-100
  passed: boolean; // >80% = pass
  reasoning: string; // Why did it pass/fail?

  // Detailed feedback
  strengths: string[];
  failures: string[];
  recommendations: string[];

  // For learning
  engineStage: RelationshipStage;
  expertStage: RelationshipStage;
  stageDifference: number; // Stages off
  engineTrust: number;
  expertTrust: number;
  trustDifference: number; // Points off
}

/**
 * SCORING FUNCTIONS
 */

export function scoreStageAccuracy(
  engineStage: RelationshipStage,
  expertStage: RelationshipStage
): number {
  const diff = Math.abs(engineStage - expertStage);
  if (diff === 0) return 100; // Perfect
  if (diff === 1) return 85; // Off by one stage (acceptable)
  if (diff === 2) return 50; // Off by two stages (concerning)
  return Math.max(0, 100 - diff * 20); // More than 2 = failing
}

export function scoreTrustAccuracy(engineTrust: number, expertTrust: number): number {
  const diff = Math.abs(engineTrust - expertTrust);
  if (diff <= 10) return 100; // Within 10 points = perfect
  if (diff <= 15) return 90; // Within 15 points = good
  if (diff <= 20) return 75; // Within 20 points = acceptable
  if (diff <= 30) return 50; // Within 30 points = concerning
  return Math.max(0, 100 - diff); // More than 30 = failing
}

export function scoreReadinessAccuracy(
  engineReadiness: number,
  expertReadiness: number
): number {
  const diff = Math.abs(engineReadiness - expertReadiness);
  if (diff <= 15) return 100; // Within 15 points = perfect
  if (diff <= 25) return 85; // Within 25 points = good
  if (diff <= 35) return 70; // Within 35 points = acceptable
  return Math.max(0, 100 - diff / 2); // Failing
}

export function scoreStakeholderAccuracy(
  engineStakeholder: string,
  expertStakeholder: string,
  confidence: number // 0-100: engine's confidence in this stakeholder
): number {
  if (
    engineStakeholder.toLowerCase().includes(expertStakeholder.toLowerCase()) ||
    expertStakeholder.toLowerCase().includes(engineStakeholder.toLowerCase())
  ) {
    return 100; // Correct
  }

  // If stakeholder is wrong, it's a major failure
  // High confidence + wrong = worse than low confidence + wrong
  return Math.max(0, 30 - confidence / 10);
}

export function scoreStrategyLogic(
  engineStrategy: string,
  expertStrategy: string,
  expertJudgment: "logical" | "questionable" | "poor"
): number {
  // This requires expert review, but we can score based on agreement
  const strategies = [
    engineStrategy.toLowerCase(),
    expertStrategy.toLowerCase(),
  ];

  // Check if strategies are aligned
  const alignment = getStrategyAlignment(engineStrategy, expertStrategy);

  if (expertJudgment === "logical") {
    if (alignment >= 0.7) return 100; // Strong alignment
    if (alignment >= 0.5) return 85; // Good alignment
    if (alignment >= 0.3) return 70; // Partial alignment
    return 50; // Weak alignment
  }

  if (expertJudgment === "questionable") {
    if (alignment >= 0.7) return 85;
    if (alignment >= 0.5) return 70;
    return 50;
  }

  return alignment * 100; // If expert said "poor", score is low unless engine also agrees
}

export function scoreObjectiveClarity(
  engineObjective: string,
  expertObjective: string
): number {
  // Is it specific? Is it actionable? Does it match expert's view?
  const isSpecific = engineObjective.includes("(") || engineObjective.length > 50;
  const isActionable = /^(get|schedule|deliver|complete|prove|understand)/i.test(
    engineObjective
  );
  const alignsWithExpert = getStrategyAlignment(engineObjective, expertObjective) > 0.4;

  let score = 0;
  if (isSpecific) score += 30;
  if (isActionable) score += 35;
  if (alignsWithExpert) score += 35;

  return score;
}

/**
 * HELPER: Strategy alignment (0-1 scale)
 */
function getStrategyAlignment(strategy1: string, strategy2: string): number {
  const words1 = new Set(
    strategy1.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  );
  const words2 = new Set(
    strategy2.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  );

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * MAIN: Score entire validation
 */
export function validateEngineOutput(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): ValidationScore {
  const stageScore = scoreStageAccuracy(
    engine.relationshipModel.currentStage,
    expert.stage
  );
  const trustScore = scoreTrustAccuracy(
    engine.relationshipModel.trustScore,
    expert.trustScore
  );
  const readinessScore = scoreReadinessAccuracy(
    engine.relationshipModel.urgency.level === "crisis"
      ? 95
      : engine.relationshipModel.urgency.level === "high"
        ? 80
        : engine.relationshipModel.urgency.level === "medium"
          ? 60
          : engine.relationshipModel.urgency.level === "low"
            ? 40
            : 20,
    expert.buyingReadiness
  );
  const stakeholderScore = scoreStakeholderAccuracy(
    engine.relationshipModel.primaryContact.name,
    expert.primaryStakeholder,
    engine.relationshipModel.modelConfidence
  );
  const strategyScore = scoreStrategyLogic(
    engine.relationshipModel.relationshipMomentum.direction,
    expert.recommendedStrategy,
    "logical"
  );
  const objectiveScore = scoreObjectiveClarity(
    engine.relationshipModel.relationshipMomentum.nextExpectedAction,
    expert.communicationObjective
  );

  const overallScore = Math.round(
    (stageScore + trustScore + readinessScore + stakeholderScore + strategyScore + objectiveScore) / 6
  );

  // Determine pass/fail
  const passed =
    stageScore >= 85 &&
    trustScore >= 75 &&
    readinessScore >= 70 &&
    stakeholderScore >= 100 &&
    strategyScore >= 70 &&
    overallScore >= 80;

  // Identify strengths and failures
  const strengths: string[] = [];
  const failures: string[] = [];

  if (stageScore >= 90) strengths.push("Stage assessment");
  else if (stageScore < 70) failures.push(`Stage assessment (off by ${Math.abs(engine.relationshipModel.currentStage - expert.stage)} stages)`);

  if (trustScore >= 90) strengths.push("Trust scoring");
  else if (trustScore < 70) failures.push(`Trust scoring (${Math.abs(engine.relationshipModel.trustScore - expert.trustScore)} points off)`);

  if (readinessScore >= 85) strengths.push("Buying readiness assessment");
  else if (readinessScore < 70) failures.push("Buying readiness overestimated/underestimated");

  if (stakeholderScore === 100) strengths.push("Stakeholder identification");
  else failures.push("Primary stakeholder misidentified");

  if (strategyScore >= 85) strengths.push("Strategic recommendation");
  else if (strategyScore < 70) failures.push("Strategic recommendation doesn't match expert judgment");

  if (objectiveScore >= 85) strengths.push("Communication objective clarity");
  else if (objectiveScore < 70) failures.push("Communication objective unclear or misaligned");

  return {
    companyName: engine.businessName,
    companyId: engine.prospectId,

    stageAccuracy: stageScore,
    trustScoreAccuracy: trustScore,
    readinessAccuracy: readinessScore,
    stakeholderAccuracy: stakeholderScore,
    strategyLogic: strategyScore,
    objectiveClarity: objectiveScore,

    overallScore,
    passed,
    reasoning: passed
      ? "Engine reasoning aligned with expert judgment"
      : "Engine reasoning diverged from expert judgment in key areas",

    strengths,
    failures,
    recommendations: failures.map((f) => `Fix: ${f}`),

    engineStage: engine.relationshipModel.currentStage,
    expertStage: expert.stage,
    stageDifference: Math.abs(engine.relationshipModel.currentStage - expert.stage),
    engineTrust: engine.relationshipModel.trustScore,
    expertTrust: expert.trustScore,
    trustDifference: Math.abs(engine.relationshipModel.trustScore - expert.trustScore),
  };
}

/**
 * BATCH SCORING
 */
export function scoreBatch(
  engines: RelationshipIntelligenceObject[],
  experts: ExpertAssessment[]
): {
  results: ValidationScore[];
  passRate: number;
  averageScore: number;
  failurePatterns: string[];
} {
  const results = engines.map((engine, i) => validateEngineOutput(engine, experts[i]));

  const passed = results.filter((r) => r.passed).length;
  const passRate = Math.round((passed / results.length) * 100);
  const averageScore = Math.round(
    results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
  );

  // Identify patterns in failures
  const failurePatterns: string[] = [];
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      r.failures.forEach((f) => {
        if (!failurePatterns.includes(f)) {
          failurePatterns.push(f);
        }
      });
    });

  return {
    results,
    passRate,
    averageScore,
    failurePatterns,
  };
}
