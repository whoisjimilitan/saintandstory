/**
 * PHASE 1: CALIBRATION VALIDATOR
 *
 * Scores engine reasoning on 6 criteria:
 * 1. Evidence Traceability (20%)
 * 2. Confidence Calibration (15%)
 * 3. Contradiction Handling (15%)
 * 4. Unknown Detection (15%)
 * 5. Reasoning Coherence (15%)
 * 6. Strategic Utility (20%)
 *
 * Optimizes for RESPECT, not agreement
 *
 * Success = Experts say "I respect this thinking"
 * NOT = "I agree with this conclusion"
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";

export interface ExpertAssessment {
  stage: number; // 0-6
  trustScore: number; // 0-100
  buyingReadiness: number; // 0-100
  primaryStakeholder: string;
  keyBlocker: string;
  recommendedStrategy: string;
  communicationObjective: string;
  reasoning: string;

  // For calibration scoring
  expertConfidenceInStage?: number; // 0-100
  expertConfidenceInTrust?: number; // 0-100
  expertIdentifiedContradictions?: string[];
  expertIdentifiedUnknowns?: string[];
  expertViewOnStrategicValue?: string; // "high" | "medium" | "low"
}

export interface CalibrationScore {
  companyName: string;
  companyId: string;

  // Individual criteria scores (0-100)
  evidenceTraceability: number;
  confidenceCalibration: number;
  contradictionHandling: number;
  unknownDetection: number;
  reasoningCoherence: number;
  strategicUtility: number;

  // Weighted overall score
  overallScore: number;

  // Detailed feedback
  reasoning: {
    strengths: string[];
    weaknesses: string[];
    respectVsAgreement: "earned_respect" | "agreement_with_caveats" | "disagreement_respected" | "not_respected";
  };

  // Learning
  learningRules: string[];
  expertDifference: {
    stageDifference: number;
    trustDifference: number;
    whyItMatters: string;
  };
}

/**
 * CRITERION 1: EVIDENCE TRACEABILITY (20%)
 *
 * Can we trace every claim to observed evidence?
 */
export function scoreEvidenceTraceability(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): number {
  // Check if Facts layer is populated
  const hasObservedIndicators =
    engine.facts.observedIndicators && engine.facts.observedIndicators.length > 0;

  // Check if Evidence layer connects to claims
  const hasEvidenceMap =
    engine.evidence.inferenceMap && engine.evidence.inferenceMap.length > 0;

  // Check if Reasoning layer traces to Evidence
  const reasoningHasEvidence =
    engine.reasoning.whyTheyMightNeedUs &&
    (engine.reasoning.whyTheyMightNeedUs as any).supporting_evidence &&
    (engine.reasoning.whyTheyMightNeedUs as any).supporting_evidence.length > 0;

  // Check if Model references Evidence
  const modelHasEvidence =
    engine.relationshipModel.knownFacts &&
    engine.relationshipModel.knownFacts.length > 0;

  let score = 0;
  if (hasObservedIndicators) score += 25;
  if (hasEvidenceMap) score += 25;
  if (reasoningHasEvidence) score += 25;
  if (modelHasEvidence) score += 25;

  return Math.min(score, 100);
}

/**
 * CRITERION 2: CONFIDENCE CALIBRATION (15%)
 *
 * Is stated confidence justified by evidence strength?
 */
export function scoreConfidenceCalibration(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): number {
  const engineStageConfidence = engine.relationshipModel.modelConfidence;
  const expertStageConfidence = expert.expertConfidenceInStage ?? 70;

  const engineTrustConfidence = engine.relationshipModel.trustScore;
  const expertTrustConfidence = expert.expertConfidenceInTrust ?? 60;

  // Check if confidence is supported by evidence
  const evidenceStrength =
    (engine.evidence.allEvidence.length / 10) * 100; // Normalize to 10 as "good"
  const unknownsImpact = engine.relationshipModel.unknowns.length * 10; // Each unknown reduces score

  const calibratedConfidence = Math.max(0, evidenceStrength - unknownsImpact);

  // Score based on calibration accuracy
  const stageDiff = Math.abs(engineStageConfidence - calibratedConfidence);
  const trustDiff = Math.abs(engineTrustConfidence - expertTrustConfidence);

  let score = 100;
  if (stageDiff > 20) score -= 20; // Over/under by 20+ = significant miscalibration
  if (stageDiff > 40) score = 0; // Over/under by 40+ = completely miscalibrated
  if (trustDiff > 30) score -= 20;

  return Math.max(0, score);
}

/**
 * CRITERION 3: CONTRADICTION HANDLING (15%)
 *
 * Does engine recognize conflicting signals?
 */
