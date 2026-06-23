/**
 * RELATIONSHIP INTELLIGENCE OBJECT
 *
 * Single source of truth for all prospect reasoning.
 *
 * ARCHITECTURE PRINCIPLE:
 * - ONE reasoning object per prospect
 * - Facts, Reasoning, Strategy, Communication are separate layers
 * - All communications (email, SMS, LinkedIn, voice, etc.) render from this object
 * - No reasoning duplication across channels
 * - Reasoning happens once. Communication is just rendering.
 *
 * LAYERS:
 * 1. FACTS (observed, verifiable, sourced)
 * 2. REASONING (inferred, evidence-based, NOT invented)
 * 3. STRATEGY (chosen approach and rationale)
 * 4. COMMUNICATIONS (rendered outputs for each channel)
 * 5. TIMELINE (stage progression and expectations)
 * 6. OPERATOR GUIDANCE (explainability for humans)
 */

export type RelationshipStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DeliveryNeed =
  | "same-day-courier"
  | "scheduled-delivery"
  | "overflow-capacity"
  | "temporary-driver"
  | "dedicated-driver"
  | "regular-route-driver"
  | "long-haul-transport"
  | "temperature-controlled"
  | "pickup-service";

export type ConfidenceLevel = "high" | "medium" | "low";

export type EvidenceSource =
  | "website"
  | "google-maps"
  | "linkedin"
  | "dot-registration"
  | "fmcsa-data"
  | "previous-conversation"
  | "crm-history"
  | "industry-data"
  | "social-media"
  | "news"
  | "manual-entry";

export interface EvidencePoint {
  source: EvidenceSource;
  observation: string; // The actual observation/signal
  dateFound: string;
  confidence: number; // 0-1 scale (0.81 not "high")
  url?: string; // Link to evidence if available
  rawData?: string; // The actual text/value from source
}

export interface InferenceWithEvidence {
  conclusion: string; // The claim
  supporting_evidence: EvidencePoint[]; // All evidence backing it
  confidence_score: number; // Aggregate confidence
  alternative_explanations?: string[]; // What else could explain this?
  confidence_reasoning: string; // Why this confidence level?
}

// ============================================================================
// LAYER 1: FACTS (OBSERVED, VERIFIABLE)
// ============================================================================

export interface FactsLayer {
  // What we know for certain
  businessName: string;
  industry: string;
  location: string;
  businessSize: "solo" | "small" | "medium" | "large";
  contactName?: string;
  contactEmail?: string;

  // Observable indicators (NOT inferred)
  observedIndicators: {
    indicator: string;
    source: "discovery" | "website" | "social" | "manual-entry";
    dateObserved: string;
    confidence: ConfidenceLevel;
  }[];

  // Data quality assessment
  dataQuality: {
    completeness: "high" | "medium" | "low";
    verificationLevel: "verified" | "likely" | "unconfirmed";
    gaps: string[]; // What we don't know yet
  };
}

// ============================================================================
// LAYER 2: REASONING (INFERRED, EVIDENCE-BASED)
// ============================================================================

export interface InferredDeliveryNeed {
  deliveryType: DeliveryNeed;
  inferredBecause: string; // The evidence-based reasoning
  likelihood: ConfidenceLevel;
  operationalScenarios: {
    scenario: string;
    whenItHappens: string;
    why: string;
  }[];
  counterEvidence?: string; // What might prove us wrong?
}

export interface ReasoningLayer {
  // What we believe based on facts (never invented)
  potentialDeliveryNeeds: InferredDeliveryNeed[];

  // Why we think they might need us
  whyTheyMightNeedUs: InferenceWithEvidence;

  // What unique value we offer
  ourCompetitivePosition: {
    whatWeDo: string;
    whoUsesIt: string;
    whenItMatters: string;
  };

  // Inferred pain points (NOT invented, with evidence)
  inferredPainPoints: InferenceWithEvidence[];

  // What would make them NOT need us (important for inverse incentive)
  alternativeTheyMayHave: {
    alternative: string;
    howCommon: "typical" | "likely" | "possible";
    ourPosition: string; // How do we position against this?
    evidence: EvidencePoint[];
  }[];
}

// ============================================================================
// LAYER 3: STRATEGY (CHOSEN APPROACH & RATIONALE)
// ============================================================================

