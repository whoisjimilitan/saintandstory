/**
 * PHASE 6: PREDICTION ENGINE
 *
 * Forecasts relationship outcomes
 * Calibrates probabilities to historical data
 * Enables risk/reward decision-making
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";

export type OutcomeType = "reply" | "meeting" | "proposal" | "deal" | "churn";

export interface ProbabilityForecast {
  outcome: OutcomeType;
  probability: number; // 0-100
  confidence: number; // 0-100
  baselineRate: number; // Historical rate for this type
  keyFactors: string[];
  alternativeOutcomes: Array<{ outcome: string; probability: number }>;
  timeframe: number; // Days
}

export interface ProbabilityProfile {
  prospectId: string;
  stage: number;
  industry: string;
  forecasts: ProbabilityForecast[];
  overallDealProbability: number;
  riskFactors: string[];
  opportunityFactors: string[];
}

/**
 * BASELINE RATES (from historical Phase 1 data)
 * These would be calibrated to actual sales data
 */
const BASELINE_RATES: Record<string, number> = {
  "reply_stage1": 0.35, // 35% reply rate from Stage 1
  "meeting_stage2": 0.60, // 60% of Stage 2 prospects agree to meeting
  "proposal_stage3": 0.75, // 75% move to proposal in Stage 3
  "deal_stage4": 0.55, // 55% convert from Stage 4
  "churn_any": 0.15, // 15% overall churn rate
};

/**
 * FORECAST OUTCOME PROBABILITY
 */
export function forecastOutcome(
  intelligence: RelationshipIntelligenceObject,
  outcome: OutcomeType
): ProbabilityForecast {
  const stage = intelligence.relationshipModel.currentStage;
  const trust = intelligence.relationshipModel.trustScore;
  const readiness = intelligence.relationshipModel.relationshipMomentum.confidence;
  const industry = intelligence.facts.industry;

  let baseProb = 0;
  let timeframe = 0;
  let confidence = 50;
  const keyFactors: string[] = [];
  const alternativeOutcomes: Array<{ outcome: string; probability: number }> = [];

  switch (outcome) {
    case "reply":
      baseProb = BASELINE_RATES["reply_stage1"] * 100;
      timeframe = 5;
      confidence = 60 + trust * 0.2; // Higher trust = higher confidence

      if (stage > 1) keyFactors.push("Already engaged (higher reply rate)");
      if (industry === "SaaS") keyFactors.push("SaaS responds well to outreach");
      if (trust < 20) keyFactors.push("Cold prospect (lower reply rate)");

      alternativeOutcomes.push({ outcome: "no-reply", probability: 100 - baseProb });
      break;

    case "meeting":
      baseProb = BASELINE_RATES["meeting_stage2"] * 100;
      if (stage < 2) baseProb *= 0.4; // Harder to get meeting from Stage 1
      if (stage > 2) baseProb *= 1.1; // Easier if already engaged

      timeframe = 10;
      confidence = Math.min(95, 50 + trust * 0.3);

      if (trust > 60) keyFactors.push("Good relationship foundation");
      if (readiness < 40)
        keyFactors.push("Low buying readiness (meeting harder)");
      if (stage >= 2) keyFactors.push("Already evaluating");

      alternativeOutcomes.push(
        { outcome: "email-only", probability: 30 },
        { outcome: "declined", probability: 100 - baseProb - 30 }
      );
      break;

    case "proposal":
      baseProb = BASELINE_RATES["proposal_stage3"] * 100;
      if (stage < 3) baseProb *= 0.5;
      if (stage >= 4) baseProb *= 1.15;

      timeframe = 14;
      confidence = Math.min(90, 40 + trust * 0.35);

      if (trust > 70) keyFactors.push("Strong trust (proposal likely)");
      if (
        intelligence.relationshipModel.buyingCommittee.members.length > 2
      )
        keyFactors.push("Multiple stakeholders (longer cycle)");

      alternativeOutcomes.push(
        { outcome: "information-gathering", probability: 20 },
        { outcome: "no-proposal", probability: 100 - baseProb - 20 }
      );
      break;

    case "deal":
      baseProb = BASELINE_RATES["deal_stage4"] * 100;
      if (stage < 4) baseProb *= 0.3;
      if (stage >= 5) baseProb *= 1.2;

      timeframe = 30;
      confidence = Math.min(85, 30 + trust * 0.4);

      if (trust > 75) keyFactors.push("Very high trust (deal possible)");
      if (readiness > 75) keyFactors.push("High buying readiness");
      if (
        intelligence.relationshipModel.buyingCommittee.blockers &&
        intelligence.relationshipModel.buyingCommittee.blockers.length > 0
      )
        keyFactors.push("Active blockers (deal risk)");

      alternativeOutcomes.push(
        { outcome: "extended-evaluation", probability: 25 },
        { outcome: "no-deal", probability: 100 - baseProb - 25 }
      );
      break;

    case "churn":
      baseProb = BASELINE_RATES["churn_any"] * 100;
      if (stage >= 5) baseProb *= 0.5; // Entrenched relationships churn less
      if (stage <= 2) baseProb *= 2; // Early stage higher churn
      if (trust < 40) baseProb *= 1.5; // Low trust = higher churn risk

      timeframe = 90;
      confidence = 55;

      if (trust < 30) keyFactors.push("Low trust increases churn risk");
      if (readiness < 30) keyFactors.push("Low buying readiness = churn");

      alternativeOutcomes.push(
        { outcome: "sustained-engagement", probability: 100 - baseProb }
      );
      break;
  }

  // Adjust for intelligence quality
  const intelligenceQuality = intelligence.relationshipModel.modelConfidence;
  if (intelligenceQuality < 40) {
    confidence *= 0.7; // Low confidence in model = low confidence in forecast
  }

  return {
    outcome,
    probability: Math.min(95, Math.max(5, baseProb)),
    confidence: Math.min(95, confidence),
    baselineRate: baseProb,
    keyFactors,
    alternativeOutcomes,
    timeframe,
  };
}

