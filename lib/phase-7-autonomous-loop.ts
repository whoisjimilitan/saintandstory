/**
 * PHASE 7: AUTONOMOUS EXECUTION LOOP
 *
 * Closed-loop relationship management
 * Observation → Understanding → Strategy → Action → Learning
 * Fully autonomous (with human override)
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";
import type { PsychologyAnalysis } from "./phase-3-psychology-engine";
import type { MemoryAnalysis } from "./phase-4-memory-system";
import type { MultiStakeholderStrategy } from "./phase-5-multi-person-reasoning";
import type { ProbabilityProfile } from "./phase-6-prediction-engine";

export type LoopPhase = "observe" | "understand" | "strategize" | "execute" | "learn";

export interface LoopIteration {
  prospectId: string;
  timestamp: string;
  phase: LoopPhase;
  input: any;
  output: any;
  decision: string;
  confidence: number;
  requiresHumanApproval: boolean;
  nextAction: string;
}

export interface AutonomousDecision {
  prospectId: string;
  action: "contact" | "follow-up" | "meeting" | "proposal" | "nurture" | "escalate";
  channel: "email" | "sms" | "linkedin" | "phone" | "voice";
  timing: "immediate" | "today" | "this-week" | "next-week" | "30-days";
  message: string;
  confidence: number;
  reasoning: string;
  requiresHumanApproval: boolean;
  alternativeActions: string[];
}

export interface LoopState {
  iteration: number;
  currentPhase: LoopPhase;
  history: LoopIteration[];
  lastDecision: AutonomousDecision | null;
  nextScheduledAction: string;
}

/**
 * PHASE 1: OBSERVE
 * Current state of relationship
 */
export function observeRelationship(
  intelligence: RelationshipIntelligenceObject,
  lastKnownState?: RelationshipIntelligenceObject
): {
  stage: number;
  signals: string[];
  changes: string[];
} {
  const signals: string[] = [];
  const changes: string[] = [];

  // Current signals
  if (intelligence.relationshipModel.relationshipMomentum.direction === "accelerating") {
    signals.push("Momentum accelerating");
  }
  if (intelligence.relationshipModel.trustScore > 60) {
    signals.push(`High trust (${intelligence.relationshipModel.trustScore}%)`);
  }
  if (intelligence.relationshipModel.relationshipMomentum.direction === "declining") {
    signals.push("Momentum declining");
  }

  // Changes from last state
  if (lastKnownState) {
    const stageDiff = intelligence.relationshipModel.currentStage - lastKnownState.relationshipModel.currentStage;
    if (stageDiff > 0) changes.push(`Advanced ${stageDiff} stage(s)`);
    if (stageDiff < 0) changes.push(`Regressed ${Math.abs(stageDiff)} stage(s)`);

    const trustDiff = intelligence.relationshipModel.trustScore - lastKnownState.relationshipModel.trustScore;
    if (Math.abs(trustDiff) > 10) {
      changes.push(
        `Trust ${trustDiff > 0 ? "increased" : "decreased"} by ${Math.abs(trustDiff)}%`
      );
    }
  }

  return {
    stage: intelligence.relationshipModel.currentStage,
    signals,
    changes,
  };
}

/**
 * PHASE 2: UNDERSTAND
 * Integrate all layers of intelligence
 */
export function understand(
  intelligence: RelationshipIntelligenceObject,
  psychology?: PsychologyAnalysis,
  memory?: MemoryAnalysis,
  stakeholders?: MultiStakeholderStrategy,
  forecast?: ProbabilityProfile
): any {
  return {
    model: {
      stage: intelligence.relationshipModel.currentStage,
      trust: intelligence.relationshipModel.trustScore,
      readiness: intelligence.relationshipModel.relationshipMomentum.confidence,
      bottleneck: intelligence.relationshipModel.businessPain.primaryPain,
    },
    psychology: psychology
      ? {
          dominantPattern: psychology.dominantPattern,
          recommendation: psychology.reframedStrategy,
        }
      : null,
    memory: memory
      ? {
          trajectory: memory.history.pattern,
          nextMilestone: memory.predictions.nextMilestone,
        }
      : null,
    stakeholders: stakeholders
      ? {
          champions: stakeholders.perStakeholder.length,
          blockers: stakeholders.riskFactors.length,
        }
      : null,
    forecast: forecast
      ? {
          dealProbability: forecast.overallDealProbability,
          risks: forecast.riskFactors,
        }
      : null,
  };
}

