/**
 * RELATIONSHIP ADVANCEMENT PLAN
 *
 * Layer 3 of the Relationship Intelligence Object
 *
 * This is the core strategic output of the Business Relationship Engine.
 *
 * The engine answers ONE question:
 * "What has to become true in this relationship before we earn the next interaction?"
 *
 * Everything else (email, SMS, LinkedIn, voice) is a rendering of this strategy.
 *
 * CRITICAL: This layer contains ZERO reference to communication format.
 * It is purely about relationship dynamics and strategy.
 */

import type { RelationshipStage } from "./relationship-intelligence-object";

export interface RelationshipGap {
  currentState: string;
  desiredState: string;
  timelineEstimate: string;
  complexity: "simple" | "moderate" | "complex";
}

export interface TrustRequirement {
  type: string; // "Competence", "Reliability", "Benevolence", etc.
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  howToBuild: string;
}

export interface Friction {
  type: string; // "Risk", "Commitment", "Inertia", "Cost", etc.
  intensity: "high" | "medium" | "low";
  rootCause: string;
  howToReduce: string;
}

export interface PsychologicalMechanism {
  mechanism: string; // "Reciprocity", "Social Proof", "Scarcity", etc.
  whyItWorks: string;
  implementation: string;
  riskIfMissed: string;
}

export interface ValueDemonstration {
  approach: string;
  whatWillProve: string;
  howToShowIt: string;
  confidenceScore: number; // 0-100
}

export interface ObjectivesSet {
  primary: string; // The main thing we're trying to achieve
  secondary: string; // What we're willing to sacrifice if needed
  conversation: string; // If they reply, what should conversation be about?
  operator: string; // What should the operator watch for?
}

export interface CommunicationStrategy {
  recommendedChannel: "email" | "sms" | "linkedin" | "voice" | "letter" | "call" | "meeting";
  whyThisChannel: string;
  timing: {
    bestTimeToReach: string;
    cadence: string; // e.g., "Every 3 days until reply"
    maxAttempts: number;
  };
  tone: "conversational" | "professional" | "consultative" | "urgent" | "formal";
  toneReasoning: string;
}

export interface SuccessIndicator {
  indicator: string;
  howToMeasure: string;
  threshold: string;
}

export interface FailureIndicator {
  indicator: string;
  action: string; // What to do if this happens
}

export interface Strategy {
  // Strategy for if they don't respond at all
  ifNoResponse: string;
  // Strategy if they respond negatively
  ifNegative: string;
  // Strategy if timing is wrong
  ifTimingWrong: string;
}

export interface RelationshipAdvancementPlan {
  // Stage Progression
  currentStage: {
    stage: RelationshipStage;
    stageName: string;
    reason: string; // Why are they at this stage?
  };

  targetStage: {
    stage: RelationshipStage;
    stageName: string;
    why: string; // Why is this the next stage?
  };

  // The Gap We're Trying to Close
  gap: RelationshipGap;

  // What Needs to Happen
  currentFriction: Friction[];
  biggestFriction: Friction; // The primary blocker

  trustRequirements: TrustRequirement[];
  currentTrustLevel: number; // 0-100
  requiredTrustLevel: number; // 0-100

  // How to Bridge the Gap
  psychologicalStrategy: PsychologicalMechanism;
  valueStrategy: ValueDemonstration;

  // Objectives
  objectives: ObjectivesSet;

  // Communication Plan (STRATEGIC, not tactical)
  communicationStrategy: CommunicationStrategy;

  // Follow-up cadence (if first interaction fails)
  followUpCadence: {
    initialAttempt: string; // e.g., "Day 1"
    secondAttempt: string; // e.g., "Day 3 (different angle)"
    thirdAttempt: string; // e.g., "Day 7 (escalate)"
    maxFollowUps: number;
    whenToGiveUp: string; // e.g., "After 3 attempts with no response"
  };

  // How We'll Know It Worked
  successCriteria: SuccessIndicator[];
  successDefinition: string; // Plain English: what does success look like?

  // How We'll Know It Failed
  failureIndicators: FailureIndicator[];

  // Alternative Approach
  alternativeStrategy: string; // What to try if this doesn't work?
  whenToEscalate: string; // Conditions for switching strategies