export function scoreContradictionHandling(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): number {
  const expertContradictions = expert.expertIdentifiedContradictions ?? [];

  // Check if Reasoning layer identifies pain/potential conflicts
  const reasoningIdentifiesComplexity =
    engine.reasoning.inferredPainPoints && engine.reasoning.inferredPainPoints.length > 0;

  // Check if Model acknowledges stakeholder conflicts
  const modelHasConflictAwareness =
    engine.relationshipModel.buyingCommittee.blockers &&
    engine.relationshipModel.buyingCommittee.blockers.length > 0;

  // Check if Momentum acknowledges direction uncertainty
  const momentumIsRealistic =
    engine.relationshipModel.relationshipMomentum.direction !== "accelerating" ||
    engine.relationshipModel.relationshipMomentum.confidence < 80;

  let score = 0;
  if (reasoningIdentifiesComplexity) score += 33;
  if (modelHasConflictAwareness) score += 33;
  if (momentumIsRealistic) score += 34;

  // Bonus if it matches expert contradictions
  if (expertContradictions.length > 0) {
    const engineSurfacedContradictions = expertContradictions.some(
      (contradiction) =>
        engine.relationshipModel.relationshipMomentum.direction === "stalled" ||
        engine.relationshipModel.trustScore < 40
    );

    if (engineSurfacedContradictions) score = Math.min(100, score + 20);
  }

  return Math.min(100, score);
}

/**
 * CRITERION 4: UNKNOWN DETECTION (15%)
 *
 * Does engine surface what it doesn't know and quantify impact?
 */
