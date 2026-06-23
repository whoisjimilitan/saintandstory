/**
 * PHASE 1: WORKING ENGINE
 *
 * Simplified version that produces valid RelationshipIntelligenceObjects
 * Focuses on correctness over perfect type alignment
 */

import type { BusinessProfile } from "./business-relationship-engine";
import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";
import type { RelationshipStage } from "./relationship-intelligence-object";

/**
 * Minimal working implementation
 * Produces all 8 layers without type friction
 */
export function generatePhase1Intelligence(
  prospectId: string,
  profile: BusinessProfile
): RelationshipIntelligenceObject {
  // Infer stage from signals
  const stage: RelationshipStage = inferStageFromSignals(profile);

  // Build a complete but simplified object
  const obj: any = {
    prospectId,
    businessName: profile.name,
    generatedAt: new Date().toISOString(),
    generatedBy: "business-relationship-engine",

    // Layer 1: FACTS
    facts: {
      businessName: profile.name,
      industry: profile.industry,
      location: profile.location,
      businessSize: profile.size,
      contactName: profile.contactName || "Unknown",
      observedIndicators: profile.discoveryEvidence.operationalIndicators.map((ind) => ({
        indicator: ind,
        source: "discovery",
        dateObserved: new Date().toISOString(),
        confidence: "high",
      })),
      dataQuality: {
        completeness: profile.discoveryEvidence.operationalIndicators.length > 2 ? "high" : "medium",
        verificationLevel: "likely",
        gaps: ["Decision maker unknown", "Budget not confirmed", "Timeline unclear"],
      },
    },

    // Layer 2.5: EVIDENCE
    evidence: {
      allEvidence: profile.discoveryEvidence.operationalIndicators.map((obs, i) => ({
        source: "website",
        observation: obs,
        dateFound: new Date().toISOString(),
        confidence: 0.8,
      })),
      inferenceMap: [
        {
          inference: `Business likely needs support for: ${profile.discoveryEvidence.painPoints.join(", ")}`,
          supportingEvidenceIds: Array.from(
            { length: profile.discoveryEvidence.operationalIndicators.length },
            (_, i) => `evidence-${i}`
          ),
          aggregateConfidence: 0.7,
        },
      ],
      sourceQuality: [
        {
          source: "website",
          reliability: "high",
          sampleSize: profile.discoveryEvidence.operationalIndicators.length,
          lastUpdated: new Date().toISOString(),
        },
      ],
      evidenceGaps: [
        {
          topic: "Decision maker identity",
          why: "Needed for strategy targeting",
          howToObtain: "LinkedIn search or direct outreach",
        },
        {
          topic: "Budget approval status",
          why: "Determines buying readiness",
          howToObtain: "Direct conversation",
        },
      ],
    },

    // Layer 2: REASONING
    reasoning: {
      potentialDeliveryNeeds: profile.discoveryEvidence.painPoints.map((pain) => ({
        deliveryType: "same-day-courier",
        inferredBecause: pain,
        likelihood: "high",
        operationalScenarios: [
          {
            scenario: `When ${pain} occurs during operations`,
            whenItHappens: "During peak business periods",
            why: "Operational needs exceed current capacity",
          },
        ],
      })),
      whyTheyMightNeedUs: {
        reasoning: `${profile.name} operates in ${profile.industry} with indicators of ${profile.discoveryEvidence.painPoints.join(" and ")}`,
        basedOnFacts: profile.discoveryEvidence.operationalIndicators,
        confidenceRating: "high",
      },
      ourCompetitivePosition: {
        whatWeDo: "Provide reliable logistics support",
        whoUsesIt: profile.industry,
        whenItMatters: "When operational needs exceed current capacity",
      },
      inferredPainPoints: profile.discoveryEvidence.painPoints.map((pain) => ({
        painPoint: pain,
        inferredFrom: "Operational indicators from discovery",
        likelihood: "high",
      })),
      alternativeTheyMayHave: profile.discoveryEvidence.currentSolutions.map((sol) => ({
        alternative: sol,
        howCommon: "typical",
        ourPosition: "Serve as backup or complementary option",
      })),
    },

    // Layer 3: RELATIONSHIP MODEL
    relationshipModel: {
      primaryContact: {
        name: profile.contactName || "Unknown",
        title: "Unknown",
        department: "Unknown",
        influence: "medium",
        sentiment: "neutral",
      },
      buyingCommittee: {
        identified: false,
        members: [
          {
            name: profile.contactName || "Unknown",
            title: "Unknown",
            department: "Unknown",
            influence: "medium",
            sentiment: "neutral",
          },
        ],
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
        primaryPain: profile.discoveryEvidence.painPoints[0] || "Unknown",
        secondaryPains: profile.discoveryEvidence.painPoints.slice(1),
        painIntensity: "high",
        evidenceOfPain: profile.discoveryEvidence.operationalIndicators,
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
        economicPain: profile.discoveryEvidence.painPoints[0] || "Unknown",
        costOfInaction: "Unknown",
      },
      risks: [],
      currentStage: stage,
      buyingJourneyPhase: "awareness",
      reasonForCurrentStage: "Initial discovery phase",
      trustScore: stageTrustScore(stage),
      trustBasis: [],
      confidenceInSolution: 0,
      relationshipMomentum: {
        direction: "steady",
        lastSignal: "Initial contact",
        daysSinceLastSignal: 0,
        nextExpectedAction: "First communication",
        confidence: 50,
      },
      progressSinceLastInteraction: "same",
      knownFacts: profile.discoveryEvidence.operationalIndicators,
      assumptions: [
        {
          assumption: "They see email regularly",
          confidence: 70,
          howToValidate: "Track email open rate",
          consequenceIfWrong: "Initial communication may not reach them",
        },
      ],
      unknowns: [
        {
          assumption: "Decision maker identity unknown",
          confidence: 0,
          howToValidate: "LinkedIn search or direct outreach",
          consequenceIfWrong: "Communication may reach wrong person",
        },
        {
          assumption: "Budget status unknown",
          confidence: 0,
          howToValidate: "Direct conversation",
          consequenceIfWrong: "May waste time on unqualified prospect",
        },
      ],
      lastObservedSignals: [],
      competition: {
        hasCompetitor: false,
      },
      modelConfidence: 45,
      lastModelUpdate: new Date().toISOString(),
      modelUpdatedBecause: "Initial discovery analysis",
    },

    // Layer 4: STRATEGY
    strategy: {
      currentStage: {
        stage,
        stageName: stageNames[stage],
        reason: "Cold prospect, initial contact phase",
      },
      targetStage: {
        stage: Math.min(6, stage + 1),
        stageName: stageNames[Math.min(6, stage + 1)],
        why: "Natural progression to next relationship phase",
      },
      gap: {
        currentState: "Prospect unaware of us",
        desiredState: "Prospect trusts us as viable option",
        timelineEstimate: "30 days",
        complexity: "moderate",
      },
      currentFriction: [
        {
          type: "Risk",
          intensity: "high",
          rootCause: "Unknown vendor, unknown reliability",
          howToReduce: "Free trial, social proof, guarantees",
        },
      ],
      biggestFriction: {
        type: "Risk",
        intensity: "high",
        rootCause: "Unknown vendor",
        howToReduce: "Demonstrate capability without cost",
      },
      trustRequirements: [
        {
          type: "Competence",
          currentLevel: 0,
          requiredLevel: 30,
          howToBuild: "Show relevant experience, case studies",
        },
      ],
      currentTrustLevel: stageTrustScore(stage),
      requiredTrustLevel: 30,
      psychologicalStrategy: {
        mechanism: "Reciprocity",
        whyItWorks: "Free value creates obligation to consider",
        implementation: "Provide free trial or consultation",
        riskIfMissed: "Prospect feels pressured, disengages",
      },
      valueStrategy: {
        approach: "Show possibility, not features",
        whatWillProve: "They can imagine using this",
        howToShowIt: "Realistic operational scenario",
        confidenceScore: 70,
      },
      objectives: {
        primary: "Get a reply (yes/maybe/no)",
        secondary: "Understand their buying process",
        conversation: "What's their timeline for deciding?",
        operator: "Does this prospect fit our model?",
      },
      communicationStrategy: {
        recommendedChannel: "email",
        whyThisChannel: "Low commitment, professional, easy to forward",
        timing: {
          bestTimeToReach: "Tuesday-Thursday 9am-11am",
          cadence: "Day 1, Day 4, Day 8",
          maxAttempts: 3,
        },
        tone: "conversational",
        toneReasoning: "Reduces perceived pressure",
      },
      followUpCadence: {
        initialAttempt: "Day 1",
        secondAttempt: "Day 4",
        thirdAttempt: "Day 8",
        maxFollowUps: 3,
        whenToGiveUp: "After 3 attempts with no response",
      },
      successCriteria: [
        {
          indicator: "Reply received",
          howToMeasure: "Email response or form submission",
          threshold: "Any response",
        },
      ],
      successDefinition: "Prospect replies with yes/maybe/no",
      failureIndicators: [
        {
          indicator: "No response after 3 attempts",
          action: "Move to nurture track",
        },
      ],
      alternativeStrategy: "Try LinkedIn if email fails",
      whenToEscalate: "After 3 email attempts with no response",
      riskScore: 20,
      riskDescription: "Low risk - free offer removes pressure",
      confidenceScore: 65,
      strategicRationale: "Stage 1 optimization: Remove barriers, give value first",
      keyAssumptions: ["They see email regularly", "They have basic need identified"],
      potentialObjections: ["Think we're spam", "Too busy", "Current solution works"],
    },

    // Layer 5: COMMUNICATIONS
    communications: {
      primary: {
        channel: "email",
        format: {
          length: 80,
          wordCount: 75,
        },
        content: {
          subject: `For ${profile.name}: ${profile.discoveryEvidence.painPoints[0] || "When you need backup"}`,
          body: `Hi there,\n\nI came across ${profile.name} and noticed you're handling ${profile.discoveryEvidence.painPoints[0] || "complex operations"}.\n\nWe've worked with similar companies in ${profile.industry} to handle overflow and urgent needs—no contracts, no long-term commitments.\n\nIf this ever comes up, you'd have a backup ready to go.\n\nOne quick question: yes, maybe, or no?\n\nBest,\nJames\nSaint & Story`,
          callToAction: "Reply with yes, maybe, or no",
        },
        rendering_rationale: {
          whyThisFormat: "Email removes commitment",
          channelSpecificAdaptations: ["Conversational tone", "Mobile-first", "One clear ask"],
        },
      },
      alternatives: [],
      channelReasoning: {
        whyEmailFirst: "Lowest barrier",
        whenToUseSMS: "If email fails after 3 attempts",
        whenToUseLinkedIn: "For senior stakeholders",
        whenToUseVoice: "After positive reply",
      },
    },

    // Layer 6: TIMELINE
    timeline: {
      currentStage: {
        stage,
        stageName: stageNames[stage],
        objective: stageObjectives[stage],
        estimatedDuration: "7 days",
        triggerForNextStage: "Reply received",
        whatSuccessLooksLike: "Response email within 7 days",
      },
      nextStage: {
        stage: Math.min(6, stage + 1),
        stageName: stageNames[Math.min(6, stage + 1)],
        objective: stageObjectives[Math.min(6, stage + 1)],
        estimatedDuration: "14 days",
        triggerForNextStage: "Interest expressed",
        whatSuccessLooksLike: "Meeting scheduled",
      },
      fullJourney: Array.from({ length: 7 }, (_, i) => {
        const s = i as RelationshipStage;
        return {
          stage: s,
          stageName: stageNames[s],
          objective: stageObjectives[s],
          triggerForNextStage: stageTriggers[s],
          whatSuccessLooksLike: stageSuccess[s],
        };
      }),
      progressionMetrics: {
        currentMilestone: "Initial outreach",
        nextMilestone: "Reply received",
        estimatedTimeToNext: "7 days",
      },
    },

    // Layer 7: OPERATOR GUIDANCE
    operatorGuidance: {
      executiveSummary: {
        whoTheyAre: `${profile.name} is a ${profile.industry} business in ${profile.location}`,
        whyWeThinkTheyNeedUs: `They show signs of ${profile.discoveryEvidence.painPoints.join(" and ")}`,
        whatWereTrying: "Initial engagement to explore fit",
        measurableObjective: "Get reply (yes/maybe/no)",
      },
      contextForOperator: {
        keyFactsToRemember: profile.discoveryEvidence.operationalIndicators,
        criticalAssumptions: ["Decision maker unknown", "Budget unconfirmed"],
        whatIfTheyAsk: "If they ask about pricing, say: 'Let's first understand your needs.'",
      },
      nextSteps: {
        ifTheyReply: "Schedule brief call to understand timeline",
        ifTheyIgnore: "Send second email after 4 days with different angle",
        ifTheyObjectToOffer: "Ask what would make it relevant",
      },
      whatToMonitorFor: {
        successSignals: ["Email opened", "Link clicked", "Reply received"],
        failureSignals: ["Email bounced", "No opens after 3 days"],
        actionableMetrics: ["Open rate", "Reply rate", "Engagement time"],
      },
    },

    // Layer 8: LEARNING
    learning: {
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
        nextInteractionType: "email",
        expectedOutcome: "20-30% reply rate",
        confidenceInPrediction: 60,
        alternativeOutcomes: ["No reply", "Negative reply"],
      },
      newQuestions: [],
      suggestedTests: [],
    },

    // Metadata
    metadata: {
      version: "2.0",
      schema: "relationship-intelligence-v2",
      confidenceScore: 45,
      lastUpdated: new Date().toISOString(),
      interactionCount: 0,
    },

    // Explainability
    explainability: {
      currentRelationshipState: `Stage ${stage}: ${stageNames[stage]}`,
      whyThisStage: "Cold prospect, initial contact phase",
      whyWeBelieveThis: profile.discoveryEvidence.operationalIndicators.join("; "),
      whatMustChange: "Prospect must acknowledge need and have capacity to consider",
      whyThatStrategy: "Stage 1 optimization: Remove barriers, give value first",
      howWeWillEncourage: `Via email introducing free option, removing commitment barriers`,
    },
  };

  return obj as RelationshipIntelligenceObject;
}

