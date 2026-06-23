/**
 * RELATIONSHIP MODEL
 *
 * Layer 3 of the Relationship Intelligence Object
 *
 * This is NOT strategy. This is NOT "what to do."
 *
 * This is "what is true" about the relationship RIGHT NOW.
 *
 * The model describes reality as the AI currently understands it.
 * The model is updated by learning from every interaction.
 * Strategy derives FROM this model.
 *
 * Key principle: The model answers relationship-state questions, not communication questions.
 *
 * Examples of model-based questions:
 * - Why is this deal stalled?
 * - Has trust increased since last month?
 * - Is procurement now the blocker?
 * - Are we early or late in their buying journey?
 * - Which accounts are genuinely progressing?
 *
 * Examples of communication-only questions (use Strategy layer):
 * - What should we send?
 * - Which channel?
 * - What tone?
 */

import type { RelationshipStage } from "./relationship-intelligence-object";

export interface Participant {
  name: string;
  title: string;
  department: string;
  influence: "high" | "medium" | "low";
  sentiment: "champion" | "neutral" | "blocker";
  lastInteraction?: string;
  knownObjections?: string[];
}

export interface BuyingCommittee {
  identified: boolean;
  members: Participant[];
  decisionMaker: Participant | null;
  champion: Participant | null;
  blockers: Participant[];
  unknownInfluencers: string[]; // "Finance needs to sign off" but we don't have contact
}

export interface OrganizationalContext {
  // What's happening in their org that affects this deal?
  recentChanges: string[]; // New CEO, merger, restructure
  seasonality: string[]; // Budget freezes, fiscal year cycles
  constraints: string[]; // Regulatory, compliance, technical debt
  opportunities: string[]; // Expansion plans, new markets
}

export interface EconomicReality {
  budgetAllocated: string; // e.g., "Q3 2026" or "Unknown"
  estimatedDeal: string; // e.g., "£50-100k" or "Unknown"
  economicPain: string; // What problem justifies the spend?
  costOfInaction: string; // What happens if they don't solve this?
  roi?: string; // Expected return on investment
  paybackPeriod?: string; // How long to see ROI
}

export interface RiskAssessment {
  type: "political" | "technical" | "financial" | "organizational";
  description: string;
  severity: "high" | "medium" | "low";
  owner: string; // Who cares about this risk?
  mitigation?: string; // How to reduce it
}

export interface Momentum {
  direction: "accelerating" | "steady" | "decelerating" | "stalled";
  lastSignal: string; // e.g., "Requested demo"
  daysSinceLastSignal: number;
  nextExpectedAction: string; // e.g., "Internal review meeting"
  daysUntilNextAction?: number;
  confidence: number; // 0-100: How confident are we about this timeline?
}

export interface AssumptionOrUnknown {
  assumption: string; // What we believe to be true
  confidence: number; // 0-100: How sure are we?
  howToValidate: string; // How to test if true
  consequenceIfWrong: string; // What breaks if we're wrong?
}

export interface RelationshipModel {
  // WHO IS INVOLVED
  primaryContact: Participant;
  buyingCommittee: BuyingCommittee;
  organizationalContext: OrganizationalContext;

  // WHAT'S THE BUSINESS REALITY
  businessPain: {
    primaryPain: string;
    secondaryPains: string[];
    painIntensity: "critical" | "high" | "medium" | "low";
    evidenceOfPain: string[]; // Observable signals showing this pain
  };

  urgency: {
    level: "crisis" | "high" | "medium" | "low" | "none";
    driver: string; // Why this urgency level? (e.g., "Competitor threatening", "Budget ends June")
    deadline?: string; // When do they need this solved?
  };

  // WHAT DOES SUCCESS LOOK LIKE FOR THEM
  successCriteria: {
    functionalSuccess: string; // What does the solution do?
    businessSuccess: string; // What changes in their business?
    personalSuccess: string; // What's in it for the decision maker?
  };

