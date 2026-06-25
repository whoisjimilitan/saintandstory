/**
 * BUSINESS RELATIONSHIP ENGINE (CORE)
 *
 * OBJECTIVE: Provide rich reasoning context for communication
 * NOT: Prescribe what to say
 *
 * This engine outputs REASONING CONTEXT.
 * Layer 2 (Reasoning Engine) uses this context to generate communication.
 *
 * REASONING PIPELINE (Context Provider):
 * 1. Who is this business? (discovery analysis)
 * 2. Why would they need us? (operational inference)
 * 3. Relationship stage? (0-6 progression)
 * 4. Trust context (what's genuinely true about trust)
 * 5. Qualification context (what's genuinely true about need)
 * 6. Scenario context (realistic situation)
 * 7. Ask context (natural smallest ask)
 *
 * Layer 2 then:
 * - Uses this context to evaluate 10 opening formulations
 * - Scores each for PD × Trust × Authenticity
 * - Ranks top 3
 * - Writes email using best fit
 * - Passes through Layer 3 (Trust Validation)
 */

import { generatePermissionLine, type IndustryType } from "./behavioral-pattern-map";
import { predictInternalDialogue, type InternalDialogue } from "./internal-dialogue-predictor";
import { generateEmailWithPD } from "./communication-decision-engine";

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

  // Step 4: Trust context (what's genuinely true about trust here)
  // NOT what to say, but what to understand
  trustContext: {
    whatEarnsTrust: string; // Observable fact that builds trust
    whatBreaksTrust: string; // Observable fact that damages trust
    genuineStrength: string; // Real reason to believe us
  };

  // Step 5: Qualification context (what's genuinely true about their need)
  // NOT an "inverse incentive statement", but context about genuine need
  qualificationContext: {
    doTheyNeedUs: boolean; // Genuinely true answer
    reasoning: string; // Why or why not
    ifYes: string; // What problem they have
    ifNo: string; // Why they don't need us
  };

  // Step 6: Scenario context (what's the realistic situation)
  // NOT a prescribed narrative, but the true situation
  scenarioContext: {
    likelyRealityForThem: string; // What's probably happening right now
    triggeringMoment: string; // When this becomes real
    howTheyFeel: string; // Emotional reality (not manufactured)
  };

  // Step 7: Ask context (what's the natural smallest ask)
  // NOT a micro commitment to force, but the genuine next step
  askContext: {
    naturalNextStep: string; // What naturally follows
    minimumCommitment: string; // Smallest possible request
    whyThisAsk: string; // Why this is the right ask
  };
}

