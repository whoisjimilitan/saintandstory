/**
 * PHASE 5: MULTI-PERSON REASONING
 *
 * Models organizations as networks of stakeholders
 * Detects conflicts and incentive misalignments
 * Generates multi-stakeholder strategy
 */

export type StakeholderRole =
  | "CEO"
  | "COO"
  | "CFO"
  | "CTO"
  | "CMO"
  | "Procurement"
  | "Champion"
  | "Blocker"
  | "Other";

export interface Stakeholder {
  role: StakeholderRole;
  name: string;
  goals: string[];
  concerns: string[];
  trustLevel: number;
  influence: "high" | "medium" | "low";
  authority: "can_decide" | "can_block" | "must_approve";
  successCriteria: string[];
}

export interface OrganizationalNetwork {
  stakeholders: Stakeholder[];
  dynamics: {
    champions: Stakeholder[];
    blockers: Stakeholder[];
    conflicts: Array<{
      between: [Stakeholder, Stakeholder];
      reason: string;
      resolution: string;
    }>;
    criticalPath: Stakeholder[];
  };
}

export interface MultiStakeholderStrategy {
  perStakeholder: Array<{
    stakeholder: Stakeholder;
    whatTheyCareAbout: string;
    proof: string;
    objectionHandling: string;
  }>;
  conflictResolution: string[];
  sequencing: string; // Who to approach in what order
  alignmentStrategy: string;
  riskFactors: string[];
}

/**
 * BUILD ORGANIZATIONAL NETWORK
 */
export function buildOrganizationalNetwork(
  stakeholders: Partial<Stakeholder>[]
): OrganizationalNetwork {
  const full: Stakeholder[] = stakeholders.map((s) => ({
    role: s.role || "Other",
    name: s.name || "Unknown",
    goals: s.goals || [],
    concerns: s.concerns || [],
    trustLevel: s.trustLevel || 0,
    influence: s.influence || "low",
    authority: s.authority || "must_approve",
    successCriteria: s.successCriteria || [],
  }));

  const champions = full.filter((s) => s.trustLevel > 50);
  const blockers = full.filter((s) => s.trustLevel < 30 && s.authority !== "can_decide");

  const conflicts = detectConflicts(full);
  const criticalPath = identifyCriticalPath(full);

  return {
    stakeholders: full,
    dynamics: {
      champions,
      blockers,
      conflicts,
      criticalPath,
    },
  };
}

/**
 * DETECT STAKEHOLDER CONFLICTS
 */
function detectConflicts(
  stakeholders: Stakeholder[]
): Array<{
  between: [Stakeholder, Stakeholder];
  reason: string;
  resolution: string;
}> {
  const conflicts: Array<{
    between: [Stakeholder, Stakeholder];
    reason: string;
    resolution: string;
  }> = [];

  // CEO vs CFO: Growth vs Cost
  const ceo = stakeholders.find((s) => s.role === "CEO");
  const cfo = stakeholders.find((s) => s.role === "CFO");
  if (
    ceo &&
    cfo &&
    ceo.goals.some((g) => g.includes("growth")) &&
    cfo.concerns.some((c) => c.includes("cost"))
  ) {
    conflicts.push({
      between: [ceo, cfo],
      reason: "CEO wants growth, CFO wants cost control",
      resolution:
        "Show ROI: tie solution to revenue or cost savings CEO cares about",
    });
  }

  // COO vs CTO: Risk vs Features
  const coo = stakeholders.find((s) => s.role === "COO");
  const cto = stakeholders.find((s) => s.role === "CTO");
  if (
    coo &&
    cto &&
    coo.concerns.some((c) => c.includes("risk")) &&
    cto.goals.some((g) => g.includes("capability"))
  ) {
    conflicts.push({
      between: [coo, cto],
      reason: "COO wants stability, CTO wants capability",
      resolution:
        "Offer phased implementation: quick win (for CTO) + safety plan (for COO)",
    });
  }

  return conflicts;
}

/**
 * IDENTIFY CRITICAL PATH
 */
