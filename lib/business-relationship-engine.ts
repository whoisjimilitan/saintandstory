/**
 * BUSINESS RELATIONSHIP ENGINE (CORE)
 *
 * Replaces V3 Email Reasoning Engine
 *
 * OBJECTIVE: Build genuine business relationships through strategic communication
 * NOT: Sell services in first email
 *
 * Email is ONE OUTPUT of relationship reasoning, not the primary product.
 *
 * PIPELINE:
 * 1. Who is this business? (discovery analysis)
 * 2. Why would they need us? (operational inference)
 * 3. Relationship stage? (0-6 progression)
 * 4. Trust strategy (lower resistance, build credibility)
 * 5. Inverse incentive (honest qualification)
 * 6. Mental simulation (believable future scenario)
 * 7. Micro commitment (smallest ask possible)
 * 8a. Permission line (Stage 1 only - based on behavioral patterns)
 * 8b. Generate communication (ONLY after steps 1-7)
 */

import { generatePermissionLine, type IndustryType } from "./behavioral-pattern-map";
import { predictInternalDialogue, type InternalDialogue } from "./internal-dialogue-predictor";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

export interface BusinessProfile {
  name: string;
  industry: string;
  location: string;
  size: "solo" | "small" | "medium" | "large";
  contactName?: string;

  // Discovery signals
  discoveryEvidence: {
    operationalIndicators: string[];
    growthSignals: string[];
    currentSolutions: string[];
    painPoints: string[];
  };
}

export interface RelationshipReasoning {
  // Step 1: Business analysis
  businessAnalysis: {
    industry: string;
    location: string;
    size: string;
    likelyDeliveryActivity: string;
  };

  // Step 2: Delivery needs inference
  potentialNeeds: {
    deliveryType: DeliveryNeed;
    realisticScenario: string;
    evidenceBase: string;
  }[];

  // Step 3: Current stage
  relationshipStage: {
    current: RelationshipStage;
    stageName: string;
    stageObjective: string;
  };

  // Step 4: Trust strategy
  trustStrategy: {
    approach: string;
    trustSignal: string;
    honestStatement: string;
  };

  // Step 5: Inverse incentive
  inverseIncentive: {
    statement: string;
    purpose: "reduce-pressure" | "honest-qualification";
  };

  // Step 6: Mental simulation
  mentalSimulation: {
    scenario: string;
    trigger: string;
    believability: "high" | "medium" | "low";
  };

  // Step 7: Micro commitment
  microCommitment: {
    ask: string;
    responseOptions: string[];
    cognitiveLoad: "minimal" | "low" | "medium";
  };

  // Step 8a: Permission line (Stage 1 only)
  permissionLine?: {
    text: string;
    appliesAtStage: RelationshipStage;
    basedOnBehavioralPattern: string;
  };

  // Step 8b: Internal dialogue prediction (BEFORE email generation)
  internalDialogue?: InternalDialogue;

  // Step 8c: Email generation parameters
  communicationParams: {
    targetWordCount: number;
    tone: "conversational" | "professional" | "consultative";
    optimizedFor: "reply" | "engagement" | "relationship";
  };
}

export interface RelationshipCommunication {
  reasoning: RelationshipReasoning;
  email: {
    subject: string;
    body: string;
    wordCount: number;
  };
  stageProgression: {
    currentStage: RelationshipStage;
    nextStage: RelationshipStage;
    triggerForProgression: string;
  };
  metadata: {
    generatedAt: string;
    industry: string;
    relationshipObjective: string;
  };
}

// ============================================================================
// STEP 1: BUSINESS ANALYSIS
// ============================================================================

function analyzeBusinessProfile(profile: BusinessProfile): RelationshipReasoning["businessAnalysis"] {
  return {
    industry: profile.industry,
    location: profile.location,
    size: profile.size,
    likelyDeliveryActivity: inferDeliveryActivity(profile),
  };
}

function inferDeliveryActivity(profile: BusinessProfile): string {
  const indicators = profile.discoveryEvidence.operationalIndicators;

  // Infer realistic delivery activity based on industry and signals
  const activityMap: Record<string, string> = {
    "law-firm": "Time-sensitive document delivery, court filings, client materials",
    "ecommerce": "Same-day shipping, overflow orders, peak-period capacity",
    "healthcare": "Medical supplies, temperature-controlled items, urgent deliveries",
    "manufacturing": "Supply chain overflow, scheduled shipments, long-haul transport",
    "retail": "Stock replenishment, customer pickups, same-day delivery",
    "logistics": "Route overflow, temporary driver needs, dedicated dispatch",
    "restaurant": "Catering supplies, emergency stock, time-sensitive ingredients",
    "professional-services": "Client documents, equipment, urgent deliveries",
  };

  return activityMap[profile.industry.toLowerCase()] ||
    "Potential delivery and logistics needs based on operational size and growth";
}

