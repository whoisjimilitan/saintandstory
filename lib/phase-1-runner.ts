/**
 * PHASE 1: TEST RUNNER
 *
 * Executes validation on all companies
 * Generates report of reasoning accuracy
 */

import {
  validateEngineOutput,
  scoreBatch,
  type ExpertAssessment,
  type ValidationScore,
} from "./phase-1-validation";
import {
  generateRelationshipCommunication,
  type BusinessProfile,
} from "./business-relationship-engine";
import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";

/**
 * COMPANY TEST DATA
 */

interface CompanyTestCase {
  id: string;
  name: string;
  industry: string;
  profile: BusinessProfile;
  expert: ExpertAssessment;
}

// Test data from PHASE_1_TEST_DATASET.md
const TEST_COMPANIES: CompanyTestCase[] = [
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
      recommendedStrategy: "Reach decision maker directly (managing partner)",
      communicationObjective: "Get meeting with managing partner (not assistant)",
      reasoning: "Initial contact but no engagement. Need to escalate to real decision maker.",
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
          "Multiple geographic locations (weekly movement)",
          "Recently won major retail development contract",
        ],
        growthSignals: ["New contract win", "Expansion activity"],
        currentSolutions: ["Current courier provider"],
        painPoints: [
          "Same-day document delivery needs",
          "Geographic spread coordination",
          "Urgent site delivery capability",
        ],
      },
    },
    expert: {
      stage: 2,
      trustScore: 45,
      buyingReadiness: 75,
      primaryStakeholder: "Operations director",
      keyBlocker: "Commitment anxiety (switching risk for new director)",
      recommendedStrategy: "Position as proof of concept on next urgent delivery",
      communicationObjective: "Get first delivery this month (not meeting, not proposal)",
      reasoning:
        "Actively looking, comparing options. Operations director just promoted (proving themselves). Immediate need but risk aversion.",
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
          "Owner expressed initial interest",
        ],
        growthSignals: ["Supply chain pain"],
        currentSolutions: ["Current supplier with inventory delays"],
        painPoints: [
          "Inventory delays affecting scheduling",
          "Supply chain reliability issues",
        ],
      },
    },
    expert: {
      stage: 1,
      trustScore: 15,
      buyingReadiness: 30,
      primaryStakeholder: "Owner",
      keyBlocker: "Owner overwhelmed with operations, supply not urgent enough",
      recommendedStrategy: "Trigger via supply chain pain (when frustrated)",
      communicationObjective: "Get owner to attend 15-minute call (not meeting)",
      reasoning: "Owner expressed interest then went silent. Not urgent enough yet to overcome inertia.",
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
          "European expansion",
        ],
        growthSignals: [
          "Series B funding",
          "Rapid engineering hiring",
          "Geographic expansion",
        ],
        currentSolutions: ["Current logistics provider"],
        painPoints: ["Scaling logistics for European operations", "Rapid growth logistics needs"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 55,
      buyingReadiness: 65,
      primaryStakeholder: "COO",
      keyBlocker: "Current supplier works fine, no urgent pressure to switch",
      recommendedStrategy: "Position as scaling partner (address future pain, not current)",
      communicationObjective: "Get technical requirements discussion with COO and ops team",
      reasoning:
        "COO engaged, evaluating seriously. Series B funding = budget available. Growth requires support. But no urgency to switch.",
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
          "Role restructuring suggests scaling operations",
          "Single consultant asked about document delivery",
        ],
        growthSignals: ["Operations restructuring", "Scaling"],
        currentSolutions: ["Current document delivery"],
        painPoints: ["Client document delivery needs", "High-volume administrative coordination"],
      },
    },
    expert: {
      stage: 1,
      trustScore: 35,
      buyingReadiness: 50,
      primaryStakeholder: "Operations manager or CEO",
      keyBlocker: "Information stuck at individual contributor level",
      recommendedStrategy: "Get consultant to pitch internally (become internal champion)",
      communicationObjective: "Give consultant one-pager to present to ops leadership",
      reasoning: "Consultant interested but lacks authority. Need to enable internal advocacy.",
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
          "3 facilities (Birmingham main, 2 satellite)",
          "Logistics director hired 6 months ago",
          "Aerospace components (high precision requirement)",
        ],
        growthSignals: ["New logistics director"],
        currentSolutions: ["Current logistics provider"],
        painPoints: [
          "Just-in-time delivery coordination",
          "Multi-facility coordination",
          "International logistics",
        ],
      },
    },
    expert: {
      stage: 2,
      trustScore: 40,
      buyingReadiness: 55,
      primaryStakeholder: "Operations manager",
      keyBlocker: "Risk aversion (aerospace = quality non-negotiable)",
      recommendedStrategy: "Risk mitigation (guarantee, compliance, references)",
      communicationObjective: "Get operations manager to approve pilot on low-risk shipment",
      reasoning:
        "Logistics director escalated (good signal). Operations evaluating. But aerospace = high switching cost = high risk perception.",
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
          "High document volume (policy management)",
        ],
        growthSignals: ["New operations manager"],
        currentSolutions: ["Current document handling"],
        painPoints: [
          "High-volume policy documentation",
          "Multi-location coordination",
        ],
      },
    },
    expert: {
      stage: 1,
      trustScore: 20,
      buyingReadiness: 25,
      primaryStakeholder: "Operations manager",
      keyBlocker: "Agent lacks authority, operations manager unaware",
      recommendedStrategy: "Go around agent, reach operations manager directly",
      communicationObjective: "Get operations manager to see one-page overview",
      reasoning: "Agent interested but disappeared. Decision maker doesn't know about us yet.",
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
          "Active residential portfolio",
        ],
        growthSignals: [],
        currentSolutions: ["Current document handling"],
        painPoints: [
          "Property document coordination",
          "Multi-location management",
        ],
      },
    },
    expert: {
      stage: 1,
      trustScore: 30,
      buyingReadiness: 35,
      primaryStakeholder: "Branch manager",
      keyBlocker: "No urgency + competing priorities + small business inertia",
      recommendedStrategy: "Make decision so easy it requires no effort",
      communicationObjective: "Get manager to try free trial (zero commitment option)",
      reasoning: "Initial enthusiasm died. Small business = reactive, not strategic. Inertia = blocker.",
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
          "Requested detailed specifications",
        ],
        growthSignals: ["Project expansion"],
        currentSolutions: ["Current logistics provider"],
        painPoints: ["Multi-project coordination", "National project logistics"],
      },
    },
    expert: {
      stage: 2,
      trustScore: 65,
      buyingReadiness: 70,
      primaryStakeholder: "Projects director",
      keyBlocker: "Internal approval process (finance/ops sign-off needed)",
      recommendedStrategy: "Help director build internal case (provide approval data)",
      communicationObjective: "Get director to schedule internal review with finance/ops",
      reasoning:
        "Director evaluating seriously (technical questions). Projects director can champion but needs internal approvals.",
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
          "Practice manager quoted specific budget (£2k-5k monthly)",
          "Multi-location coordination required",
        ],
        growthSignals: ["Growth in appointment volume"],
        currentSolutions: ["Current document handling"],
        painPoints: [
          "Multi-location coordination",
          "High appointment volume documentation",
          "Clinic-to-clinic communication",
        ],
      },
    },
    expert: {
      stage: 2,
      trustScore: 55,
      buyingReadiness: 80,
      primaryStakeholder: "Practice manager",
      keyBlocker: "Risk in healthcare (compliance, data security, reputation)",
      recommendedStrategy: "Compliance/security assurance",
      communicationObjective: "Provide compliance documentation, schedule pilots at 1-2 clinics",
      reasoning:
        "Budget approved (internal process passed). Pain clear. But healthcare = compliance-first decision making.",
    },
  },
];

