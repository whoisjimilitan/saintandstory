/**
 * PHASE 1 EXECUTION SCRIPT
 *
 * Run the complete calibration benchmark
 * Generate reasoning benchmark report
 */

import { runPhase1Calibration } from "../lib/phase-1-complete-runner";

async function main() {
  console.log("\n🚀 PHASE 1: REASONING CALIBRATION BENCHMARK - EXECUTING\n");

  try {
    const { results, summary } = await runPhase1Calibration();

    // Generate full report
    console.log("\n" + "=".repeat(70));
    console.log("PHASE 1: COMPLETE REASONING BENCHMARK REPORT");
    console.log("=".repeat(70));

    // Detailed results
    console.log("\n📊 DETAILED CALIBRATION SCORES:\n");
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.companyName}`);
      console.log(`   Overall Score: ${result.overallScore}%`);
      console.log(`   ├─ Evidence Traceability: ${result.evidenceTraceability}%`);
      console.log(`   ├─ Confidence Calibration: ${result.confidenceCalibration}%`);
      console.log(`   ├─ Contradiction Handling: ${result.contradictionHandling}%`);
      console.log(`   ├─ Unknown Detection: ${result.unknownDetection}%`);
      console.log(`   ├─ Reasoning Coherence: ${result.reasoningCoherence}%`);
      console.log(`   └─ Strategic Utility: ${result.strategicUtility}%`);
      console.log(`   Respect: ${result.reasoning.respectVsAgreement}`);
      console.log(`   Stage Diff: ${result.expertDifference.stageDifference}`);
      console.log();
    });

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("BENCHMARK SUMMARY");
    console.log("=".repeat(70));
    console.log(`\n📈 Key Metrics:`);
    console.log(`   Average Overall Score: ${summary.averageOverallScore}%`);
    console.log(`   Average Strategic Utility: ${summary.averageUtility}%`);
    console.log(`   Average Evidence Traceability: ${summary.averageTraceability}%`);

    console.log(`\n✅ Top Strengths:`);
    summary.topStrengths.forEach((s) => console.log(`   • ${s}`));

    console.log(`\n⚠️  Top Weaknesses:`);
    summary.topWeaknesses.forEach((w) => console.log(`   • ${w}`));

    console.log(`\n📚 Learning Rules (${summary.learningRules.length} identified):`);
    summary.learningRules.slice(0, 10).forEach((rule, i) => {
      console.log(`   ${i + 1}. ${rule}`);
    });
    if (summary.learningRules.length > 10) {
      console.log(`   ... and ${summary.learningRules.length - 10} more`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ PHASE 1 CALIBRATION COMPLETE");
    console.log("=".repeat(70));
    console.log("\nBenchmark established. Ready for Phase 2-7 implementation.\n");

    // Export data for Phase 2-7
    return {
      benchmarkComplete: true,
      averageScore: summary.averageOverallScore,
      learningRules: summary.learningRules,
      strengths: summary.topStrengths,
      weaknesses: summary.topWeaknesses,
    };
  } catch (error) {
    console.error("❌ Phase 1 Execution Failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