/**
 * GENERATE PROBABILITY PROFILE
 */
export function generateProbabilityProfile(
  intelligence: RelationshipIntelligenceObject
): ProbabilityProfile {
  const forecasts: ProbabilityForecast[] = [
    forecastOutcome(intelligence, "reply"),
    forecastOutcome(intelligence, "meeting"),
    forecastOutcome(intelligence, "proposal"),
    forecastOutcome(intelligence, "deal"),
    forecastOutcome(intelligence, "churn"),
  ];

  // Overall deal probability = meeting × proposal × deal
  const pMeeting = forecasts.find((f) => f.outcome === "meeting")?.probability || 0;
  const pProposal = forecasts.find((f) => f.outcome === "proposal")?.probability || 0;
  const pDeal = forecasts.find((f) => f.outcome === "deal")?.probability || 0;
  const overallDealProbability = (pMeeting * pProposal * pDeal) / (100 * 100);

  // Risk factors (things that reduce probability)
  const riskFactors: string[] = [];
  if (intelligence.relationshipModel.trustScore < 40) {
    riskFactors.push("Low trust score");
  }
  if (
    intelligence.relationshipModel.buyingCommittee.blockers &&
    intelligence.relationshipModel.buyingCommittee.blockers.length > 0
  ) {
    riskFactors.push("Active blockers");
  }
  if (intelligence.relationshipModel.modelConfidence < 50) {
    riskFactors.push("High uncertainty");
  }

  // Opportunity factors (things that increase probability)
  const opportunityFactors: string[] = [];
  if (intelligence.relationshipModel.trustScore > 70) {
    opportunityFactors.push("High trust");
  }
  if (intelligence.relationshipModel.relationshipMomentum.direction === "accelerating") {
    opportunityFactors.push("Momentum accelerating");
  }
  if (intelligence.relationshipModel.currentStage >= 3) {
    opportunityFactors.push("Advanced stage");
  }

  return {
    prospectId: intelligence.prospectId,
    stage: intelligence.relationshipModel.currentStage,
    industry: intelligence.facts.industry,
    forecasts,
    overallDealProbability: Math.round(overallDealProbability * 100),
    riskFactors,
    opportunityFactors,
  };
}

/**
 * FORECAST SALES PIPELINE
 */
export function forecastPipeline(
  prospects: RelationshipIntelligenceObject[]
): {
  totalProspects: number;
  expectedReplies: number;
  expectedMeetings: number;
  expectedProposals: number;
  expectedDeals: number;
  totalDealValue: string;
} {
  let expectedReplies = 0;
  let expectedMeetings = 0;
  let expectedProposals = 0;
  let expectedDeals = 0;

  prospects.forEach((p) => {
    const profile = generateProbabilityProfile(p);
    expectedReplies += profile.forecasts.find((f) => f.outcome === "reply")?.probability || 0;
    expectedMeetings += profile.forecasts.find((f) => f.outcome === "meeting")?.probability || 0;
    expectedProposals += profile.forecasts.find((f) => f.outcome === "proposal")
      ?.probability || 0;
    expectedDeals += profile.overallDealProbability;
  });

  return {
    totalProspects: prospects.length,
    expectedReplies: Math.round(expectedReplies / 100),
    expectedMeetings: Math.round(expectedMeetings / 100),
    expectedProposals: Math.round(expectedProposals / 100),
    expectedDeals: Math.round(expectedDeals / 100),
    totalDealValue: "Calibration pending",
  };
}