export interface TrustStrategyChoice {
  approach: string;
  honestStatement: string; // The actual inverse incentive
  rationale: {
    whyThisApproach: string;
    psychologicalBasis: string; // Why it works
    alternativesConsidered: string[];
    whyNotThem: string;
  };
}

export interface MicroCommitmentChoice {
  ask: string;
  responseOptions: string[];
  cognitiveLoad: "minimal" | "low" | "medium";
  rationale: {
    whyThisAsk: string;
    whyThesOptions: string;
    psychologicalBasis: string;
  };
}

export interface MentalSimulationChoice {
  scenario: string;
  trigger: string;
  believability: ConfidenceLevel;
  rationale: {
    whyThisScenario: string;
    whyBelievable: string;
    howItRelatesToThem: string;
  };
}

export interface StrategyLayer {
  // What stage are they at?
  relationshipStage: {
    current: RelationshipStage;
    stageName: string;
    stageObjective: string;
  };

  // Chosen trust strategy
  trustStrategy: TrustStrategyChoice;

  // Chosen inverse incentive
  inverseIncentive: {
    statement: string;
    rationale: {
      whyThis: string;
      psychologicalEffect: string;
    };
  };

  // Chosen mental simulation
  mentalSimulation: MentalSimulationChoice;

  // Chosen micro commitment
  microCommitment: MicroCommitmentChoice;

  // Overall strategic rationale
  overallRationale: {
    whyWeChoseThisStage: string;
    whatWeHopeToAchieve: string;
    measurableObjective: string; // "Advance from Stage X to Stage Y"
  };
}

// ============================================================================
// LAYER 4: COMMUNICATIONS (RENDERED OUTPUTS)
// ============================================================================

export interface CommunicationRendering {
  channel: "email" | "sms" | "linkedin" | "voice-script" | "letter" | "whatsapp";
  format: {
    length: number;
    wordCount?: number;
    format_specific_details?: string;
  };
  content: {
    subject?: string; // Email only
    body: string;
    callToAction?: string;
  };
  rendering_rationale: {
    whyThisFormat: string; // Why SMS vs email for this stage?
    channelSpecificAdaptations: string[];
  };
}

export interface CommunicationsLayer {
  primary: CommunicationRendering; // Which channel is primary?
  alternatives?: CommunicationRendering[]; // Other channels available
  channelReasoning: {
    whyEmailFirst: string;
    whenToUseSMS: string;
    whenToUseLinkedIn: string;
    whenToUseVoice: string;
  };
}

// ============================================================================
// LAYER 5: TIMELINE (STAGE PROGRESSION)
// ============================================================================

export interface TimelineEntry {
  stage: RelationshipStage;
  stageName: string;
  objective: string;
  estimatedDuration?: string;
  triggerForNextStage: string;
  whatSuccessLooksLike: string;
}

export interface TimelineLayer {
  currentStage: TimelineEntry;
  nextStage: TimelineEntry;
  fullJourney: TimelineEntry[];
  progressionMetrics: {
    currentMilestone: string;
    nextMilestone: string;
    estimatedTimeToNext: string;
  };
}

// ============================================================================
// LAYER 6: OPERATOR GUIDANCE (EXPLAINABILITY)
// ============================================================================

export interface OperatorGuidanceLayer {
  // Answer the question: "Why did the AI decide to send this?"
  executiveSummary: {
    whoTheyAre: string; // 1-2 sentences
    whyWeThinkTheyNeedUs: string; // 1-2 sentences
    whatWereTrying: string; // 1-2 sentences
    measurableObjective: string; // "Move from Stage 1 to Stage 2"
  };

  // What operators should know
  contextForOperator: {
    keyFactsToRemember: string[];
    criticalAssumptions: string[]; // What might be wrong?
    whatIfTheyAsk: string; // How to handle objections
  };

  // What happens next
  nextSteps: {
    ifTheyReply: string;
    ifTheyIgnore: string; // When to follow up?
    ifTheyObjectToOffer: string;
  };

  // Monitoring
  whatToMonitorFor: {
    successSignals: string[];
    failureSignals: string[];
    actionableMetrics: string[];
  };
}

// ============================================================================
// LAYER 2.5: EVIDENCE (BACKING EVERY INFERENCE)
// ============================================================================

export interface EvidenceLayer {
  // Complete audit trail of where conclusions came from
  allEvidence: EvidencePoint[];