function identifyCriticalPath(stakeholders: Stakeholder[]): Stakeholder[] {
  // Sort by: authority (must_approve first) → influence (high first) → trust (high first)
  return [...stakeholders].sort((a, b) => {
    const authorityRank = {
      must_approve: 0,
      can_block: 1,
      can_decide: 2,
    };
    if (authorityRank[a.authority] !== authorityRank[b.authority]) {
      return authorityRank[a.authority] - authorityRank[b.authority];
    }

    const influenceRank = { high: 0, medium: 1, low: 2 };
    if (influenceRank[a.influence] !== influenceRank[b.influence]) {
      return influenceRank[a.influence] - influenceRank[b.influence];
    }

    return b.trustLevel - a.trustLevel;
  });
}

/**
 * GENERATE MULTI-STAKEHOLDER STRATEGY
 */
export function generateMultiStakeholderStrategy(
  network: OrganizationalNetwork
): MultiStakeholderStrategy {
  const perStakeholder = network.stakeholders.map((s) => {
    const whatTheyCareAbout = s.goals[0] || "Business success";
    const proof = generateProofType(s.role, whatTheyCareAbout);
    const objectionHandling = handleObjection(s.role, s.concerns);

    return {
      stakeholder: s,
      whatTheyCareAbout,
      proof,
      objectionHandling,
    };
  });

  const conflictResolution = network.dynamics.conflicts.map((c) => c.resolution);

  const sequencing = `Approach critical path in order: ${network.dynamics.criticalPath
    .map((s) => s.role)
    .join(" → ")}. Each builds case for next.`;

  const alignmentStrategy =
    "Get each stakeholder individual proof of value. Then sync: show how solution addresses all concerns simultaneously.";

  const riskFactors = network.dynamics.blockers.map(
    (b) => `${b.role}: ${b.concerns.join(", ")}`
  );

  return {
    perStakeholder,
    conflictResolution,
    sequencing,
    alignmentStrategy,
    riskFactors,
  };
}

/**
 * GENERATE ROLE-SPECIFIC PROOF
 */
function generateProofType(role: StakeholderRole, goal: string): string {
  switch (role) {
    case "CEO":
      return "Business case: Revenue impact or strategic fit";
    case "CFO":
      return "Financial proof: ROI, payback period, cost savings";
    case "COO":
      return "Operational proof: Safety plan, risk mitigation, implementation support";
    case "CTO":
      return "Technical proof: Integration roadmap, architecture fit, scalability";
    case "CMO":
      return "Market proof: Customer success stories, competitive positioning";
    case "Procurement":
      return "Process proof: Compliance, legal, vendor credentials";
    case "Champion":
      return "Success proof: Show how this makes champion's job easier";
    case "Blocker":
      return "Concern proof: Address specific fear or risk";
    default:
      return "Business case";
  }
}

/**
 * HANDLE ROLE-SPECIFIC OBJECTIONS
 */
function handleObjection(role: StakeholderRole, concerns: string[]): string {
  const concern = concerns[0] || "Unknown";

  switch (role) {
    case "CEO":
      return `If concerned about ${concern}: Focus on strategic value, competitive advantage, revenue impact`;
    case "CFO":
      return `If concerned about cost: Show ROI, compare to current costs, offer fixed-price guarantee`;
    case "COO":
      return `If concerned about ${concern}: Offer implementation support, reference accounts, phased rollout`;
    case "CTO":
      return `If concerned about integration: Provide technical architecture, proof of concept, integration roadmap`;
    case "Procurement":
      return `If concerned about compliance: Provide certifications, legal review, vendor audit results`;
    default:
      return `If concerned about ${concern}: Provide proof and references`;
  }
}

/**
 * DETECT ORGANIZATIONAL CONSENSUS PATH
 */
export function detectConsensusPath(network: OrganizationalNetwork): string {
  const champions = network.dynamics.champions.length;
  const blockers = network.dynamics.blockers.length;
  const neutral = network.stakeholders.length - champions - blockers;

  if (champions > blockers) {
    return `Champions (${champions}) outnumber blockers (${blockers}). Strategy: Champions champion to blockers. Likely consensus achievable.`;
  }

  if (blockers > champions) {
    return `Blockers (${blockers}) > Champions (${champions}). Strategy: Convert blockers through concerns resolution. High-effort consensus path.`;
  }

  return `Mixed stakeholder sentiment. Strategy: Focus on neutral (${neutral}) stakeholders. Build coalition.`;
}