// ============================================================================
// STEP 2: DELIVERY NEEDS INFERENCE
// ============================================================================

function inferDeliveryNeeds(profile: BusinessProfile): RelationshipReasoning["potentialNeeds"] {
  const needs: RelationshipReasoning["potentialNeeds"] = [];

  // Never invent pain. Infer ONLY from evidence or common operational realities.
  const industryNeeds: Record<string, DeliveryNeed[]> = {
    "law-firm": ["same-day-courier", "scheduled-delivery", "temperature-controlled"],
    "ecommerce": ["same-day-courier", "overflow-capacity", "scheduled-delivery"],
    "healthcare": ["temperature-controlled", "same-day-courier", "pickup-service"],
    "manufacturing": ["long-haul-transport", "overflow-capacity", "scheduled-delivery"],
    "logistics": ["overflow-capacity", "dedicated-driver", "regular-route-driver"],
    "retail": ["scheduled-delivery", "pickup-service", "overflow-capacity"],
  };

  const industryKey = profile.industry.toLowerCase();
  const potentialTypes = industryNeeds[industryKey] || ["scheduled-delivery"];

  potentialTypes.forEach((type) => {
    needs.push({
      deliveryType: type,
      realisticScenario: generateRealisticScenario(profile.industry, type),
      evidenceBase: profile.discoveryEvidence.operationalIndicators.join("; ") || "industry norms",
    });
  });

  return needs;
}

function generateRealisticScenario(industry: string, deliveryType: DeliveryNeed): string {
  const scenarios: Record<string, Record<DeliveryNeed, string>> = {
    "law-firm": {
      "same-day-courier": "Urgent court filing needs same-day delivery to courthouse",
      "scheduled-delivery": "Regular client document transfers between offices",
      "overflow-capacity": "Peak case workload requires additional courier capacity",
      "temporary-driver": "Staff absence requires temporary driver coverage",
      "dedicated-driver": "Regular client has ongoing delivery needs",
      "regular-route-driver": "Established regular delivery schedule between locations",
      "long-haul-transport": "Inter-city client document transfers",
      "temperature-controlled": "Temperature-sensitive legal exhibit transport",
      "pickup-service": "Scheduled pickup of documents from clients",
    },
    "ecommerce": {
      "same-day-courier": "Same-day customer delivery during peak season",
      "scheduled-delivery": "Regular distribution to fulfillment centers",
      "overflow-capacity": "Black Friday / peak trading period overflow",
      "temporary-driver": "Seasonal surge requires additional drivers",
      "dedicated-driver": "Regular high-volume customer needs dedicated service",
      "regular-route-driver": "Daily drops to distribution partners",
      "long-haul-transport": "National stock transfers",
      "temperature-controlled": "Temperature-sensitive products (food, beauty)",
      "pickup-service": "Customer returns and pickups",
    },
  };

  return scenarios[industry.toLowerCase()]?.[deliveryType] ||
    `${industry} business requires ${deliveryType} services during normal operations`;
}

// ============================================================================
// STEP 3: RELATIONSHIP STAGE ASSESSMENT
// ============================================================================

export function assessRelationshipStage(
  profile: BusinessProfile,
  history?: { hasReplied?: boolean; hasUsedService?: boolean; isRegularCustomer?: boolean }
): RelationshipStage {
  if (history?.isRegularCustomer) return 4; // Repeat deliveries
  if (history?.hasUsedService) return 3; // First delivery complete
  if (history?.hasReplied) return 2; // Reply received
  return 1; // Fresh prospect, earn reply
}

function getStageObjective(stage: RelationshipStage): string {
  const objectives: Record<RelationshipStage, string> = {
    0: "Identify and analyze prospect",
    1: "Earn a genuine reply (yes/maybe/no)",
    2: "Become trusted backup supplier",
    3: "Complete first delivery successfully",
    4: "Establish repeat delivery pattern",
    5: "Qualify for dedicated driver conversation",
    6: "Become long-term logistics partner",
  };
  return objectives[stage];
}