export interface RelationshipCommunication {
  reasoning: RelationshipReasoning;
  email: {
    subject: string;
    body: string;
    wordCount: number;
    pdMetadata?: {
      averagePD: number;
      minPD: number;
      maxPD: number;
      totalFunctions: number;
      sentenceCount: number;
      qualityRating: "high" | "medium" | "low";
    };
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
// STEP 4: TRUST CONTEXT (What's genuinely true about trust)
// ============================================================================

function generateTrustContext(
  profile: BusinessProfile,
  stage: RelationshipStage
): typeof RelationshipReasoning.prototype.trustContext {
  const contexts: Record<RelationshipStage, Record<string, string>> = {
    1: {
      whatEarnsTrust:
        "We exist specifically for overflow. That's all we do. Not trying to replace anyone.",
      whatBreaksTrust:
        "Acting like we're their primary solution. Claiming we can do everything.",
      genuineStrength:
        "We only succeed if they succeed with us as backup. No hidden agenda.",
    },
    2: {
      whatEarnsTrust:
        "They've already replied. That's trust. Now we're proving we deliver.",
      whatBreaksTrust:
        "Changing our positioning or making new promises beyond backup.",
      genuineStrength: "We've earned their curiosity. Time to show up reliably.",
    },
    3: {
      whatEarnsTrust: "First delivery completed. Trust built through action, not words.",
      whatBreaksTrust: "Missing deadline or creating friction on first job.",
      genuineStrength:
        "Real experience together beats any trust signal we could claim.",
    },
    4: {
      whatEarnsTrust:
        "Pattern of reliability. We've shown up multiple times. Consistency.",
      whatBreaksTrust: "Single failure or inconsistency in service.",
      genuineStrength: "Behavior proves what words never can.",
    },
    5: {
      whatEarnsTrust:
        "Deep understanding of their peaks and valleys. We've adapted to them.",
      whatBreaksTrust: "Treating them like a generic customer.",
      genuineStrength: "We know their business better than some of their own team.",
    },
    6: {
      whatEarnsTrust: "Aligned incentives. We win when they win.",
      whatBreaksTrust: "Prioritizing revenue over their success.",
      genuineStrength:
        "Long-term partnership is only possible when goals align.",
    },
  };

  const stageContext = contexts[stage as keyof typeof contexts] || contexts[1];

  return {
    whatEarnsTrust: stageContext.whatEarnsTrust,
    whatBreaksTrust: stageContext.whatBreaksTrust,
    genuineStrength: stageContext.genuineStrength,
  };
}

// ============================================================================
// STEP 5: QUALIFICATION CONTEXT (What's genuinely true about their need)
// ============================================================================

function generateQualificationContext(
  profile: BusinessProfile,
  stage: RelationshipStage
): typeof RelationshipReasoning.prototype.qualificationContext {
  // Determine if they genuinely need us
  const needsUs = stage >= 2; // If they've replied or moved forward, likely they need us

  const contexts: Record<RelationshipStage, { ifYes: string; ifNo: string; reasoning: string }> = {
    0: {
      ifYes: "",
      ifNo: "",
      reasoning: "Too early to know.",
    },
    1: {
      ifYes: "Their main courier hits capacity or fails them regularly.",
      ifNo: "Their current courier is genuinely perfect. They've never had overflow issues.",
      reasoning:
        "Cold prospect. We know their industry but not their specific situation yet.",
    },
    2: {
      ifYes: "They've replied, which suggests they've experienced delivery problems.",
      ifNo:
        "They might be exploring options generally, not because of immediate need.",
      reasoning: "They engaged, which is a signal they've had friction.",
    },
    3: {
      ifYes: "They're ready to test, which means they've felt the pain.",
      ifNo: "Unlikely at this stage.",
      reasoning: "Movement to first delivery is strong signal of genuine need.",
    },
    4: {
      ifYes: "Multiple deliveries prove ongoing need.",
      ifNo: "Very unlikely.",
      reasoning: "Repeat usage = real need.",
    },
    5: {
      ifYes: "Scaling conversation means overflow is now a real constraint.",
      ifNo: "No.",
      reasoning: "Dedicated driver conversation only makes sense with proven overflow.",
    },
    6: {
      ifYes: "Partnership talk = they've moved past transactional.",
      ifNo: "No.",
      reasoning:
        "Long-term thinking only happens when backup has become essential.",
    },
  };

  const stageContext = contexts[stage as keyof typeof contexts] || contexts[1];

  return {
    doTheyNeedUs: needsUs,
    reasoning: stageContext.reasoning,
    ifYes: stageContext.ifYes,
    ifNo: stageContext.ifNo,
  };
}

// ============================================================================
// STEP 6: SCENARIO CONTEXT (What's the realistic situation)
// ============================================================================

function generateScenarioContext(
  profile: BusinessProfile,
  potentialNeeds: RelationshipReasoning["potentialNeeds"],
  stage: RelationshipStage
): typeof RelationshipReasoning.prototype.scenarioContext {
  const primaryNeed = potentialNeeds[0];

  const scenarios: Record<
    RelationshipStage,
    {
      likelyRealityForThem: string;
      triggeringMoment: string;
      howTheyFeel: string;
    }
  > = {
    0: {
      likelyRealityForThem: "",
      triggeringMoment: "",
      howTheyFeel: "",
    },
    1: {
      likelyRealityForThem: `They experience ${primaryNeed.realisticScenario.toLowerCase()} regularly.`,
      triggeringMoment: `When their primary courier is fully booked or unavailable.`,
      howTheyFeel:
        "Frustrated that they can't fulfill orders or deliver on time because of courier limits.",
    },
    2: {
      likelyRealityForThem: `They've had the experience: ${primaryNeed.realisticScenario.toLowerCase()}. It's happened more than once.`,
      triggeringMoment: `During their busiest periods, when they need backup capacity urgently.`,
      howTheyFeel:
        "Concerned that they don't have a reliable contingency when their main courier fails.",
    },
    3: {
      likelyRealityForThem: `They used us once and it worked. Now they're seeing a pattern of need.`,
      triggeringMoment: `When they face the same situation again and realize they need consistent backup.`,
      howTheyFeel:
        "More confident because they've seen us deliver. Starting to think about us as a regular option.",
    },
    4: {
      likelyRealityForThem: `This delivery pattern is now their normal. They're handling it regularly.`,
      triggeringMoment: `Every week when their volume exceeds their main courier's capacity.`,
      howTheyFeel:
        "Relieved that they have a backup they can count on. Thinking about making us more permanent.",
    },
    5: {
      likelyRealityForThem: `Their volume justifies having dedicated capacity just for them.`,
      triggeringMoment: `When they realize their growth is consistent enough for a dedicated driver.`,
      howTheyFeel:
        "Ready to invest in a more formal arrangement because the ROI is clear.",
    },
    6: {
      likelyRealityForThem: `Their entire supply chain is now a complex puzzle they're solving.`,
      triggeringMoment: `When they realize one logistics partner could handle their entire operation better.`,
      howTheyFeel:
        "Strategic. Thinking long-term about which partners are worth investing in deeply.",
    },
  };

  const scenario = scenarios[stage];

  return {
    likelyRealityForThem: scenario.likelyRealityForThem,
    triggeringMoment: scenario.triggeringMoment,
    howTheyFeel: scenario.howTheyFeel,
  };
}

// ============================================================================
// STEP 7: ASK CONTEXT (What's the natural smallest ask)
// ============================================================================

function generateAskContext(
  stage: RelationshipStage
): typeof RelationshipReasoning.prototype.askContext {
  const contexts: Record<
    RelationshipStage,
    {
      naturalNextStep: string;
      minimumCommitment: string;
      whyThisAsk: string;
    }
  > = {
    0: {
      naturalNextStep: "",
      minimumCommitment: "",
      whyThisAsk: "",
    },
    1: {
      naturalNextStep:
        "They reply with yes/maybe/no to let us know if this is even relevant.",
      minimumCommitment: "A single word: Yes, Maybe, or No",
      whyThisAsk:
        "At this stage, just knowing if they've experienced the problem is enough.",
    },
    2: {
      naturalNextStep:
        "They agree to use us for their next overflow delivery to test us.",
      minimumCommitment: "Commit to one test delivery",
      whyThisAsk:
        "Proof happens in action, not conversation. First delivery is the real test.",
    },
    3: {
      naturalNextStep:
        "If first delivery went well, they agree to set up regular use.",
      minimumCommitment: "Move from test to regular",
      whyThisAsk:
        "We've proven ourselves. Now it's about making it official and regular.",
    },
    4: {
      naturalNextStep:
        "They share feedback on how the arrangement is working for them.",
      minimumCommitment: "Honest conversation about what's working",
      whyThisAsk:
        "Ongoing partnership requires feedback. We need to know if we're actually solving their problem.",
    },
    5: {
      naturalNextStep: "They explore a dedicated driver arrangement.",
      minimumCommitment: "Explore the option of dedicated capacity",
      whyThisAsk:
        "Volume justifies more formal arrangement. No point asking without proof of need.",
    },
    6: {
      naturalNextStep:
        "They commit to a long-term strategic partnership arrangement.",
      minimumCommitment:
        "Discuss formal partnership terms and mutual goals",
      whyThisAsk:
        "At this level, both sides are aligned on the relationship being long-term.",
    },
  };

  const context = contexts[stage];

  return {
    naturalNextStep: context.naturalNextStep,
    minimumCommitment: context.minimumCommitment,
    whyThisAsk: context.whyThisAsk,
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

  // STEP 4-7: Generate context (not prescriptions)
  // These provide reasoning context for Layer 2, not communication prescriptions
  const trustContext = generateTrustContext(profile, currentStage);
  const qualificationContext = generateQualificationContext(profile, currentStage);
  const scenarioContext = generateScenarioContext(profile, potentialNeeds, currentStage);
  const askContext = generateAskContext(currentStage);

  // BUILD COMPLETE REASONING (Context Provider)
  const reasoning: RelationshipReasoning = {
    businessAnalysis,
    potentialNeeds,
    relationshipStage: {
      current: currentStage,
      stageName: getStageName(currentStage),
      stageObjective: getStageObjective(currentStage),
    },
    trustContext,
    qualificationContext,
    scenarioContext,
    askContext,
  };

  // Return reasoning context only
  // Email generation is Layer 2's responsibility
  return reasoning;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export function getStageDescription(stage: RelationshipStage): string {
  return `Stage ${stage}: ${getStageName(stage)} - ${getStageObjective(stage)}`;
}
