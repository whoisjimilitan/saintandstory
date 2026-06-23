/**
 * LEARNING LAYER
 *
 * Final layer (Layer 8) of the Relationship Intelligence Object
 *
 * Every interaction produces outcomes.
 * Outcomes are evidence that should update the Relationship Model.
 * The Learning Layer captures these outcomes and prescribes model updates.
 *
 * The loop:
 * Relationship Model → Strategy → Communication → Outcome → Learning → Updated Model
 *
 * The system improves over time as it learns.
 * It doesn't treat every interaction as a fresh start.
 *
 * Examples of learnable outcomes:
 * - Email opened but not replied → Concern about message fit
 * - Meeting booked → Positive signal, increase trust
 * - Prospect replied with pricing objection → Budget constraint discovered
 * - Champion introduced procurement → Buying committee complexity increased
 * - Decision delayed due to budget freeze → Urgency decreased, timeline extended
 * - Competitor mentioned → Competitive context now known
 * - Website behavior shows demo recording watched 3x → Strong technical interest
 *
 * None of these are just "events."
 * Each is evidence that should evolve understanding of the relationship.
 */

export type OutcomeType =
  | "email-sent"
  | "email-opened"
  | "email-clicked"
  | "email-replied"
  | "email-ignored"
  | "sms-sent"
  | "sms-read"
  | "sms-replied"
  | "call-attempted"
  | "call-connected"
  | "call-missed"
  | "meeting-requested"
  | "meeting-booked"
  | "meeting-attended"
  | "meeting-cancelled"
  | "demo-scheduled"
  | "demo-attended"
  | "content-consumed"
  | "website-visit"
  | "account-created"
  | "account-used"
  | "objection-raised"
  | "question-asked"
  | "competitor-mentioned"
  | "internal-meeting"
  | "champion-introduced"
  | "blocker-identified"
  | "budget-confirmed"
  | "decision-delayed"
  | "deal-lost"
  | "deal-won"
  | "silence";

export interface OutcomeEvent {
  type: OutcomeType;
  date: string;
  details: string; // Free text: what actually happened?
  sentiment: "positive" | "neutral" | "negative";
  unexpectedness: "expected" | "surprising" | "shocking"; // Did this align with model predictions?
  context?: string; // Who did it, where, why?
}

export interface ModelUpdate {
  field: string; // Which relationship model field to update?
  oldValue?: string; // Previous value (for audit trail)
  newValue: string; // New value based on outcome
  reasoning: string; // Why are we changing this?
  confidence: number; // 0-100: How confident in this update?
}

export interface UpdatedAssumption {
  assumption: string; // The assumption we held
  confidence_before: number; // How sure we were before
  confidence_after: number; // How sure we are now
  changed: boolean; // Did confidence change significantly?
  recommendation: string; // What should we do about this?
}

export interface LearningInsight {
  insight: string; // What did we learn?
  evidence: OutcomeEvent[]; // What events led to this insight?
  implicationForStrategy: string; // How should strategy change?
  implicationForCommunication: string; // How should communication change?
}

export interface LearningLayer {
  // Recent outcomes
  recentOutcomes: OutcomeEvent[];

  // What the outcomes tell us
  modelUpdates: ModelUpdate[];

  // How this changes our confidence in key assumptions
  assumptionUpdates: UpdatedAssumption[];

  // Broader learnings from patterns
  insights: LearningInsight[];

  // Recommended model revisions
  recommendedRevisions: {
    field: string;
    currentValue: string;
    proposedValue: string;
    reasoning: string;
    confidence: number;
  }[];

  // Historical learning
  learningHistory: {
    date: string;
    what_we_thought: string;
    what_happened: string;
    gap: string; // How did reality differ from prediction?
    lesson: string; // What should we remember?
  }[];

  // Model drift detection
  modelHealthCheck: {
    modelAge: string; // How old is current model?
    eventsSinceLastUpdate: number;
    confidenceTrend: "increasing" | "stable" | "decreasing";
    needsRefresh: boolean;
    reasonForRefresh?: string;
  };

  // Next interaction effectiveness prediction
  predictedOutcome: {
    nextInteractionType: string; // What we plan to do next
    expectedOutcome: string; // What we predict will happen
    confidenceInPrediction: number; // 0-100
    alternativeOutcomes: string[]; // What else might happen?
  };

  // What questions this outcome raised
  newQuestions: string[];

  // What we should test
  suggestedTests: string[];
}

export function createLearningLayer(): LearningLayer {
  return {
    recentOutcomes: [],
    modelUpdates: [],
    assumptionUpdates: [],
    insights: [],
    recommendedRevisions: [],
    learningHistory: [],
    modelHealthCheck: {
      modelAge: "new",
      eventsSinceLastUpdate: 0,
      confidenceTrend: "stable",
      needsRefresh: false,
    },
    predictedOutcome: {
      nextInteractionType: "unknown",
      expectedOutcome: "unknown",
      confidenceInPrediction: 0,
      alternativeOutcomes: [],
    },
    newQuestions: [],
    suggestedTests: [],
  };
}

export function analyzeOutcome(
  outcome: OutcomeEvent,
  previousPredictions?: {
    predicted: string;
    confidence: number;
  }
): LearningInsight {
  const surprisingOutcome = outcome.unexpectedness !== "expected";

  return {
    insight: `${outcome.type} occurred - ${outcome.details}`,
    evidence: [outcome],
    implicationForStrategy: surprisingOutcome
      ? "Previous strategy assumptions may need revision"
      : "Strategy assumptions holding up",
    implicationForCommunication: surprisingOutcome
      ? "Consider alternative communication approach"
      : "Continue current communication approach",
  };
}