function getStageName(stage: RelationshipStage): string {
  const names: Record<RelationshipStage, string> = {
    0: "Unknown",
    1: "Earn Reply",
    2: "Backup Supplier",
    3: "First Delivery",
    4: "Repeat Customer",
    5: "Dedicated Driver",
    6: "Strategic Partner",
  };
  return names[stage];
}

// ============================================================================
// STEP 4: TRUST STRATEGY
// ============================================================================

function generateTrustStrategy(profile: BusinessProfile, stage: RelationshipStage) {
  const strategies = {
    1: {
      approach: "Remove commitment barriers",
      trustSignal: "We've already set up a free account (no obligation, no cost)",
      honestStatement: "If you already have a courier you trust, keep using them.",
    },
    2: {
      approach: "Position as contingency, not replacement",
      trustSignal: "We understand most businesses need a backup option",
      honestStatement: "We'd rather become your backup than replace who already serves you.",
    },
    3: {
      approach: "Prove through delivery",
      trustSignal: "Let's handle your first job and show you what reliable looks like",
      honestStatement: "Your current provider might work fine. We're here when they can't.",
    },
    4: {
      approach: "Consistency builds trust",
      trustSignal: "We show up. Every time. Predictable pricing, predictable service.",
      honestStatement: "Trust is earned through repeated reliable delivery, not promises.",
    },
    5: {
      approach: "Strategic understanding",
      trustSignal: "We've learned your business. We know your peak periods and challenges.",
      honestStatement: "A dedicated driver only makes sense if we've proven ourselves.",
    },
    6: {
      approach: "Long-term partnership mindset",
      trustSignal: "We're invested in your success, not just this transaction",
      honestStatement: "True logistics partners align incentives for mutual growth.",
    },
  };

  const stageStrategy = strategies[stage as keyof typeof strategies] || strategies[1];

  return {
    approach: stageStrategy.approach,
    trustSignal: stageStrategy.trustSignal,
    honestStatement: stageStrategy.honestStatement,
  };
}

// ============================================================================
// STEP 5: INVERSE INCENTIVE
// ============================================================================

function generateInverseIncentive(profile: BusinessProfile, stage: RelationshipStage) {
  const inverses: Record<RelationshipStage, string> = {
    0: "",
    1: `If your current courier never lets you down, this probably isn't relevant.`,
    2: `If your current drivers comfortably handle every situation, you can ignore this.`,
    3: `Only if your current provider occasionally misses deadlines or overcharges.`,
    4: `Only if you sometimes need a backup when your primary courier is overwhelmed.`,
    5: `Only if you have regular, predictable delivery needs that justify dedicated service.`,
    6: `Only if your logistics are becoming complex enough to need strategic partnership.`,
  };

  return {
    statement: inverses[stage],
    purpose: "reduce-pressure" as const,
  };
}

// ============================================================================
// STEP 6: MENTAL SIMULATION
// ============================================================================

function generateMentalSimulation(
  profile: BusinessProfile,
  potentialNeeds: RelationshipReasoning["potentialNeeds"],
  stage: RelationshipStage
) {
  // Use most realistic delivery need for this business
  const primaryNeed = potentialNeeds[0];

  const scenarios: Record<RelationshipStage, { scenario: string; trigger: string }> = {
    0: { scenario: "", trigger: "" },
    1: {
      scenario: `Last week: ${primaryNeed.realisticScenario}. It'll happen again.`,
      trigger: "Time-sensitive operational need",
    },
    2: {
      scenario: `Your current courier is fully booked, but you have ${primaryNeed.realisticScenario.toLowerCase()}`,
      trigger: "Capacity overflow or last-minute need",
    },
    3: {
      scenario: `You've already used us once. Now your regular needs are growing, and you need a backup.`,
      trigger: "Repeated similar situations",
    },
    4: {
      scenario: `You're handling this delivery pattern regularly, and you want predictable pricing and reliable service.`,
      trigger: "Operational routine establishment",
    },
    5: {
      scenario: `Your delivery volume justifies having a dedicated driver who knows your business.`,
      trigger: "Predictable recurring need",
    },
    6: {
      scenario: `Your logistics are complex enough that you need a strategic partner who understands your full supply chain.`,
      trigger: "Business growth and complexity",
    },
  };

  const simulation = scenarios[stage];

  return {
    scenario: simulation.scenario,
    trigger: simulation.trigger,
    believability: (stage <= 2 ? "high" : stage <= 4 ? "medium" : "low") as "high" | "medium" | "low",
  };
}