  // Risk Assessment
  riskScore: number; // 0-100 (likelihood this backfires)
  riskDescription: string;
  confidenceScore: number; // 0-100 (confidence this will work)

  // Rationale
  strategicRationale: string; // Why this specific plan?
  keyAssumptions: string[]; // What has to be true?
  potentialObjections: string[]; // What might they think?
}

export function createRelationshipAdvancementPlan(
  currentStage: RelationshipStage,
  targetStage: RelationshipStage,
  reasoning: any // Pass in reasoning from business relationship engine
): RelationshipAdvancementPlan {
  // This will be populated by the business relationship engine
  // Placeholder showing structure
  return {
    currentStage: {
      stage: currentStage,
      stageName: `Stage ${currentStage}`,
      reason: "Reason for current stage",
    },
    targetStage: {
      stage: targetStage,
      stageName: `Stage ${targetStage}`,
      why: "Why this is the next logical stage",
    },
    gap: {
      currentState: "Current state of relationship",
      desiredState: "Desired state",
      timelineEstimate: "30 days",
      complexity: "moderate",
    },
    currentFriction: [],
    biggestFriction: {
      type: "Risk",
      intensity: "high",
      rootCause: "They have an existing solution",
      howToReduce: "Position as backup, not replacement",
    },
    trustRequirements: [],
    currentTrustLevel: 0,
    requiredTrustLevel: 30,
    psychologicalStrategy: {
      mechanism: "Reciprocity",
      whyItWorks: "Free account removes commitment barrier",
      implementation: "Already opened free account",
      riskIfMissed: "Prospect feels pressured",
    },
    valueStrategy: {
      approach: "Show possibility, not features",
      whatWillProve: "They can imagine using this",
      howToShowIt: "Realistic scenario",
      confidenceScore: 75,
    },
    objectives: {
      primary: "Get a yes/maybe/no reply",
      secondary: "Build understanding of their needs",
      conversation: "If they reply, explore their delivery peaks",
      operator: "Track which message type got replies",
    },
    communicationStrategy: {
      recommendedChannel: "email",
      whyThisChannel: "Low commitment, easy to forward",
      timing: {
        bestTimeToReach: "Tuesday-Thursday, 9am-11am",
        cadence: "Day 1, Day 4, Day 8",
        maxAttempts: 3,
      },
      tone: "conversational",
      toneReasoning: "Reduces perceived pressure",
    },
    followUpCadence: {
      initialAttempt: "Day 1 (9am)",
      secondAttempt: "Day 4 (different angle, 2pm)",
      thirdAttempt: "Day 8 (escalate value, 10am)",
      maxFollowUps: 3,
      whenToGiveUp: "After 3 attempts with no response",
    },
    successCriteria: [
      {
        indicator: "Reply received",
        howToMeasure: "Email response or form submission",
        threshold: "Any response (yes/maybe/no)",
      },
      {
        indicator: "Engagement with account",
        howToMeasure: "Login to free account",
        threshold: "At least one login",
      },
    ],
    successDefinition: "Prospect replies with yes/maybe/no OR logs into free account",
    failureIndicators: [
      {
        indicator: "No response after 3 attempts",
        action: "Move to nurture track, don't contact for 30 days",
      },
      {
        indicator: "Explicit negative reply",
        action: "Thank them, ask for reason, add to 6-month nurture",
      },
    ],
    alternativeStrategy:
      "If email doesn't work, try LinkedIn with social proof approach instead of feature benefits",
    whenToEscalate: "After 3 email attempts with no response, switch to LinkedIn social proof",
    riskScore: 15,
    riskDescription: "Low risk - free account is zero commitment, inverse incentive reduces pressure",
    confidenceScore: 72,
    strategicRationale:
      "Stage 1 is about earning reply and building initial trust. Email removes commitment barrier while showing we understand their reality.",
    keyAssumptions: [
      "They check email regularly",
      "They will see the value in a free account",
      "They are currently looking for backup options (at least subconsciously)",
    ],
    potentialObjections: [
      "They think we're just another vendor",
      "They're too busy to think about this",
      "Their current solution works fine",
    ],
  };
}