  // Map of inference → evidence
  inferenceMap: {
    inference: string; // The claim
    supportingEvidenceIds: string[]; // References to allEvidence array
    aggregateConfidence: number;
  }[];

  // Source quality assessment
  sourceQuality: {
    source: EvidenceSource;
    reliability: ConfidenceLevel;
    sampleSize: number; // How many pieces of evidence from this source?
    lastUpdated?: string;
  }[];

  // Transparency: What we DON'T have evidence for yet
  evidenceGaps: {
    topic: string; // What would be good to know?
    why: string; // Why would this matter?
    howToObtain?: string; // Where could we get this?
  }[];
}

// ============================================================================
// MAIN: RELATIONSHIP INTELLIGENCE OBJECT
// ============================================================================

export interface RelationshipIntelligenceObject {
  // Identification
  prospectId: string;
  businessName: string;
  generatedAt: string;
  generatedBy: "business-relationship-engine";

  // The 7 layers (in reasoning order)
  facts: FactsLayer;
  evidence: EvidenceLayer; // NEW: Layer 2.5 - Backing for all inferences
  reasoning: ReasoningLayer;
  strategy: StrategyLayer;
  communications: CommunicationsLayer;
  timeline: TimelineLayer;
  operatorGuidance: OperatorGuidanceLayer;

  // System metadata
  metadata: {
    version: "1.0";
    schema: "relationship-intelligence-v1";
    confidenceScore: number; // 0-100: How confident is this reasoning?
    lastUpdated: string;
    historyCount: number; // How many interactions so far?
  };

  // Explainability: Can the operator answer "Why?" without reading the email?
  explainability: {
    whyThisBusiness: string; // Why are we reaching out?
    whyThisStage: string; // Why is this the right stage?
    whyThisStrategy: string; // Why this trust approach?
    whyThisCommunication: string; // Why this message format?
    whyNow: string; // Why are we contacting them now?
    measurableSuccess: string; // How do we know if it worked?
  };
}

// ============================================================================
// UTILITIES
// ============================================================================

export function createRelationshipIntelligenceObject(
  prospectId: string,
  businessName: string,
  facts: FactsLayer,
  reasoning: ReasoningLayer,
  strategy: StrategyLayer,
  communications: CommunicationsLayer,
  timeline: TimelineLayer,
  operatorGuidance: OperatorGuidanceLayer
): RelationshipIntelligenceObject {
  return {
    prospectId,
    businessName,
    generatedAt: new Date().toISOString(),
    generatedBy: "business-relationship-engine",

    facts,
    reasoning,
    strategy,
    communications,
    timeline,
    operatorGuidance,

    metadata: {
      version: "1.0",
      schema: "relationship-intelligence-v1",
      confidenceScore: calculateConfidenceScore(facts, reasoning),
      lastUpdated: new Date().toISOString(),
      historyCount: 1,
    },

    explainability: {
      whyThisBusiness: operatorGuidance.executiveSummary.whoTheyAre,
      whyThisStage: strategy.relationshipStage.stageObjective,
      whyThisStrategy: strategy.trustStrategy.rationale.whyThisApproach,
      whyThisCommunication: communications.channelReasoning.whyEmailFirst,
      whyNow: strategy.overallRationale.whatWeHopeToAchieve,
      measurableSuccess: strategy.overallRationale.measurableObjective,
    },
  };
}

function calculateConfidenceScore(facts: FactsLayer, reasoning: ReasoningLayer): number {
  // Score based on data quality and reasoning strength
  let score = 50; // Base score

  // Increase for data quality
  if (facts.dataQuality.completeness === "high") score += 15;
  if (facts.dataQuality.completeness === "medium") score += 8;

  // Increase for verified facts
  if (facts.dataQuality.verificationLevel === "verified") score += 15;
  if (facts.dataQuality.verificationLevel === "likely") score += 8;

  // Increase for strong reasoning
  const highConfidenceNeeds = reasoning.potentialDeliveryNeeds.filter(
    (n) => n.likelihood === "high"
  ).length;
  score += Math.min(highConfidenceNeeds * 5, 20);

  // Cap at 100
  return Math.min(score, 100);
}

// ============================================================================
// VALIDATION: COMPLETENESS & CONSISTENCY
// ============================================================================

export interface ValidationResult {
  isComplete: boolean;
  isConsistent: boolean;
  errors: string[];
  warnings: string[];
}