  // WHAT'S THE FINANCIAL PICTURE
  economicReality: EconomicReality;

  // WHAT RISKS EXIST
  risks: RiskAssessment[];

  // WHERE ARE THEY IN THEIR JOURNEY
  currentStage: RelationshipStage;
  buyingJourneyPhase: "awareness" | "consideration" | "evaluation" | "negotiation" | "decision" | "stalled" | "lost";
  reasonForCurrentStage: string; // Why are they here?

  // HOW DO THEY FEEL ABOUT US
  trustScore: number; // 0-100
  trustBasis: string[]; // What earned this score? ("Demo went well", "No track record yet", etc.)
  confidenceInSolution: number; // 0-100: How confident are they we can solve it?

  // HOW'S THE RELATIONSHIP MOVING
  relationshipMomentum: Momentum;
  progressSinceLastInteraction: "advancing" | "same" | "regressing";

  // WHAT DO WE KNOW FOR SURE VS GUESSING
  knownFacts: string[]; // Things we've verified
  assumptions: AssumptionOrUnknown[];
  unknowns: AssumptionOrUnknown[];

  // WHAT WAS THE LAST EVIDENCE
  lastObservedSignals: {
    signal: string; // "Attended demo", "Asked about pricing", "Went silent"
    date: string;
    source: "email" | "call" | "demo" | "website" | "inactivity" | "other";
    sentiment: "positive" | "neutral" | "negative";
    implications: string; // What does this signal mean?
  }[];

  // COMPETITIVE CONTEXT
  competition: {
    hasCompetitor: boolean;
    competitors?: string[];
    ourAdvantage?: string;
    theirAdvantage?: string;
    switchingCosts?: string; // Cost to them to switch from current solution
  };

  // HISTORICAL PERFORMANCE OF THIS MODEL
  modelConfidence: number; // 0-100: How confident is this model overall?
  lastModelUpdate: string; // When was this last updated?
  modelUpdatedBecause: string; // What evidence prompted the update?
}

export function createRelationshipModel(
  primaryContact: Participant,
  businessPain: string,
  currentStage: RelationshipStage
): RelationshipModel {
  return {
    primaryContact,
    buyingCommittee: {
      identified: false,
      members: [primaryContact],
      decisionMaker: null,
      champion: null,
      blockers: [],
      unknownInfluencers: [],
    },
    organizationalContext: {
      recentChanges: [],
      seasonality: [],
      constraints: [],
      opportunities: [],
    },
    businessPain: {
      primaryPain: businessPain,
      secondaryPains: [],
      painIntensity: "medium",
      evidenceOfPain: [],
    },
    urgency: {
      level: "medium",
      driver: "Not yet determined",
    },
    successCriteria: {
      functionalSuccess: "Not yet determined",
      businessSuccess: "Not yet determined",
      personalSuccess: "Not yet determined",
    },
    economicReality: {
      budgetAllocated: "Unknown",
      estimatedDeal: "Unknown",
      economicPain: businessPain,
      costOfInaction: "Unknown",
    },
    risks: [],
    currentStage,
    buyingJourneyPhase: "awareness",
    reasonForCurrentStage: "Initial contact",
    trustScore: 0,
    trustBasis: [],
    confidenceInSolution: 0,
    relationshipMomentum: {
      direction: "steady",
      lastSignal: "Initial contact",
      daysSinceLastSignal: 0,
      nextExpectedAction: "First email",
      confidence: 50,
    },
    progressSinceLastInteraction: "same",
    knownFacts: [],
    assumptions: [],
    unknowns: [],
    lastObservedSignals: [],
    competition: {
      hasCompetitor: false,
    },
    modelConfidence: 30, // Low confidence until we have more signals
    lastModelUpdate: new Date().toISOString(),
    modelUpdatedBecause: "Initial model creation from discovery",
  };
}