/**
 * PHASE 3: STRATEGIZE
 * Decide next action
 */
export function strategize(understanding: any): AutonomousDecision {
  const stage = understanding.model.stage;
  const trust = understanding.model.trust;
  const bottleneck = understanding.model.bottleneck;

  let action: "contact" | "follow-up" | "meeting" | "proposal" | "nurture" | "escalate" =
    "contact";
  let channel: "email" | "sms" | "linkedin" | "phone" | "voice" = "email";
  let timing: "immediate" | "today" | "this-week" | "next-week" | "30-days" = "this-week";
  let requiresHumanApproval = false;
  let reasoning = "";

  // Stage-based decisions
  if (stage === 1) {
    action = "contact";
    channel = "email";
    timing = "immediate";
    reasoning = "Stage 1: Initial outreach needed";
  } else if (stage === 2) {
    action = "follow-up";
    channel = trust > 50 ? "phone" : "email";
    timing = "this-week";
    reasoning = "Stage 2: Follow up to move to decision";
  } else if (stage === 3) {
    action = "meeting";
    channel = "phone";
    timing = "immediate";
    reasoning = "Stage 3: Schedule delivery meeting";
  } else if (stage >= 4) {
    action = "proposal";
    channel = "email";
    timing = "today";
    reasoning = "Stage 4+: Generate proposal";
    requiresHumanApproval = true; // High-value action
  }

  // Psychology adjustments
  if (understanding.psychology?.dominantPattern === "decision-fatigue") {
    action = "nurture";
    timing = "next-week";
    reasoning = "Decision fatigue detected. Give breathing room.";
  }

  if (understanding.psychology?.dominantPattern === "loss-aversion") {
    reasoning += " Emphasize low-risk pilot.";
  }

  // Memory adjustments
  if (understanding.memory?.trajectory === "declining") {
    action = "escalate";
    timing = "immediate";
    requiresHumanApproval = true;
    reasoning = "Relationship declining. Needs human intervention.";
  }

  // Forecast adjustments
  if (understanding.forecast?.dealProbability < 20) {
    action = "nurture";
    timing = "30-days";
    reasoning = "Low deal probability. Nurture for future opportunity.";
  }

  // Generate message
  const message = `
[${action.toUpperCase()}] ${understanding.model.bottleneck}

Stage: ${stage}
Trust: ${trust}%
Next: ${timing}

Action: Send via ${channel}
Timing: ${timing}
  `.trim();

  return {
    prospectId: "unknown",
    action,
    channel,
    timing,
    message,
    confidence: 70 + (trust > 50 ? 15 : 0),
    reasoning,
    requiresHumanApproval,
    alternativeActions: [
      "nurture",
      "escalate",
      "wait",
    ],
  };
}

/**
 * PHASE 4: EXECUTE
 * Take the action (with human guard rail)
 */