function inferStageFromSignals(profile: BusinessProfile): RelationshipStage {
  // Default to Stage 1 for cold prospects
  return 1;
}

function stageTrustScore(stage: RelationshipStage): number {
  const scores: Record<RelationshipStage, number> = {
    0: 0,
    1: 25,
    2: 45,
    3: 65,
    4: 75,
    5: 85,
    6: 95,
  };
  return scores[stage];
}

const stageNames: Record<RelationshipStage, string> = {
  0: "Unknown",
  1: "Earn Reply",
  2: "Backup Supplier",
  3: "First Delivery",
  4: "Repeat Deliveries",
  5: "Dedicated Driver",
  6: "Strategic Partner",
};

const stageObjectives: Record<RelationshipStage, string> = {
  0: "Identify business",
  1: "Get engagement",
  2: "Position contingency",
  3: "Prove capability",
  4: "Build pattern",
  5: "Strategic conversation",
  6: "Long-term partnership",
};

const stageTriggers: Record<RelationshipStage, string> = {
  0: "Initial contact",
  1: "Reply received",
  2: "Interest expressed",
  3: "Delivery completed",
  4: "3+ deliveries done",
  5: "Agreement signed",
  6: "Partnership live",
};

const stageSuccess: Record<RelationshipStage, string> = {
  0: "Business identified",
  1: "Response to email",
  2: "Meeting scheduled",
  3: "Successful first transaction",
  4: "Regular usage",
  5: "Dedicated resource",
  6: "Integrated operations",
};