// ============================================================================
// STEP 7: MICRO COMMITMENT
// ============================================================================

function generateMicroCommitment(stage: RelationshipStage) {
  const commitments: Record<RelationshipStage, { ask: string; responseOptions: string[] }> = {
    0: { ask: "", responseOptions: [] },
    1: {
      ask: "Do you see yourself ever using this account?",
      responseOptions: ["yes", "maybe", "no"],
    },
    2: {
      ask: "Would you try us on your next overflow delivery?",
      responseOptions: ["yes", "maybe", "no"],
    },
    3: {
      ask: "Should we set up your regular delivery schedule?",
      responseOptions: ["yes", "let's discuss", "not yet"],
    },
    4: {
      ask: "Are you happy with how that's working?",
      responseOptions: ["yes", "mostly", "let's talk"],
    },
    5: {
      ask: "Should we explore a dedicated driver arrangement?",
      responseOptions: ["yes", "maybe", "not now"],
    },
    6: {
      ask: "Ready to build a long-term logistics partnership?",
      responseOptions: ["yes", "let's explore", "not yet"],
    },
  };

  const commitment = commitments[stage];

  return {
    ask: commitment.ask,
    responseOptions: commitment.responseOptions,
    cognitiveLoad: (stage <= 2 ? "minimal" : stage <= 4 ? "low" : "medium") as "minimal" | "low" | "medium",
  };
}

// ============================================================================
// STEP 8a: PERMISSION LINE (Stage 1 ONLY)
// ============================================================================

function generatePermissionLineForStage(
  stage: RelationshipStage,
  profile: BusinessProfile
): RelationshipReasoning["permissionLine"] | undefined {
  // Permission line ONLY applies to Stage 1 (cold outreach)
  // Stage 2+ relationships flow naturally without permission
  if (stage !== 1) {
    return undefined;
  }

  const permissionText = generatePermissionLine(profile.industry as IndustryType, profile.location);

  return {
    text: permissionText,
    appliesAtStage: 1,
    basedOnBehavioralPattern: profile.industry,
  };
}

// ============================================================================
// STEP 8b: EMAIL GENERATION
// ============================================================================

function generateCommunicationEmail(reasoning: RelationshipReasoning): RelationshipCommunication["email"] {
  const stage = reasoning.relationshipStage.current;
  const trust = reasoning.trustStrategy.honestStatement;
  const inverse = reasoning.inverseIncentive.statement;
  const simulation = reasoning.mentalSimulation.scenario;
  const commitment = reasoning.microCommitment;

  let body = "";

  switch (stage) {
    case 1:
      body = `Hi {{businessName}},

It's {{day}}: your business requires ${reasoning.businessAnalysis.likelyDeliveryActivity}.

${simulation}

${trust}

${inverse}

${reasoning.trustStrategy.trustSignal}

If this resonates, just reply with one word: ${commitment.responseOptions.join(", or ")}.

Best,
James
Saint & Story`;
      break;

    case 2:
      body = `Hi there,

I remember you get inquiries about ${reasoning.potentialNeeds[0]?.realisticScenario.toLowerCase()}.

${reasoning.trustStrategy.honestStatement}

That's why we built our backup option: for when your primary courier hits capacity.

${inverse}

When it happens, we're here. Reply with: ${commitment.responseOptions.join(", or ")}.

Best,
James
Saint & Story`;
      break;

    case 3:
      body = `Great to hear from you.

Ready to move forward with that first delivery?

I've kept that account open and ready. No pressure—this is just a test run.

Let's prove ourselves: ${commitment.ask}

Best,
James
Saint & Story`;
      break;

    default:
      body = `Hi there,

Checking in. Still interested in exploring delivery partnership for your ${reasoning.businessAnalysis.industry} business?

${commitment.ask}

Best,
James
Saint & Story`;
  }

  const wordCount = body.split(/\s+/).length;

  return {
    subject: generateSubject(stage, reasoning.businessAnalysis.industry),
    body: body.trim(),
    wordCount,
  };
}