export function execute(
  decision: AutonomousDecision,
  humanApprovalReceived: boolean = false
): {
  executed: boolean;
  status: string;
  timestamp: string;
} {
  if (decision.requiresHumanApproval && !humanApprovalReceived) {
    return {
      executed: false,
      status: "AWAITING_HUMAN_APPROVAL",
      timestamp: new Date().toISOString(),
    };
  }

  // In production, this would actually send the message
  // For now, return execution confirmation
  return {
    executed: true,
    status: `${decision.action.toUpperCase()}_SENT_VIA_${decision.channel}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * PHASE 5: LEARN
 * Update model based on outcome
 */
export function learn(
  intelligence: RelationshipIntelligenceObject,
  decision: AutonomousDecision,
  outcome: {
    type: "reply" | "no-reply" | "meeting-booked" | "objection" | "won" | "lost";
    details: string;
  }
): {
  modelUpdate: any;
  confidenceAdjustment: number;
  recommendedStrategyUpdate: string;
} {
  const learning = intelligence.learning;
  let confidenceAdjustment = 0;
  let recommendedUpdate = "";

  if (outcome.type === "reply") {
    confidenceAdjustment = +15;
    recommendedUpdate = "Stage assessment correct. Move forward.";
  } else if (outcome.type === "no-reply") {
    confidenceAdjustment = -20;
    recommendedUpdate = "Stage assessment too optimistic. Lower trust estimate.";
  } else if (outcome.type === "meeting-booked") {
    confidenceAdjustment = +25;
    recommendedUpdate = "Strong signal. Advance stage.";
  } else if (outcome.type === "objection") {
    confidenceAdjustment = -10;
    recommendedUpdate = "Objection raised. Update concern in model.";
  } else if (outcome.type === "won") {
    confidenceAdjustment = +50;
    recommendedUpdate = "Deal closed. Archive for reference learning.";
  } else if (outcome.type === "lost") {
    confidenceAdjustment = -50;
    recommendedUpdate = "Opportunity lost. Analyze blocker.";
  }

  return {
    modelUpdate: {
      confidenceAdjustment,
      outcomeObserved: outcome.type,
      details: outcome.details,
      timestamp: new Date().toISOString(),
    },
    confidenceAdjustment,
    recommendedStrategyUpdate: recommendedUpdate,
  };
}

/**
 * RUN ONE LOOP ITERATION
 */
export async function runLoopIteration(
  intelligence: RelationshipIntelligenceObject,
  extras?: {
    psychology?: PsychologyAnalysis;
    memory?: MemoryAnalysis;
    stakeholders?: MultiStakeholderStrategy;
    forecast?: ProbabilityProfile;
  }
): Promise<LoopIteration & AutonomousDecision> {
  // Phase 1: Observe
  const observation = observeRelationship(intelligence);

  // Phase 2: Understand
  const understanding = understand(
    intelligence,
    extras?.psychology,
    extras?.memory,
    extras?.stakeholders,
    extras?.forecast
  );

  // Phase 3: Strategize
  const decision = strategize(understanding);

  // Phase 4: Execute (with guard rail)
  const execution = execute(decision, false); // false = awaiting human approval if required

  return {
    prospectId: intelligence.prospectId,
    timestamp: new Date().toISOString(),
    phase: "execute",
    input: understanding,
    output: execution,
    decision: decision.reasoning,
    confidence: decision.confidence,
    requiresHumanApproval: decision.requiresHumanApproval,
    nextAction: decision.action,
    ...decision,
  };
}

/**
 * CLOSED LOOP: Keep iterating until resolution
 */
export async function runClosedLoop(
  intelligence: RelationshipIntelligenceObject,
  maxIterations: number = 10
): Promise<LoopState> {
  const state: LoopState = {
    iteration: 0,
    currentPhase: "observe",
    history: [],
    lastDecision: null,
    nextScheduledAction: "",
  };

  let current = intelligence;

  for (let i = 0; i < maxIterations; i++) {
    state.iteration = i + 1;

    // Run one iteration
    const iteration = await runLoopIteration(current);
    state.history.push(iteration);
    state.lastDecision = {
      prospectId: iteration.prospectId,
      action: iteration.action,
      channel: iteration.channel,
      timing: iteration.timing,
      message: iteration.message,
      confidence: iteration.confidence,
      reasoning: iteration.reasoning,
      requiresHumanApproval: iteration.requiresHumanApproval,
      alternativeActions: iteration.alternativeActions,
    };

    // Check if we should stop
    if (
      iteration.action === "proposal" ||
      iteration.action === "escalate" ||
      iteration.confidence < 50
    ) {
      state.nextScheduledAction = `[PAUSE] Requires human decision`;
      break;
    }

    // In production, wait for outcomes and update current
    // For now, just log that loop would continue
  }

  return state;
}
