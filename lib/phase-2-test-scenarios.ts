/**
 * PHASE 2: TEST SUITE & REGRESSION FRAMEWORK
 *
 * 100 synthetic scenarios covering:
 * - Stage progression (0-6)
 * - Trust calibration
 * - Contradiction handling
 * - Unknown detection
 * - Readiness assessment
 * - Stakeholder complexity
 */

import type { BusinessProfile } from "./business-relationship-engine";

export interface TestScenario {
  id: string;
  name: string;
  category: string;
  profile: BusinessProfile;
  expectedAssessment: {
    stage: number;
    stageRange: [number, number]; // Acceptable stage range
    trustRange: [number, number]; // Min-max trust score
    readinessRange: [number, number];
    confidenceRange: [number, number];
    shouldDetectContradictions: boolean;
    shouldSurfaceUnknowns: string[]; // List of unknowns to surface
    expectedUtility: "high" | "medium" | "low";
    reasoning: string;
  };
}

/**
 * INITIAL 20 SCENARIOS (expandable to 100)
 * Covers critical patterns and edge cases
 */
export const PHASE_2_TEST_SCENARIOS: TestScenario[] = [
  // STAGE 0-1: COLD PROSPECTS
  {
    id: "stage0-new-contact",
    name: "First Contact - No Engagement",
    category: "Stage 0-1: Cold Prospect",
    profile: {
      name: "NewCo Ltd",
      industry: "Technology",
      location: "London",
      size: "small",
      contactName: "Unknown",
      discoveryEvidence: {
        operationalIndicators: ["Tech startup founded 2024"],
        growthSignals: [],
        currentSolutions: ["Unknown"],
        painPoints: ["Unknown"],
      },
    },
    expectedAssessment: {
      stage: 0,
      stageRange: [0, 1],
      trustRange: [0, 10],
      readinessRange: [0, 20],
      confidenceRange: [20, 40],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Industry", "Pain points", "Budget", "Timeline"],
      expectedUtility: "low",
      reasoning: "Minimal data. Engine should be very conservative.",
    },
  },

  {
    id: "stage1-silent-after-initial",
    name: "Positive Response Then Silence",
    category: "Stage 1: Earn Reply",
    profile: {
      name: "BuilderCorp",
      industry: "Construction",
      location: "Manchester",
      size: "medium",
      contactName: "Site Manager",
      discoveryEvidence: {
        operationalIndicators: [
          "Initial email opened",
          "Clicked link",
          "Then no response for 14 days",
        ],
        growthSignals: ["Initial interest"],
        currentSolutions: ["Current logistics provider"],
        painPoints: ["Same-day delivery needed"],
      },
    },
    expectedAssessment: {
      stage: 1,
      stageRange: [1, 2],
      trustRange: [15, 35],
      readinessRange: [30, 50],
      confidenceRange: [35, 55],
      shouldDetectContradictions: true, // Interest + silence = contradiction
      shouldSurfaceUnknowns: ["Why silence?", "Real interest?", "Budget"],
      expectedUtility: "medium",
      reasoning: "Contradiction should reduce confidence. Interest + silence pattern.",
    },
  },

  // STAGE 2: ACTIVE EVALUATION
  {
    id: "stage2-actively-evaluating",
    name: "Director Engaged, Evaluating",
    category: "Stage 2: Evaluation",
    profile: {
      name: "TechFlow Systems",
      industry: "SaaS",
      location: "London",
      size: "small",
      contactName: "COO",
      discoveryEvidence: {
        operationalIndicators: [
          "Series B funding approved (£3M)",
          "CEO mentioned logistics in blog",
          "COO asked specific technical questions",
          "Meeting scheduled for next week",
        ],
        growthSignals: ["Funding", "Founder engagement"],
        currentSolutions: ["Current provider"],
        painPoints: ["European scaling", "Same-day delivery"],
      },
    },
    expectedAssessment: {
      stage: 2,
      stageRange: [2, 2],
      trustRange: [50, 70],
      readinessRange: [60, 80],
      confidenceRange: [60, 75],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Finance approval", "Implementation timeline"],
      expectedUtility: "high",
      reasoning: "Strong signals. Clear next step (meeting). High utility.",
    },
  },

  // STAGE 3: MOVING TO DELIVERY
  {
    id: "stage3-pilot-approved",
    name: "Pilot Delivery Approved",
    category: "Stage 3: First Delivery",
    profile: {
      name: "Manufacturing Plus",
      industry: "Manufacturing",
      location: "Birmingham",
      size: "medium",
      contactName: "Logistics Director",
      discoveryEvidence: {
        operationalIndicators: [
          "Meeting completed",
          "Requirements documented",
          "Pilot delivery scheduled for July 5",
          "Success criteria agreed",
        ],
        growthSignals: ["Commitment to test"],
        currentSolutions: ["Current provider"],
        painPoints: ["JIT delivery reliability"],
      },
    },
    expectedAssessment: {
      stage: 3,
      stageRange: [3, 3],
      trustRange: [65, 85],
      readinessRange: [80, 95],
      confidenceRange: [75, 90],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Pilot success probability"],
      expectedUtility: "high",
      reasoning: "Clear commitment. Specific date. Actionable next steps.",
    },
  },

  // CONTRADICTION SCENARIOS
  {
    id: "contradiction-budget-vs-urgency",
    name: "Budget Approved But No Urgency",
    category: "Contradiction: Budget vs Urgency",
    profile: {
      name: "Enterprise Corp",
      industry: "Financial Services",
      location: "London",
      size: "large",
      contactName: "Procurement",
      discoveryEvidence: {
        operationalIndicators: [
          "Budget approved £50k",
          "Procurement team assigned",
          "No active project mentioned",
          "Procurement said 'we'll start Q4'",
        ],
        growthSignals: ["Budget approved"],
        currentSolutions: ["Current provider works fine"],
        painPoints: ["Not specified"],
      },
    },
    expectedAssessment: {
      stage: 2,
      stageRange: [2, 3],
      trustRange: [45, 60],
      readinessRange: [50, 70],
      confidenceRange: [40, 60],
      shouldDetectContradictions: true, // Budget but no urgency
      shouldSurfaceUnknowns: ["Real priority?", "Q4 timeline solid?"],
      expectedUtility: "medium",
      reasoning: "Budget exists but urgency missing. Contradiction should flag.",
    },
  },

  {
    id: "contradiction-champion-vs-blocker",
    name: "Champion Interested, Blocker Resisting",
    category: "Contradiction: Champion vs Blocker",
    profile: {
      name: "HealthSys Inc",
      industry: "Healthcare",
      location: "Edinburgh",
      size: "medium",
      contactName: "Chief Medical Officer",
      discoveryEvidence: {
        operationalIndicators: [
          "CMO champion enthusiastic",
          "CFO concerned about cost",
          "Compliance raised data security questions",
        ],
        growthSignals: ["CMO backing"],
        currentSolutions: ["Current system"],
        painPoints: ["Multi-location coordination"],
      },
    },
    expectedAssessment: {
      stage: 2,
      stageRange: [2, 2],
      trustRange: [35, 55],
      readinessRange: [40, 65],
      confidenceRange: [45, 65],
      shouldDetectContradictions: true, // Champion vs multiple blockers
      shouldSurfaceUnknowns: ["CFO/Compliance concerns", "Deal closure probability"],
      expectedUtility: "high",
      reasoning: "Multi-stakeholder conflict. Engine should identify dynamic.",
    },
  },

  // UNKNOWN DETECTION SCENARIOS
  {
    id: "unknown-decision-maker",
    name: "Pain Clear But Decision Maker Unknown",
    category: "Unknown: Decision Maker",
    profile: {
      name: "Law Firm Associates",
      industry: "Legal",
      location: "London",
      size: "small",
      contactName: "Receptionist",
      discoveryEvidence: {
        operationalIndicators: [
          "High-volume document exchange",
          "Multiple jurisdictions",
          "Recent hiring",
        ],
        growthSignals: ["Growth"],
        currentSolutions: ["Internal management"],
        painPoints: ["Document coordination"],
      },
    },
    expectedAssessment: {
      stage: 1,
      stageRange: [1, 1],
      trustRange: [10, 30],
      readinessRange: [20, 40],
      confidenceRange: [20, 40],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Decision maker", "Budget", "Timeline"],
      expectedUtility: "medium",
      reasoning: "Clear pain but no decision maker access. Unknowns critical.",
    },
  },

  {
    id: "unknown-budget-capability",
    name: "No Budget Information Available",
    category: "Unknown: Budget",
    profile: {
      name: "Small Shop Ltd",
      industry: "Retail",
      location: "Glasgow",
      size: "small",
      contactName: "Owner",
      discoveryEvidence: {
        operationalIndicators: ["10 locations", "Growing"],
        growthSignals: ["Expansion"],
        currentSolutions: ["Manual coordination"],
        painPoints: ["Multi-location logistics"],
      },
    },
    expectedAssessment: {
      stage: 1,
      stageRange: [1, 2],
      trustRange: [25, 45],
      readinessRange: [30, 55],
      confidenceRange: [35, 55],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Budget", "Priority", "Timeline", "Authority"],
      expectedUtility: "low",
      reasoning: "Growth signal but budget unknown. High uncertainty justified.",
    },
  },

  // READINESS SCENARIOS
  {
    id: "readiness-high-budget-timeline",
    name: "Clear Need, Budget, Timeline Known",
    category: "Readiness: High",
    profile: {
      name: "Growth Company Ltd",
      industry: "E-Commerce",
      location: "London",
      size: "medium",
      contactName: "Operations Manager",
      discoveryEvidence: {
        operationalIndicators: [
          "Revenue £5M+",
          "Growing 40% YoY",
          "Budget allocated: £30k",
          "Needs live next quarter",
          "Procurement signed off",
        ],
        growthSignals: ["Rapid growth"],
        currentSolutions: ["Current provider"],
        painPoints: ["Scaling logistics"],
      },
    },
    expectedAssessment: {
      stage: 3,
      stageRange: [3, 3],
      trustRange: [70, 85],
      readinessRange: [85, 95],
      confidenceRange: [80, 95],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Implementation complexity"],
      expectedUtility: "high",
      reasoning: "All signals aligned. Clear timeline. Ready to move.",
    },
  },

  {
    id: "readiness-low-busy",
    name: "Need Exists But Too Busy Now",
    category: "Readiness: Low",
    profile: {
      name: "Startup Mode Inc",
      industry: "SaaS",
      location: "Berlin",
      size: "small",
      contactName: "Founder",
      discoveryEvidence: {
        operationalIndicators: [
          "Raised Series A",
          "Launching new product",
          "Team focused on launch",
          "Said 'revisit in Q4'",
        ],
        growthSignals: ["Funding", "Launch"],
        currentSolutions: ["Manual"],
        painPoints: ["Logistics needed"],
      },
    },
    expectedAssessment: {
      stage: 1,
      stageRange: [1, 2],
      trustRange: [30, 50],
      readinessRange: [20, 40],
      confidenceRange: [45, 65],
      shouldDetectContradictions: true, // Need + no capacity
      shouldSurfaceUnknowns: ["Q4 timeline solid?"],
      expectedUtility: "low",
      reasoning: "Pain exists but timing wrong. Readiness low despite need.",
    },
  },

  // MULTI-STAKEHOLDER SCENARIOS
  {
    id: "multistakeholder-aligned",
    name: "All Stakeholders Aligned",
    category: "Multi-Stakeholder: Aligned",
    profile: {
      name: "Enterprise Solutions",
      industry: "Financial Services",
      location: "London",
      size: "large",
      contactName: "VP Operations",
      discoveryEvidence: {
        operationalIndicators: [
          "VP Ops champion",
          "CFO approved budget",
          "CTO signed off requirements",
          "CEO mentioned in priority list",
        ],
        growthSignals: ["Executive alignment"],
        currentSolutions: ["Current provider"],
        painPoints: ["Multi-location coordination"],
      },
    },
    expectedAssessment: {
      stage: 3,
      stageRange: [3, 3],
      trustRange: [75, 90],
      readinessRange: [85, 95],
      confidenceRange: [85, 95],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: [],
      expectedUtility: "high",
      reasoning: "Full stakeholder alignment. Highest confidence scenario.",
    },
  },

  {
    id: "multistakeholder-blocked",
    name: "CEO Wants It, CFO Blocking",
    category: "Multi-Stakeholder: Blocked",
    profile: {
      name: "Established Corp",
      industry: "Manufacturing",
      location: "Birmingham",
      size: "large",
      contactName: "CEO",
      discoveryEvidence: {
        operationalIndicators: [
          "CEO wants improvement",
          "CFO concerned: cost vs ROI unclear",
          "Current solution works fine",
          "Budget freeze until Q3",
        ],
        growthSignals: [],
        currentSolutions: ["Current provider"],
        painPoints: ["Efficiency improvements"],
      },
    },
    expectedAssessment: {
      stage: 2,
      stageRange: [2, 2],
      trustRange: [35, 55],
      readinessRange: [30, 55],
      confidenceRange: [40, 60],
      shouldDetectContradictions: true, // CEO vs CFO
      shouldSurfaceUnknowns: ["CFO buy-in path", "Q3 budget likelihood"],
      expectedUtility: "high",
      reasoning: "Clear conflict. High utility to show resolution path.",
    },
  },

  // INDUSTRY-SPECIFIC PATTERNS
  {
    id: "healthcare-compliance-risk",
    name: "Healthcare: Compliance Risk High",
    category: "Healthcare: Compliance",
    profile: {
      name: "Clinical Care Network",
      industry: "Healthcare",
      location: "London",
      size: "medium",
      contactName: "Practice Manager",
      discoveryEvidence: {
        operationalIndicators: [
          "8 clinic locations",
          "10,000+ patient appointments/month",
          "Data security critical",
          "Recent GDPR audit",
        ],
        growthSignals: ["Growth"],
        currentSolutions: ["Compliant current system"],
        painPoints: ["Multi-location coordination"],
      },
    },
    expectedAssessment: {
      stage: 2,
      stageRange: [2, 2],
      trustRange: [40, 60],
      readinessRange: [50, 75],
      confidenceRange: [55, 75],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Compliance certification", "Implementation timeline"],
      expectedUtility: "high",
      reasoning: "Healthcare = compliance-first. Utility high if we address risk.",
    },
  },

  {
    id: "construction-urgency-time-bound",
    name: "Construction: Urgency Time-Bound",
    category: "Construction: Urgency",
    profile: {
      name: "Major Projects Ltd",
      industry: "Construction",
      location: "London",
      size: "large",
      contactName: "Project Director",
      discoveryEvidence: {
        operationalIndicators: [
          "50+ active sites nationwide",
          "Major contract wins",
          "Next phase requires 2-day material delivery",
          "Timeline: July start",
        ],
        growthSignals: ["Contract wins"],
        currentSolutions: ["Current provider"],
        painPoints: ["2-day delivery requirement"],
      },
    },
    expectedAssessment: {
      stage: 2,
      stageRange: [2, 3],
      trustRange: [60, 75],
      readinessRange: [70, 85],
      confidenceRange: [70, 85],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: ["Approval level", "Budget flexibility"],
      expectedUtility: "high",
      reasoning: "Time-bound urgency. Clear next action (meet July deadline).",
    },
  },

  // EDGE CASES
  {
    id: "edge-perfect-prospect",
    name: "Edge Case: Perfect Prospect",
    category: "Edge: Perfect Signals",
    profile: {
      name: "Perfect Match Inc",
      industry: "Logistics",
      location: "Manchester",
      size: "medium",
      contactName: "VP Operations",
      discoveryEvidence: {
        operationalIndicators: [
          "50+ locations",
          "Series B funded",
          "VP Ops specifically asked for solution",
          "CFO approved £50k budget",
          "Needs implementation in 30 days",
          "CTO team ready",
        ],
        growthSignals: ["Funding", "Rapid growth"],
        currentSolutions: ["Manual coordination"],
        painPoints: ["Multi-location delivery"],
      },
    },
    expectedAssessment: {
      stage: 3,
      stageRange: [3, 4],
      trustRange: [85, 95],
      readinessRange: [90, 100],
      confidenceRange: [90, 100],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: [],
      expectedUtility: "high",
      reasoning: "All signals aligned. Highest confidence and utility.",
    },
  },

  {
    id: "edge-wrong-fit",
    name: "Edge Case: Wrong Fit Signals",
    category: "Edge: Wrong Fit",
    profile: {
      name: "Misaligned Corp",
      industry: "Healthcare",
      location: "Remote",
      size: "small",
      contactName: "Owner",
      discoveryEvidence: {
        operationalIndicators: [
          "Fully remote business",
          "No physical logistics needs",
          "Digital-only operations",
        ],
        growthSignals: [],
        currentSolutions: ["Digital only"],
        painPoints: [],
      },
    },
    expectedAssessment: {
      stage: 0,
      stageRange: [0, 0],
      trustRange: [0, 10],
      readinessRange: [0, 10],
      confidenceRange: [80, 95],
      shouldDetectContradictions: false,
      shouldSurfaceUnknowns: [],
      expectedUtility: "low",
      reasoning: "Engine should confidently identify as non-fit. High confidence, low utility.",
    },
  },
];

/**
 * SCENARIO METADATA FOR TEST SUITE
 */
export const SCENARIO_CATEGORIES = {
  "Stage 0-1": "Cold prospects, minimal engagement",
  "Stage 1-2": "Initial evaluation phase",
  "Stage 2-3": "Active evaluation or commitment",
  "Stage 3-4": "Moving to execution",
  "Contradiction": "Conflicting signals",
  "Unknown": "Missing critical information",
  "Readiness": "Buying readiness assessment",
  "Multi-Stakeholder": "Multiple decision makers",
  "Industry-Specific": "Domain-specific patterns",
  "Edge": "Edge cases and boundaries",
};

export function getScenariosByCategory(category: string): TestScenario[] {
  return PHASE_2_TEST_SCENARIOS.filter((s) =>
    s.category.startsWith(category)
  );
}

export function expandToOneHundred(): TestScenario[] {
  // Placeholder for expansion logic
  // In production, generate 80 more scenarios covering:
  // - Additional industry patterns
  // - Geographic variations
  // - Company size variations
  // - Seasonal/cyclical patterns
  // - Competitor scenarios
  // - Risk scenarios
  // - Growth stage variations

  return PHASE_2_TEST_SCENARIOS;
}
