/**
 * PHASE 2: REGRESSION TEST RUNNER
 *
 * Runs 20 scenarios against engine
 * Validates all changes against baseline
 * Prevents regression and ensures improvement
 */

import { generatePhase1Intelligence } from "./engine-phase1-working";
import { calibrateEngineReasoning } from "./phase-1-calibration-validator";
import { PHASE_2_TEST_SCENARIOS, type TestScenario } from "./phase-2-test-scenarios";
import type { ExpertAssessment } from "./phase-1-calibration-validator";

export interface RegressionTestResult {
  scenarioId: string;
  scenarioName: string;
  passed: boolean;
  overallScore: number;
  stageDifference: number;
  stageAcceptable: boolean;
  trustAcceptable: boolean;
  readinessAcceptable: boolean;
  confidenceAcceptable: boolean;
  contradictionsDetected: boolean;
  unknownsSurfaced: boolean;
  utilityLevel: string;
  failures: string[];
}

export interface RegressionReport {
  timestamp: string;
  totalScenarios: number;
  passCount: number;
  failCount: number;
  passRate: number;
  averageScore: number;
  scenarioResults: RegressionTestResult[];
  regressions: string[]; // Scenarios that got worse
  improvements: string[]; // Scenarios that got better
  summary: string;
}

export async function runRegressionSuite(
  baselineScores?: Record<string, number>
): Promise<RegressionReport> {
  console.log("\n" + "=".repeat(70));
  console.log("PHASE 2: REGRESSION TEST SUITE");
  console.log("=".repeat(70) + "\n");

  const results: RegressionTestResult[] = [];
  let passCount = 0;

  for (const scenario of PHASE_2_TEST_SCENARIOS) {
    console.log(`🧪 Testing: ${scenario.name}`);

    try {
      // Generate intelligence from scenario
      const intelligence = generatePhase1Intelligence(scenario.id, scenario.profile);

      // Create expert assessment from scenario expectations
      const expert: ExpertAssessment = {
        stage: scenario.expectedAssessment.stage,
        trustScore: (scenario.expectedAssessment.trustRange[0] +
          scenario.expectedAssessment.trustRange[1]) /
          2,
        buyingReadiness: (scenario.expectedAssessment.readinessRange[0] +
          scenario.expectedAssessment.readinessRange[1]) /
          2,
        primaryStakeholder: "Test",
        keyBlocker: "N/A",
        recommendedStrategy: "N/A",
        communicationObjective: "N/A",
        reasoning: scenario.expectedAssessment.reasoning,
        expertConfidenceInStage: 85,
        expertConfidenceInTrust: 80,
        expertIdentifiedContradictions: scenario.expectedAssessment
          .shouldDetectContradictions
          ? ["Test contradiction"]
          : [],
        expertIdentifiedUnknowns: scenario.expectedAssessment.shouldSurfaceUnknowns,
        expertViewOnStrategicValue: scenario.expectedAssessment.expectedUtility,
      };

      // Score it
      const score = calibrateEngineReasoning(intelligence, expert);

      // Check if it passes
      const stageDiff = Math.abs(intelligence.relationshipModel.currentStage - scenario.expectedAssessment.stage);
      const stageAcceptable =
        stageDiff <= (scenario.expectedAssessment.stageRange[1] -
          scenario.expectedAssessment.stageRange[0]);

      const trustScore = intelligence.relationshipModel.trustScore;
      const trustAcceptable =
        trustScore >= scenario.expectedAssessment.trustRange[0] &&
        trustScore <= scenario.expectedAssessment.trustRange[1];

      const readinessAcceptable = score.overallScore >= 60; // Min 60% for readiness tests

      const confidenceAcceptable =
        intelligence.relationshipModel.modelConfidence >=
          scenario.expectedAssessment.confidenceRange[0] &&
        intelligence.relationshipModel.modelConfidence <=
          scenario.expectedAssessment.confidenceRange[1];

      const contradictionsDetected = scenario.expectedAssessment
        .shouldDetectContradictions
        ? score.contradictionHandling > 60
        : true;

      const unknownsSurfaced = scenario.expectedAssessment.shouldSurfaceUnknowns
        .length > 0
        ? intelligence.relationshipModel.unknowns.length > 0
        : true;

      // Overall pass/fail
      const passed =
        stageAcceptable &&
        trustAcceptable &&
        readinessAcceptable &&
        confidenceAcceptable &&
        contradictionsDetected &&
        unknownsSurfaced;

      if (passed) passCount++;

      const failures: string[] = [];
      if (!stageAcceptable) failures.push(`Stage off by ${stageDiff}`);
      if (!trustAcceptable) failures.push(`Trust score ${trustScore} out of range`);
      if (!readinessAcceptable) failures.push(`Overall score ${score.overallScore}% below 60%`);
      if (!confidenceAcceptable)
        failures.push(
          `Confidence ${intelligence.relationshipModel.modelConfidence} out of range`
        );
      if (!contradictionsDetected)
        failures.push("Contradictions not detected");
      if (!unknownsSurfaced) failures.push("Unknowns not surfaced");

      const result: RegressionTestResult = {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        passed,
        overallScore: score.overallScore,
        stageDifference: stageDiff,
        stageAcceptable,
        trustAcceptable,
        readinessAcceptable,
        confidenceAcceptable,
        contradictionsDetected,
        unknownsSurfaced,
        utilityLevel: scenario.expectedAssessment.expectedUtility,
        failures,
      };

      results.push(result);

      // Report
      const status = passed ? "✅" : "❌";
      console.log(`  ${status} Score: ${score.overallScore}% | Trust: ${trustScore} | Stage: ${stageDiff} diff`);
    } catch (error) {
      console.error(
        `  ❌ Error: ${error instanceof Error ? error.message : String(error)}`
      );
      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        passed: false,
        overallScore: 0,
        stageDifference: 0,
        stageAcceptable: false,
        trustAcceptable: false,
        readinessAcceptable: false,
        confidenceAcceptable: false,
        contradictionsDetected: false,
        unknownsSurfaced: false,
        utilityLevel: "low",
        failures: [
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        ],
      });
    }
  }

  const passRate = Math.round((passCount / results.length) * 100);
  const avgScore = Math.round(
    results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
  );

  // Identify regressions and improvements
  const regressions: string[] = [];
  const improvements: string[] = [];

  if (baselineScores) {
    results.forEach((result) => {
      const baseline = baselineScores[result.scenarioId];
      if (baseline && result.overallScore < baseline - 10) {
        regressions.push(
          `${result.scenarioName}: ${result.overallScore}% (was ${baseline}%)`
        );
      }
      if (baseline && result.overallScore > baseline + 10) {
        improvements.push(
          `${result.scenarioName}: ${result.overallScore}% (was ${baseline}%)`
        );
      }
    });
  }

  // Summary
  let summary = `Regression Test Results: ${passRate}% pass rate (${passCount}/${results.length})`;
  if (regressions.length > 0) {
    summary += `. REGRESSIONS: ${regressions.length}`;
  }
  if (improvements.length > 0) {
    summary += `. IMPROVEMENTS: ${improvements.length}`;
  }

  console.log("\n" + "=".repeat(70));
  console.log("REGRESSION REPORT");
  console.log("=".repeat(70));
  console.log(`\nPass Rate: ${passRate}% (${passCount}/${results.length})`);
  console.log(`Average Score: ${avgScore}%`);

  if (regressions.length > 0) {
    console.log(`\n⚠️  Regressions (${regressions.length}):`);
    regressions.slice(0, 5).forEach((r) => console.log(`  • ${r}`));
  }

  if (improvements.length > 0) {
    console.log(`\n🎉 Improvements (${improvements.length}):`);
    improvements.slice(0, 5).forEach((i) => console.log(`  • ${i}`));
  }

  console.log("\n" + "=".repeat(70) + "\n");

  return {
    timestamp: new Date().toISOString(),
    totalScenarios: results.length,
    passCount,
    failCount: results.length - passCount,
    passRate,
    averageScore: avgScore,
    scenarioResults: results,
    regressions,
    improvements,
    summary,
  };
}

/**
 * Save baseline scores for regression detection
 */
export function saveBaseline(results: RegressionTestResult[]): Record<string, number> {
  return results.reduce(
    (acc, r) => {
      acc[r.scenarioId] = r.overallScore;
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Check if regression suite passes deployment gates
 */
export function meetsDeploymentGates(report: RegressionReport): {
  passed: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (report.passRate < 75) {
    issues.push(`Pass rate ${report.passRate}% below 75% gate`);
  }

  if (report.regressions.length > 2) {
    issues.push(`${report.regressions.length} regressions (max 2 allowed)`);
  }

  if (report.averageScore < 65) {
    issues.push(`Average score ${report.averageScore}% below 65%`);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}
