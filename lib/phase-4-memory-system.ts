/**
 * PHASE 4: RELATIONSHIP MEMORY SYSTEM
 *
 * Tracks relationship progression over time
 * Detects trajectories and patterns
 * Enables historical context and predictions
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";

export interface RelationshipSnapshot {
  timestamp: string;
  prospectId: string;
  stage: number;
  trust: number;
  readiness: number;
  urgency: string;
  keyPlayers: string[];
  blockers: string[];
  momentum: "accelerating" | "steady" | "stalled" | "declining";
  lastSignal: string;
  confidence: number;
}

export interface RelationshipTrajectory {
  prospectId: string;
  snapshots: RelationshipSnapshot[];
  pattern: "steady-growth" | "fluctuating" | "declining" | "stalled" | "cycling";
  confidence: number;
  inference: string;
}

export interface MemoryAnalysis {
  currentSnapshot: RelationshipSnapshot;
  history: RelationshipTrajectory;
  patterns: {
    trustTrend: "improving" | "declining" | "stable";
    stageProgression: "advancing" | "stalled" | "regressing";
    seasonality: string | null;
    playerChanges: string[];
  };
  predictions: {
    nextMilestone: string;
    daysToNextAction: number;
    probabilityOfProgress: number;
  };
}

/**
 * CREATE SNAPSHOT FROM INTELLIGENCE
 */
export function createSnapshot(
  intelligence: RelationshipIntelligenceObject
): RelationshipSnapshot {
  return {
    timestamp: new Date().toISOString(),
    prospectId: intelligence.prospectId,
    stage: intelligence.relationshipModel.currentStage,
    trust: intelligence.relationshipModel.trustScore,
    readiness: intelligence.relationshipModel.relationshipMomentum.confidence,
    urgency: intelligence.relationshipModel.urgency.level,
    keyPlayers: [intelligence.relationshipModel.primaryContact.name],
    blockers: intelligence.relationshipModel.buyingCommittee.blockers || [],
    momentum: intelligence.relationshipModel.relationshipMomentum
      .direction as any,
    lastSignal: intelligence.relationshipModel.relationshipMomentum.lastSignal,
    confidence: intelligence.relationshipModel.modelConfidence,
  };
}

/**
 * ANALYZE TRAJECTORY
 */
export function analyzeTrajectory(
  snapshots: RelationshipSnapshot[]
): RelationshipTrajectory {
  if (snapshots.length < 2) {
    return {
      prospectId: snapshots[0]?.prospectId || "unknown",
      snapshots,
      pattern: "stalled",
      confidence: 30,
      inference: "Insufficient history to determine pattern",
    };
  }

  // Calculate trend
  const trustTrend = snapshots[snapshots.length - 1].trust - snapshots[0].trust;
  const stageTrend = snapshots[snapshots.length - 1].stage - snapshots[0].stage;

  let pattern: "steady-growth" | "fluctuating" | "declining" | "stalled" | "cycling" =
    "stalled";

  if (trustTrend > 20 && stageTrend > 0) {
    pattern = "steady-growth";
  } else if (trustTrend < -20 || stageTrend < 0) {
    pattern = "declining";
  } else if (Math.abs(trustTrend) < 20 && stageTrend === 0) {
    pattern = "stalled";
  } else if (
    snapshots.some((s) => s.trust > 60) &&
    snapshots.some((s) => s.trust < 40)
  ) {
    pattern = "fluctuating";
  }

  // Detect seasonality
  let seasonality: string | null = null;
  if (snapshots.length > 4) {
    const dates = snapshots.map((s) => new Date(s.timestamp));
    const months = dates.map((d) => d.getMonth());
    if (months.every((m) => m % 3 === months[0] % 3)) {
      seasonality = `Quarterly pattern (months ${months.join(",")})`;
    }
  }

  return {
    prospectId: snapshots[0].prospectId,
    snapshots,
    pattern,
    confidence: Math.min(90, 50 + snapshots.length * 10),
    inference: generateInference(pattern, trustTrend, stageTrend, seasonality),
  };
}

function generateInference(
  pattern: string,
  trustTrend: number,
  stageTrend: number,
  seasonality: string | null
): string {
  switch (pattern) {
    case "steady-growth":
      return `Trust increasing (+${trustTrend}%), advancing through stages. Momentum building. ${seasonality ? seasonality : ""}`;
    case "declining":
      return `Trust or stage declining. Lost momentum. Investigate blocker or budget freeze. ${seasonality ? seasonality : ""}`;
    case "stalled":
      return `No progress in trust or stage. Decision delayed. May need fresh approach or external trigger. ${seasonality ? seasonality : ""}`;
    case "fluctuating":
      return `Trust volatile (swings 20-40%). Multiple stakeholders or uncertainty. Needs alignment. ${seasonality ? seasonality : ""}`;
    case "cycling":
      return `Cyclic pattern detected. ${seasonality ? seasonality + " Pattern repeats." : ""}`;
    default:
      return "Pattern unclear";
  }
}