function generateSubject(stage: RelationshipStage, industry: string): string {
  const subjects: Record<RelationshipStage, Record<string, string>> = {
    0: {},
    1: {
      default: "When your courier needs a backup",
      "law-firm": "For those urgent court deadlines",
      "ecommerce": "For your overflow orders",
    },
    2: {
      default: "We're here when your main courier isn't",
      "law-firm": "Your backup is ready",
      "ecommerce": "Backup capacity is live",
    },
    3: {
      default: "Ready for your first delivery",
      "law-firm": "Let's handle that delivery",
      "ecommerce": "First order is ready",
    },
    4: {
      default: "How's the delivery partnership working?",
      "law-firm": "Still happy with our service?",
      "ecommerce": "Feedback on recent deliveries?",
    },
    5: {
      default: "Dedicated driver conversation",
      "law-firm": "Dedicated driver for your practice?",
      "ecommerce": "Let's talk dedicated dispatch",
    },
    6: {
      default: "Let's build something bigger",
      "law-firm": "Strategic logistics partnership",
      "ecommerce": "Long-term growth partnership",
    },
  };

  const stageSubjects = subjects[stage] || subjects[1];
  return stageSubjects[industry.toLowerCase()] || stageSubjects["default"] || "Saint & Story";
}

// ============================================================================
// MAIN ENGINE: COMPLETE REASONING PIPELINE
// ============================================================================

export function generateRelationshipCommunication(
  profile: BusinessProfile,
  history?: { hasReplied?: boolean; hasUsedService?: boolean; isRegularCustomer?: boolean }
): RelationshipCommunication {
  // STEP 1: Analyze business profile
  const businessAnalysis = analyzeBusinessProfile(profile);

  // STEP 2: Infer delivery needs (never invent pain)
  const potentialNeeds = inferDeliveryNeeds(profile);

  // STEP 3: Assess relationship stage
  const currentStage = assessRelationshipStage(profile, history);

  // STEP 4: Generate trust strategy
  const trustStrategy = generateTrustStrategy(profile, currentStage);

  // STEP 5: Generate inverse incentive
  const inverseIncentive = generateInverseIncentive(profile, currentStage);

  // STEP 6: Generate mental simulation
  const mentalSimulation = generateMentalSimulation(profile, potentialNeeds, currentStage);

  // STEP 7: Generate micro commitment
  const microCommitment = generateMicroCommitment(currentStage);

  // STEP 8a: Generate permission line (Stage 1 only)
  const permissionLine = generatePermissionLineForStage(currentStage, profile);

  // STEP 8b: Predict internal dialogue BEFORE email generation
  // This is the blueprint. Email merely manifests this dialogue.
  const internalDialogue = predictInternalDialogue(
    currentStage,
    profile.industry,
    profile.location,
    permissionLine?.text
  );

  // BUILD COMPLETE REASONING
  const reasoning: RelationshipReasoning = {
    businessAnalysis,
    potentialNeeds,
    relationshipStage: {
      current: currentStage,
      stageName: getStageName(currentStage),
      stageObjective: getStageObjective(currentStage),
    },
    trustStrategy,
    inverseIncentive,
    mentalSimulation,
    microCommitment,
    permissionLine,
    internalDialogue,
    communicationParams: {
      targetWordCount: currentStage === 1 ? 60 : currentStage === 2 ? 75 : 50,
      tone: (currentStage <= 2 ? "conversational" : "professional") as "conversational" | "professional",
      optimizedFor: "reply",
    },
  };

  // STEP 8c: Only AFTER all reasoning AND dialogue prediction, generate email
  const email = generateCommunicationEmail(reasoning);

  // STAGE PROGRESSION LOGIC
  const nextStage = Math.min(6, currentStage + 1) as RelationshipStage;
  const triggerForProgression =
    currentStage === 1 ? "Reply received (yes/maybe)" :
    currentStage === 2 ? "Agreed to first delivery" :
    currentStage === 3 ? "First delivery completed" :
    currentStage === 4 ? "3+ deliveries completed" :
    currentStage === 5 ? "Dedicated driver agreement signed" :
    "Strategic partnership established";

  return {
    reasoning,
    email,
    stageProgression: {
      currentStage,
      nextStage,
      triggerForProgression,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      industry: profile.industry,
      relationshipObjective: getStageObjective(currentStage),
    },
  };
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export function getStageDescription(stage: RelationshipStage): string {
  return `Stage ${stage}: ${getStageName(stage)} - ${getStageObjective(stage)}`;
}