/**
 * PHASE 1: RUN VALIDATION
 */
export async function runPhase1Validation(): Promise<void> {
  console.log("\n🔬 PHASE 1: REAL COMPANY VALIDATION\n");
  console.log(`Testing engine on ${TEST_COMPANIES.length} companies...\n`);

  const results: ValidationScore[] = [];

  for (const testCase of TEST_COMPANIES) {
    try {
      console.log(`\nTesting: ${testCase.name} (${testCase.industry})`);

      // Generate engine output
      const engineOutput = generateRelationshipCommunication(
        testCase.profile,
        undefined
      );

      // Score against expert
      const score = validateEngineOutput(engineOutput, testCase.expert);
      results.push(score);

      // Report
      console.log(`  Result: ${score.overallScore}% ${score.passed ? "✅ PASS" : "❌ FAIL"}`);
      if (score.failures.length > 0) {
        console.log(`  Issues: ${score.failures.join(", ")}`);
      }
    } catch (error) {
      console.error(`  ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Batch analysis
  const batchResults = scoreBatch(
    results.map((r) => ({} as RelationshipIntelligenceObject)),
    TEST_COMPANIES.map((t) => t.expert)
  );

  console.log("\n" + "=".repeat(60));
  console.log("PHASE 1 RESULTS");
  console.log("=".repeat(60));
  console.log(`\nPass Rate: ${batchResults.passRate}%`);
  console.log(`Average Score: ${batchResults.averageScore}%`);
  console.log(`Companies Tested: ${results.length}`);
  console.log(`Passed: ${results.filter((r) => r.passed).length}`);
  console.log(`Failed: ${results.filter((r) => !r.passed).length}`);

  if (batchResults.failurePatterns.length > 0) {
    console.log("\nCommon Failure Patterns:");
    batchResults.failurePatterns.forEach((p) => console.log(`  - ${p}`));
  }

  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS:");
  console.log("  1. If pass rate >= 80%: Expand to 50-100 companies");
  console.log("  2. If pass rate < 80%: Fix identified failure patterns");
  console.log("  3. Document all failures for Phase 2 test suite");
  console.log("=".repeat(60) + "\n");
}

// Export for testing
export { TEST_COMPANIES };