/**
 * DETECT PLAYER CHANGES
 */
export function detectPlayerChanges(
  snapshots: RelationshipSnapshot[]
): string[] {
  const changes: string[] = [];

  if (snapshots.length < 2) return changes;

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    // Player joined
    const newPlayers = curr.keyPlayers.filter((p) => !prev.keyPlayers.includes(p));
    if (newPlayers.length > 0) {
      changes.push(`New player: ${newPlayers.join(", ")}`);
    }

    // Player left
    const leftPlayers = prev.keyPlayers.filter((p) => !curr.keyPlayers.includes(p));
    if (leftPlayers.length > 0) {
      changes.push(`Player left: ${leftPlayers.join(", ")}`);
    }

    // Blockers appeared/disappeared
    const newBlockers = curr.blockers.filter((b) => !prev.blockers.includes(b));
    if (newBlockers.length > 0) {
      changes.push(`New blocker: ${newBlockers.join(", ")}`);
    }
  }

  return changes;
}

/**
 * PREDICT NEXT MILESTONE
 */
export function predictNextMilestone(
  trajectory: RelationshipTrajectory,
  current: RelationshipSnapshot
): { milestone: string; daysToNextAction: number; probability: number } {
  // Based on pattern, predict what's next

  if (trajectory.pattern === "steady-growth") {
    return {
      milestone: "Stage progression expected",
      daysToNextAction: 14,
      probability: 70,
    };
  }

  if (trajectory.pattern === "declining") {
    return {
      milestone: "Re-engagement needed",
      daysToNextAction: 7,
      probability: 40,
    };
  }

  if (trajectory.pattern === "stalled") {
    return {
      milestone: "Waiting for trigger (budget cycle, new pain)",
      daysToNextAction: 45,
      probability: 35,
    };
  }

  if (trajectory.pattern === "fluctuating") {
    return {
      milestone: "Alignment conversation needed",
      daysToNextAction: 3,
      probability: 55,
    };
  }

  return {
    milestone: "Uncertain",
    daysToNextAction: 30,
    probability: 50,
  };
}

/**
 * FULL MEMORY ANALYSIS
 */
export function analyzeMemory(
  intelligence: RelationshipIntelligenceObject,
  historicalSnapshots?: RelationshipSnapshot[]
): MemoryAnalysis {
  // Create current snapshot
  const current = createSnapshot(intelligence);

  // Analyze trajectory if history exists
  const allSnapshots = historicalSnapshots ? [...historicalSnapshots, current] : [current];
  const trajectory = analyzeTrajectory(allSnapshots);

  // Detect player changes
  const playerChanges = detectPlayerChanges(allSnapshots);

  // Predict next milestone
  const prediction = predictNextMilestone(trajectory, current);

  // Analyze patterns
  const trustTrend =
    allSnapshots.length > 1
      ? allSnapshots[allSnapshots.length - 1].trust - allSnapshots[0].trust > 10
        ? ("improving" as const)
        : allSnapshots[allSnapshots.length - 1].trust - allSnapshots[0].trust < -10
          ? ("declining" as const)
          : ("stable" as const)
      : ("stable" as const);

  const stageProgression =
    allSnapshots.length > 1
      ? allSnapshots[allSnapshots.length - 1].stage > allSnapshots[0].stage
        ? ("advancing" as const)
        : allSnapshots[allSnapshots.length - 1].stage < allSnapshots[0].stage
          ? ("regressing" as const)
          : ("stalled" as const)
      : ("stalled" as const);

  return {
    currentSnapshot: current,
    history: trajectory,
    patterns: {
      trustTrend,
      stageProgression,
      seasonality: trajectory.snapshots.length > 4 ? "Potential pattern detected" : null,
      playerChanges,
    },
    predictions: {
      nextMilestone: prediction.milestone,
      daysToNextAction: prediction.daysToNextAction,
      probabilityOfProgress: prediction.probability,
    },
  };
}

/**
 * INTEGRATE MEMORY INTO INTELLIGENCE
 */
export function integrateMemoryIntoIntelligence(
  intelligence: RelationshipIntelligenceObject,
  memory: MemoryAnalysis
): any {
  return {
    ...intelligence,
    memory: {
      currentSnapshot: memory.currentSnapshot,
      trajectory: memory.history.pattern,
      trajectoryInference: memory.history.inference,
      patterns: memory.patterns,
      prediction: {
        nextMilestone: memory.predictions.nextMilestone,
        daysToNextAction: memory.predictions.daysToNextAction,
        probabilityOfProgress: memory.predictions.probabilityOfProgress,
      },
    },
  };
}