export function validateRelationshipIntelligenceObject(
  obj: RelationshipIntelligenceObject
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // LAYER 1: FACTS validation
  if (!obj.facts.businessName || !obj.facts.industry || !obj.facts.location) {
    errors.push("FACTS: Missing required business information");
  }
  if (obj.facts.observedIndicators.length === 0) {
    warnings.push("FACTS: No observed indicators recorded");
  }

  // LAYER 2.5: EVIDENCE validation
  if (obj.evidence.allEvidence.length === 0) {
    errors.push("EVIDENCE: No evidence points recorded for inferences");
  }
  if (obj.evidence.inferenceMap.length === 0) {
    errors.push("EVIDENCE: No inference map (disconnected evidence)");
  }

  // Check evidence consistency
  for (const inference of obj.evidence.inferenceMap || []) {
    if (inference.supportingEvidenceIds.length === 0) {
      errors.push(`EVIDENCE: Inference "${inference.inference}" has no supporting evidence`);
    }
    if (inference.aggregateConfidence < 0 || inference.aggregateConfidence > 1) {
      errors.push(`EVIDENCE: Confidence score out of range (0-1): ${inference.aggregateConfidence}`);
    }
  }

  // LAYER 3: REASONING validation
  if (!obj.reasoning.whyTheyMightNeedUs || !obj.reasoning.whyTheyMightNeedUs.supporting_evidence) {
    errors.push("REASONING: Missing 'why they might need us' with evidence");
  }
  if (obj.reasoning.potentialDeliveryNeeds.length === 0) {
    errors.push("REASONING: No potential delivery needs identified");
  }

  // Check evidence backing for inferences
  for (const need of obj.reasoning.potentialDeliveryNeeds) {
    if (need.operationalScenarios.length === 0) {
      errors.push(`REASONING: Delivery need "${need.deliveryType}" has no scenarios`);
    }
  }

  // LAYER 4: STRATEGY validation
  if (!obj.strategy.relationshipStage || !obj.strategy.trustStrategy) {
    errors.push("STRATEGY: Missing relationship stage or trust strategy");
  }
  if (!obj.strategy.overallRationale.measurableObjective) {
    errors.push("STRATEGY: Missing measurable objective");
  }

  // LAYER 5: COMMUNICATIONS validation
  if (!obj.communications.primary || !obj.communications.primary.content.body) {
    errors.push("COMMUNICATIONS: No primary communication rendered");
  }

  // LAYER 6: TIMELINE validation
  if (!obj.timeline.currentStage || !obj.timeline.nextStage) {
    errors.push("TIMELINE: Missing current or next stage");
  }

  // LAYER 7: OPERATOR GUIDANCE validation
  if (!obj.operatorGuidance.executiveSummary) {
    errors.push("OPERATOR_GUIDANCE: Missing executive summary");
  }

  // EXPLAINABILITY validation
  if (!obj.explainability.whyThisBusiness || !obj.explainability.measurableSuccess) {
    errors.push("EXPLAINABILITY: Missing key explainability fields");
  }

  // Cross-layer consistency checks
  // Evidence should back reasoning
  if (obj.evidence.allEvidence.length < obj.reasoning.potentialDeliveryNeeds.length) {
    warnings.push(
      "CONSISTENCY: Fewer evidence points than inferred needs - may lack backing"
    );
  }

  // Strategy should reference reasoning
  const strategyMentionsReasoning = obj.strategy.overallRationale.whyWeChoseThisStage
    .toLowerCase()
    .includes(obj.reasoning.whyTheyMightNeedUs.conclusion.toLowerCase());
  if (!strategyMentionsReasoning) {
    warnings.push("CONSISTENCY: Strategy doesn't clearly reference reasoning");
  }

  return {
    isComplete: errors.length === 0,
    isConsistent: errors.length === 0 && warnings.length === 0,
    errors,
    warnings,
  };
}

export function getExplainabilityScore(obj: RelationshipIntelligenceObject): number {
  // How explainable is this reasoning to an operator?
  const factCount = obj.facts.observedIndicators.length;
  const reasoningDepth = obj.reasoning.potentialDeliveryNeeds.length;
  const strategyClarity = obj.strategy.trustStrategy.rationale.whyThisApproach.length;

  return Math.min(
    (factCount * 10 + reasoningDepth * 15 + Math.min(strategyClarity / 50, 25)) / 50,
    100
  );
}
