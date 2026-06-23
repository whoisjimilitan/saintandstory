/**
 * PHASE 1: COMPLETE RUNNER
 *
 * Executes full calibration benchmark on all test companies
 * Generates comprehensive reasoning benchmark report
 */

import { generatePhase1Intelligence } from "./engine-phase1-working";
import { calibrateEngineReasoning, type ExpertAssessment, type CalibrationScore } from "./phase-1-calibration-validator";
import type { BusinessProfile } from "./business-relationship-engine";

// Test company data matching PHASE_1_TEST_DATASET.md
interface TestCompany {
  id: string;
  name: string;
  industry: string;
  profile: BusinessProfile;
  expert: ExpertAssessment;
}

const TEST_COMPANIES: TestCompany[] = [
  {
    id: "law-1",
    name: "Harrison & Associates",
    industry: "Legal Services",
    profile: {
      name: "Harrison & Associates",
      industry: "Legal Services",
      location: "London",
      size: "small",
      contactName: "Reception",
      discoveryEvidence: {
        operationalIndicators: [
          "20+ years serving mid-market acquisitions",
          "2 recent hires in litigation support",
          "Managing 200+ documents across 3 jurisdictions",
        ],
        growthSignals: ["Recent hiring surge"],
        currentSolutions: ["Internal document management"],
        painPoints: ["High-volume document exchange", "Cross-jurisdiction coordination"],
      },
    },
    expert: {
      stage: 1,
      trustScore: 25,
      buyingReadiness: 40,
      primaryStakeholder: "Managing partner",
      keyBlocker: "Internal process (partner approval)",
      recommendedStrategy: "Reach decision maker directly",
      communicationObjective: "Get meeting with managing partner",
      reasoning: "Initial contact but no engagement. Need real decision maker.",
      expertConfidenceInStage: 85,
      expertConfidenceInTrust: 80,
      expertIdentifiedContradictions: ["Initial interest", "then complete silence"],
      expertIdentifiedUnknowns: ["Decision maker", "Budget", "Timeline"],
      expertViewOnStrategicValue: "high",
    },
  },

  {
    id: "construction-1",
    name: "BuildRight Contractors",
    industry: "Construction",
    profile: {
      name: "BuildRight Contractors",
      industry: "Construction",
      location: "Manchester",
      size: "medium",
      contactName: "Operations Director",
      discoveryEvidence: {
        operationalIndicators: [
          "50+ active projects across North West",
          "Multiple geographic locations",
          "Recently won major retail development contract",
        ],
        growthSignals: ["New contract win"],
        currentSolutions: ["Current courier provider"],
        painPoints: ["Same-day document delivery needs", "Geographic spread coordination"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 45,
      buyingReadiness: 75,
      primaryStakeholder: "Operations director",
      keyBlocker: "Commitment anxiety (switching risk for new director)",
      recommendedStrategy: "Position as proof of concept on next urgent delivery",
      communicationObjective: "Get first delivery this month",
      reasoning: "Actively looking, comparing options. Immediate need but risk aversion.",
      expertConfidenceInStage: 80,
      expertConfidenceInTrust: 75,
      expertViewOnStrategicValue: "high",
    },
  },

  {
    id: "dental-1",
    name: "Smile Care Dental",
    industry: "Healthcare",
    profile: {
      name: "Smile Care Dental",
      industry: "Healthcare",
      location: "Bristol",
      size: "small",
      contactName: "Owner",
      discoveryEvidence: {
        operationalIndicators: [
          "Same-day emergency availability model",
          "Recent supply chain issues mentioned in reviews",
        ],
        growthSignals: ["Supply chain pain"],
        currentSolutions: ["Current supplier with inventory delays"],
        painPoints: ["Inventory delays affecting scheduling"],
      },
    },
    expert: {
      stage: 1,
      trustScore: 15,
      buyingReadiness: 30,
      primaryStakeholder: "Owner",
      keyBlocker: "Owner overwhelmed, supply not urgent enough",
      recommendedStrategy: "Trigger via supply chain pain",
      communicationObjective: "Get owner to attend 15-minute call",
      reasoning: "Initial enthusiasm died. Not urgent enough yet.",
      expertConfidenceInStage: 90,
      expertConfidenceInTrust: 85,
      expertViewOnStrategicValue: "medium",
    },
  },

  {
    id: "saas-1",
    name: "CloudScale Analytics",
    industry: "SaaS",
    profile: {
      name: "CloudScale Analytics",
      industry: "SaaS",
      location: "London",
      size: "small",
      contactName: "COO",
      discoveryEvidence: {
        operationalIndicators: [
          "Processing 2M+ data points daily for European clients",
          "Series B funding just closed (£2.5M)",
          "12 new engineers hired in 3 months",
        ],
        growthSignals: ["Series B funding", "Rapid hiring"],
        currentSolutions: ["Current logistics provider"],
        painPoints: ["Scaling logistics for European operations"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 55,
      buyingReadiness: 65,
      primaryStakeholder: "COO",
      keyBlocker: "Current supplier works fine, no urgent pressure",
      recommendedStrategy: "Position as scaling partner",
      communicationObjective: "Get technical requirements discussion",
      reasoning: "COO engaged, evaluating. Budget available but no urgency.",
      expertConfidenceInStage: 75,
      expertConfidenceInTrust: 70,
      expertViewOnStrategicValue: "high",
    },
  },

  {
    id: "recruitment-1",
    name: "TalentFlow Recruitment",
    industry: "Recruitment",
    profile: {
      name: "TalentFlow Recruitment",
      industry: "Recruitment",
      location: "Leeds",
      size: "small",
      contactName: "Consultant",
      discoveryEvidence: {
        operationalIndicators: [
          "500+ placements annually across UK",
          "Recently restructured to Account Management roles",
        ],
        growthSignals: ["Operations restructuring"],
        currentSolutions: ["Current document delivery"],
        painPoints: ["Client document delivery needs"],
      },
    },
    expert: {
      stage: 1,
      trustScore: 35,
      buyingReadiness: 50,
      primaryStakeholder: "Operations manager or CEO",
      keyBlocker: "Information stuck at individual level",
      recommendedStrategy: "Get consultant to pitch internally",
      communicationObjective: "Give consultant one-pager to present",
      reasoning: "Consultant interested but lacks authority.",
      expertConfidenceInStage: 80,
      expertConfidenceInTrust: 75,
      expertViewOnStrategicValue: "medium",
    },
  },

  {
    id: "manufacturing-1",
    name: "PrecisionMetals UK",
    industry: "Manufacturing",
    profile: {
      name: "PrecisionMetals UK",
      industry: "Manufacturing",
      location: "Birmingham",
      size: "medium",
      contactName: "Logistics Director",
      discoveryEvidence: {
        operationalIndicators: [
          "Serving 15+ countries",
          "Just-in-time delivery critical",
          "3 facilities (main + 2 satellite)",
          "Aerospace components (high precision)",
        ],
        growthSignals: ["New logistics director"],
        currentSolutions: ["Current logistics provider"],
        painPoints: ["Just-in-time coordination", "Multi-facility coordination"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 40,
      buyingReadiness: 55,
      primaryStakeholder: "Operations manager",
      keyBlocker: "Risk aversion (aerospace = quality critical)",
      recommendedStrategy: "Risk mitigation (guarantee, compliance, references)",
      communicationObjective: "Get pilot approval on low-risk shipment",
      reasoning: "Director escalated. Operations evaluating. High switching cost.",
      expertConfidenceInStage: 80,
      expertConfidenceInTrust: 70,
      expertViewOnStrategicValue: "high",
    },
  },

  {
    id: "insurance-1",
    name: "Westshire Insurance",
    industry: "Insurance",
    profile: {
      name: "Westshire Insurance",
      industry: "Insurance",
      location: "Bristol",
      size: "small",
      contactName: "Agent",
      discoveryEvidence: {
        operationalIndicators: [
          "600+ business policies across West Country",
          "Recently hired Operations Manager",
        ],
        growthSignals: ["New operations manager"],
        currentSolutions: ["Current document handling"],
        painPoints: ["High-volume policy documentation"],
      },
    },
    expert: {
      stage: 1,
      trustScore: 20,
      buyingReadiness: 25,
      primaryStakeholder: "Operations manager",
      keyBlocker: "Agent lacks authority, operations manager unaware",
      recommendedStrategy: "Go around agent, reach operations manager",
      communicationObjective: "Get operations manager to see one-page overview",
      reasoning: "Agent interested but disappeared. Decision maker doesn't know us.",
      expertConfidenceInStage: 85,
      expertConfidenceInTrust: 80,
      expertViewOnStrategicValue: "low",
    },
  },

  {
    id: "estateagency-1",
    name: "Premier Properties",
    industry: "Estate Agency",
    profile: {
      name: "Premier Properties",
      industry: "Estate Agency",
      location: "Edinburgh",
      size: "small",
      contactName: "Branch Manager",
      discoveryEvidence: {
        operationalIndicators: [
          "100+ properties in portfolio",
          "2 office locations",
        ],
        growthSignals: [],
        currentSolutions: ["Current document handling"],
        painPoints: ["Property document coordination"],
      },
    },
    expert: {
      stage: 1,
      trustScore: 30,
      buyingReadiness: 35,
      primaryStakeholder: "Branch manager",
      keyBlocker: "No urgency + competing priorities + inertia",
      recommendedStrategy: "Make decision so easy it requires no effort",
      communicationObjective: "Get manager to try free trial",
      reasoning: "Initial enthusiasm died. Small business inertia = blocker.",
      expertConfidenceInStage: 85,
      expertConfidenceInTrust: 75,
      expertViewOnStrategicValue: "low",
    },
  },

  {
    id: "engineering-1",
    name: "Whitmore Engineering",
    industry: "Engineering",
    profile: {
      name: "Whitmore Engineering",
      industry: "Engineering",
      location: "Sheffield",
      size: "medium",
      contactName: "Projects Director",
      discoveryEvidence: {
        operationalIndicators: [
          "60+ active projects nationally",
          "Projects director actively engaged on industry posts",
          "Director asked specific technical questions",
        ],
        growthSignals: ["Project expansion"],
        currentSolutions: ["Current logistics provider"],
        painPoints: ["Multi-project coordination"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 65,
      buyingReadiness: 70,
      primaryStakeholder: "Projects director",
      keyBlocker: "Internal approval process (finance/ops needed)",
      recommendedStrategy: "Help director build internal case",
      communicationObjective: "Get director to schedule internal review",
      reasoning: "Director evaluating seriously. Budget available. Internal approvals needed.",
      expertConfidenceInStage: 80,
      expertConfidenceInTrust: 75,
      expertViewOnStrategicValue: "high",
    },
  },

  {
    id: "healthcare-1",
    name: "CityHealth Clinics",
    industry: "Healthcare",
    profile: {
      name: "CityHealth Clinics",
      industry: "Healthcare",
      location: "London",
      size: "small",
      contactName: "Practice Manager",
      discoveryEvidence: {
        operationalIndicators: [
          "8 clinic locations",
          "10,000+ patient appointments monthly",
          "Practice manager quoted specific budget (£2k-5k)",
        ],
        growthSignals: ["Growth in volume"],
        currentSolutions: ["Current document handling"],
        painPoints: ["Multi-location coordination"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 55,
      buyingReadiness: 80,
      primaryStakeholder: "Practice manager",
      keyBlocker: "Risk in healthcare (compliance, security, reputation)",
      recommendedStrategy: "Compliance/security assurance",
      communicationObjective: "Provide compliance docs, schedule pilots",
      reasoning: "Budget approved. Pain clear. Healthcare = compliance-first decisions.",
      expertConfidenceInStage: 85,
      expertConfidenceInTrust: 75,
      expertViewOnStrategicValue: "high",
    },
  },
];

/**
 * RUN PHASE 1 CALIBRATION
 */
export async function runPhase1Calibration(): Promise<{
  results: CalibrationScore[];
  summary: {
    averageOverallScore: number;
    averageUtility: number;
    averageTraceability: number;
    topStrengths: string[];
    topWeaknesses: string[];
    learningRules: string[];
  };
}> {
  console.log("\n" + "=".repeat(70));
  console.log("PHASE 1: REASONING CALIBRATION BENCHMARK");
  console.log("=".repeat(70) + "\n");

  const results: CalibrationScore[] = [];
  const allLearningRules: string[] = [];
  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];

  for (const company of TEST_COMPANIES) {
    console.log(`📊 Calibrating: ${company.name} (${company.industry})`);

    try {
      // Generate intelligence
      const intelligence = generatePhase1Intelligence(company.id, company.profile);

      // Calibrate against expert
      const score = calibrateEngineReasoning(intelligence, company.expert);
      results.push(score);

      // Collect learning
      allLearningRules.push(...score.learningRules);
      allStrengths.push(...score.reasoning.strengths);
      allWeaknesses.push(...score.reasoning.weaknesses);

      // Report
      const status =
        score.reasoning.respectVsAgreement === "earned_respect" ||
        score.reasoning.respectVsAgreement === "disagreement_respected"
          ? "✅"
          : "⚠️";

      console.log(`  ${status} Overall: ${score.overallScore}%`);
      console.log(`     Utility: ${score.strategicUtility}% | Traceability: ${score.evidenceTraceability}%`);
      console.log(
        `     Respect: ${score.reasoning.respectVsAgreement}`
      );
    } catch (error) {
      console.error(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Summary statistics
  const avgOverall = Math.round(
    results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
  );
  const avgUtility = Math.round(
    results.reduce((sum, r) => sum + r.strategicUtility, 0) / results.length
  );
  const avgTraceability = Math.round(
    results.reduce((sum, r) => sum + r.evidenceTraceability, 0) / results.length
  );

  // Most common strengths/weaknesses
  const strengthCounts = countOccurrences(allStrengths);
  const weaknessCounts = countOccurrences(allWeaknesses);
  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);
  const topWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);

  // Deduplicate learning rules
  const uniqueRules = [...new Set(allLearningRules)];

  console.log("\n" + "=".repeat(70));
  console.log("PHASE 1 CALIBRATION SUMMARY");
  console.log("=".repeat(70));
  console.log(`\nAverage Overall Score: ${avgOverall}%`);
  console.log(`Average Strategic Utility: ${avgUtility}%`);
  console.log(`Average Evidence Traceability: ${avgTraceability}%`);
  console.log(`\nTop Strengths:`);
  topStrengths.forEach((s) => console.log(`  ✅ ${s}`));
  console.log(`\nTop Weaknesses:`);
  topWeaknesses.forEach((w) => console.log(`  ⚠️ ${w}`));
  console.log(`\nLearning Rules Identified: ${uniqueRules.length}`);
  console.log("=".repeat(70) + "\n");

  return {
    results,
    summary: {
      averageOverallScore: avgOverall,
      averageUtility: avgUtility,
      averageTraceability: avgTraceability,
      topStrengths,
      topWeaknesses,
      learningRules: uniqueRules,
    },
  };
}

function countOccurrences(arr: string[]): Record<string, number> {
  return arr.reduce(
    (acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

// Export for testing
export { TEST_COMPANIES };