export function scoreUnknownDetection(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): number {
  // Check if unknowns are surfaced
  const unknownsSurfaced =
    engine.relationshipModel.unknowns &&
    engine.relationshipModel.unknowns.length > 0;

  // Check if gaps are documented
  const gapsSurfaced =
    engine.facts.dataQuality.gaps && engine.facts.dataQuality.gaps.length > 0;

  // Check if uncertainty is reflected in confidence
  const confidenceReflectsUncertainty =
    engine.relationshipModel.modelConfidence < 70 &&
    engine.relationshipModel.unknowns.length > 2;

  // Check if Evidence layer surfaces gaps
  const evidenceGapsDocumented =
    engine.evidence.evidenceGaps && engine.evidence.evidenceGaps.length > 0;

  let score = 0;
  if (unknownsSurfaced) score += 25;
  if (gapsSurfaced) score += 25;
  if (confidenceReflectsUncertainty) score += 25;
  if (evidenceGapsDocumented) score += 25;

  // Deduct if false confidence despite unknowns
  if (
    engine.relationshipModel.unknowns.length > 3 &&
    engine.relationshipModel.modelConfidence > 80
  ) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * CRITERION 5: REASONING COHERENCE (15%)
 *
 * Do all 8 layers align with each other?
 */
export function scoreReasoningCoherence(
  engine: RelationshipIntelligenceObject
): number {
  let score = 100;

  // Check 1: Model → Strategy alignment
  const modelStrategyAlign =
    engine.relationshipModel.currentStage === engine.strategy.currentStage.stage;
  if (!modelStrategyAlign) score -= 15;

  // Check 2: Strategy → Communication alignment
  const strategyCommAlign =
    engine.strategy.communicationStrategy.recommendedChannel &&
    engine.communications.primary.channel;
  if (!strategyCommAlign) score -= 15;

  // Check 3: Confidence consistency
  const confidenceConsistent =
    engine.relationshipModel.modelConfidence ===
    engine.relationshipModel.modelConfidence;
  if (!confidenceConsistent) score -= 10;

  // Check 4: Timeline matches Stage
  const timelineStageAlign =
    engine.timeline.currentStage.stage === engine.relationshipModel.currentStage;
  if (!timelineStageAlign) score -= 10;

  // Check 5: Operator Guidance reflects Model
  const guidanceReflectsModel =
    engine.operatorGuidance.executiveSummary.whoTheyAre &&
    engine.operatorGuidance.executiveSummary.whyWeThinkTheyNeedUs;
  if (!guidanceReflectsModel) score -= 10;

  // Check 6: Unknowns impact Confidence
  const unknownsImpactConfidence =
    engine.relationshipModel.unknowns.length > 2 &&
    engine.relationshipModel.modelConfidence < 70;
  if (!unknownsImpactConfidence && engine.relationshipModel.unknowns.length > 2)
    score -= 10;

  return Math.max(0, score);
}

/**
 * CRITERION 6: STRATEGIC UTILITY (20%)
 *
 * Would recommendations improve outcomes?
 */
export function scoreStrategicUtility(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): number {
  // A. Highest leverage issue identified
  const hasLeverageStrategy = engine.strategy.gap && engine.strategy.gap.desiredState;
  let leverageScore = hasLeverageStrategy ? 25 : 0;

  // B. Recommendation would advance relationship
  const hasActionableObjective =
    engine.strategy.objectives.primary &&
    engine.strategy.objectives.primary.length > 0;
  let advancementScore = hasActionableObjective ? 25 : 0;

  // C. Avoids busywork
  const avoidsBusywork =
    engine.strategy.strategicRationale &&
    !engine.strategy.strategicRationale.includes("send email") &&
    !engine.strategy.strategicRationale.includes("follow up");
  let busyworkScore = avoidsBusywork ? 25 : 0;

  // D. Commercially useful reasoning
  const commerciallyUseful =
    engine.operatorGuidance.nextSteps &&
    (engine.operatorGuidance.nextSteps.ifTheyReply ||
      engine.operatorGuidance.nextSteps.ifTheyIgnore);
  let usefulnessScore = commerciallyUseful ? 25 : 0;

  // Bonus if it matches expert's view of value
  if (expert.expertViewOnStrategicValue === "high") {
    if (engine.strategy.gap.desiredState.length > 20) {
      leverageScore = 25;
    }
  }

  return Math.min(
    100,
    leverageScore + advancementScore + busyworkScore + usefulnessScore
  );
}

/**
 * MAIN: Score entire calibration
 */
export function calibrateEngineReasoning(
  engine: RelationshipIntelligenceObject,
  expert: ExpertAssessment
): CalibrationScore {
  const traceability = scoreEvidenceTraceability(engine, expert);
  const confidence = scoreConfidenceCalibration(engine, expert);
  const contradictions = scoreContradictionHandling(engine, expert);
  const unknowns = scoreUnknownDetection(engine, expert);
  const coherence = scoreReasoningCoherence(engine);
  const utility = scoreStrategicUtility(engine, expert);

  // Weighted overall score
  const overallScore = Math.round(
    traceability * 0.2 +
      confidence * 0.15 +
      contradictions * 0.15 +
      unknowns * 0.15 +
      coherence * 0.15 +
      utility * 0.2
  );

  // Determine respect vs agreement
  const stageDiff = Math.abs(engine.relationshipModel.currentStage - expert.stage);
  const trustDiff = Math.abs(engine.relationshipModel.trustScore - expert.trustScore);

  let respectVsAgreement: "earned_respect" | "agreement_with_caveats" | "disagreement_respected" | "not_respected";

  if (stageDiff === 0 && trustDiff < 15) {
    respectVsAgreement = "agreement_with_caveats";
  } else if (stageDiff <= 1 && traceability > 80 && utility > 75) {
    respectVsAgreement = "disagreement_respected";
  } else if (traceability > 85 && utility > 80) {
    respectVsAgreement = "earned_respect";
  } else {
    respectVsAgreement = "not_respected";
  }

  // Build learning rules
  const learningRules: string[] = [];

  if (contradictions > 80) {
    learningRules.push(
      "Engine correctly identifies conflicting signals → rule: weight contradiction detection"
    );
  }
  if (unknowns > 80 && confidence < 50) {
    learningRules.push(
      "Engine correctly bounds confidence by unknowns → rule: treat N unknowns as N * 10 confidence ceiling"
    );
  }
  if (utility > 85) {
    learningRules.push(
      "Engine identifies actionable leverage → rule: apply similar leverage detection to all relationships"
    );
  }

  if (stageDiff > 1) {
    learningRules.push(
      `Engine stage differs from expert by ${stageDiff} → investigate why: missing evidence? different weighting?`
    );
  }

  return {
    companyName: engine.businessName,
    companyId: engine.prospectId,

    evidenceTraceability: traceability,
    confidenceCalibration: confidence,
    contradictionHandling: contradictions,
    unknownDetection: unknowns,
    reasoningCoherence: coherence,
    strategicUtility: utility,

    overallScore,

    reasoning: {
      strengths: [
        traceability > 80 ? "Evidence is well-traced" : "",
        confidence > 80 ? "Confidence is well-calibrated" : "",
        contradictions > 80 ? "Contradictions are recognized" : "",
        unknowns > 80 ? "Unknowns are surfaced" : "",
        coherence > 80 ? "Reasoning is coherent" : "",
        utility > 80 ? "Recommendations are actionable" : "",
      ].filter((s) => s),

      weaknesses: [
        traceability < 70 ? "Evidence traceability is weak" : "",
        confidence < 70 ? "Confidence calibration is poor" : "",
        contradictions < 70 ? "Contradictions are missed" : "",
        unknowns < 70 ? "Unknowns are not surfaced" : "",
        coherence < 70 ? "Reasoning has gaps" : "",
        utility < 70 ? "Recommendations lack utility" : "",
      ].filter((s) => s),

      respectVsAgreement,
    },

    learningRules,

    expertDifference: {
      stageDifference: Math.abs(engine.relationshipModel.currentStage - expert.stage),
      trustDifference: Math.abs(engine.relationshipModel.trustScore - expert.trustScore),
      whyItMatters:
        stageDiff > 1
          ? "Large stage difference suggests different evidence weighting or missing signals"
          : "Stage agreement suggests good alignment on situation assessment",
    },
  };
}
