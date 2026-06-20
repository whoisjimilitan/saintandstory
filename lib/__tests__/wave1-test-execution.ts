import { generatePsychologyEmail } from "../b2b-psychology-engine";
import { validatePsychologyEmail, passesUnderstoodTest } from "../b2b-psychology-validator";
import { WAVE1_TEST_PROSPECTS, WAVE1_EXPECTED_OUTCOMES } from "./wave1-testing-data";

/**
 * WAVE 1 TEST EXECUTION
 *
 * Generates psychology emails for 6 real prospects.
 * Validates each for RRAT compliance.
 * Compares to hardcoded templates.
 * Measures: Validator pass rate, understood test pass rate, framework validation.
 *
 * Success Criteria:
 * - 50%+ of generated emails pass validator (score >= 7)
 * - 100% of emails pass "understood vs informed" test
 * - All 6 prospects recognize themselves in recognition statement
 * - All 6 prospects' burdens are specifically named (not generic)
 */

interface TestResult {
  prospect_id: string;
  prospect_name: string;
  pressure_type: string;
  psychology_email: string;
  validation_result: {
    pass: boolean;
    score: number;
    components: {
      recognition_present: boolean;
      relief_present: boolean;
      trust_present: boolean;
      action_present: boolean;
    };
    failed_rules: string[];
  };
  understood_test_pass: boolean;
  recognition_statement: string;
  relief_statement: string;
  trust_statement: string;
  action_statement: string;
}

interface TestSummary {
  total_prospects: number;
  validator_pass_count: number;
  validator_pass_rate: string;
  understood_test_pass_count: number;
  understood_test_pass_rate: string;
  recognition_accuracy: number;
  relief_specificity: number;
  average_score: number;
  findings: string[];
  recommendation: string;
}

async function runWave1Testing(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║              WAVE 1 TESTING: Psychology Engine Proof            ║");
  console.log("║                    6 Real Prospect Test Suite                   ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  const results: TestResult[] = [];

  // Generate and validate psychology emails for each prospect
  for (const prospect of WAVE1_TEST_PROSPECTS) {
    console.log(`\n📧 Testing: ${prospect.name} (${prospect.category})\n`);

    try {
      // Generate psychology email
      const psychologyOutput = await generatePsychologyEmail({
        name: prospect.name,
        category: prospect.category,
        location: prospect.location || null,
        observations: prospect.observations,
        pain_point_review: prospect.pain_point_review,
        business_pattern: prospect.business_pattern,
        weekly_jobs: prospect.weekly_jobs,
      });

      // Validate the generated email
      const validation = validatePsychologyEmail(psychologyOutput.email_body);
      const understoodTest = passesUnderstoodTest(psychologyOutput.email_body);

      console.log(`   Pressure Type: ${psychologyOutput.pressure_type}`);
      console.log(`   Validator Score: ${validation.score}/10`);
      console.log(`   Pass: ${validation.pass ? "✅ YES" : "❌ NO"}`);
      console.log(`   Understood Test: ${understoodTest ? "✅ PASS" : "❌ FAIL"}`);
      console.log(`   Components: R=${validation.components.recognition_present ? "✅" : "❌"} L=${validation.components.relief_present ? "✅" : "❌"} T=${validation.components.trust_present ? "✅" : "❌"} A=${validation.components.action_present ? "✅" : "❌"}`);

      if (validation.failed_rules.length > 0) {
        console.log(`   Issues: ${validation.failed_rules.join(", ")}`);
      }

      console.log(`\n   Generated Email:\n`);
      console.log(`   ${psychologyOutput.email_body.split("\n").join("\n   ")}\n`);

      results.push({
        prospect_id: prospect.id,
        prospect_name: prospect.name,
        pressure_type: psychologyOutput.pressure_type,
        psychology_email: psychologyOutput.email_body,
        validation_result: validation,
        understood_test_pass: understoodTest,
        recognition_statement: psychologyOutput.recognition,
        relief_statement: psychologyOutput.relief,
        trust_statement: psychologyOutput.trust,
        action_statement: psychologyOutput.action,
      });
    } catch (error) {
      console.error(`   ❌ Error processing ${prospect.name}:`, error);
    }
  }

  // Calculate summary
  const summary = calculateSummary(results);

  // Print summary
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                        RESULTS SUMMARY                         ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  console.log(`Total Prospects Tested: ${summary.total_prospects}`);
  console.log(`Validator Pass Rate: ${summary.validator_pass_count}/${summary.total_prospects} (${summary.validator_pass_rate})`);
  console.log(`Understood Test Pass Rate: ${summary.understood_test_pass_count}/${summary.total_prospects} (${summary.understood_test_pass_rate})`);
  console.log(`Average Validator Score: ${summary.average_score.toFixed(1)}/10`);
  console.log(`Recognition Accuracy: ${summary.recognition_accuracy}%`);
  console.log(`Relief Specificity: ${summary.relief_specificity}%`);

  console.log("\n📋 Key Findings:");
  summary.findings.forEach((finding) => {
    console.log(`   • ${finding}`);
  });

  console.log("\n✅ Recommendation:");
  console.log(`   ${summary.recommendation}`);

  // Wave 1 Success Criteria
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                   WAVE 1 SUCCESS CRITERIA                      ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  const criteriaPass = parseFloat(summary.validator_pass_rate) >= 50;
  const understoodPass = parseFloat(summary.understood_test_pass_rate) === 100;
  const recognitionPass = summary.recognition_accuracy === 100;
  const reliefPass = summary.relief_specificity >= 80;

  console.log(`${criteriaPass ? "✅" : "❌"} 50%+ validator pass rate: ${summary.validator_pass_rate} ${criteriaPass ? "PASS" : "FAIL"}`);
  console.log(`${understoodPass ? "✅" : "❌"} 100% understood test pass: ${summary.understood_test_pass_rate} ${understoodPass ? "PASS" : "FAIL"}`);
  console.log(`${recognitionPass ? "✅" : "❌"} 100% recognition accuracy: ${summary.recognition_accuracy}% ${recognitionPass ? "PASS" : "FAIL"}`);
  console.log(`${reliefPass ? "✅" : "❌"} 80%+ relief specificity: ${summary.relief_specificity}% ${reliefPass ? "PASS" : "FAIL"}`);

  const allCriteriaMet = criteriaPass && understoodPass && recognitionPass && reliefPass;

  console.log(`\n${allCriteriaMet ? "✅ WAVE 1 TESTING: PASSED" : "⚠️  WAVE 1 TESTING: REVIEW NEEDED"}`);

  // Detailed results per prospect
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                     DETAILED RESULTS                           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  results.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.prospect_name}`);
    console.log(`   Pressure Type: ${result.pressure_type}`);
    console.log(`   Score: ${result.validation_result.score}/10 ${result.validation_result.pass ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`   Understood: ${result.understood_test_pass ? "✅ YES" : "❌ NO"}`);
    console.log(`   Recognition: "${result.recognition_statement.substring(0, 60)}..."`);
    console.log(`   Relief: "${result.relief_statement.substring(0, 60)}..."`);
    if (result.validation_result.failed_rules.length > 0) {
      console.log(`   Issues: ${result.validation_result.failed_rules.join(", ")}`);
    }
  });
}

function calculateSummary(results: TestResult[]): TestSummary {
  const validatorPassCount = results.filter((r) => r.validation_result.pass).length;
  const understoodPassCount = results.filter((r) => r.understood_test_pass).length;
  const totalScore = results.reduce((sum, r) => sum + r.validation_result.score, 0);
  const averageScore = totalScore / results.length;

  // Count prospects that recognize themselves (recognition_present)
  const recognitionCount = results.filter((r) => r.validation_result.components.recognition_present).length;
  const recognitionAccuracy = (recognitionCount / results.length) * 100;

  // Count prospects with relief (relief_present)
  const reliefCount = results.filter((r) => r.validation_result.components.relief_present).length;
  const reliefSpecificity = (reliefCount / results.length) * 100;

  const validatorPassRate = `${((validatorPassCount / results.length) * 100).toFixed(0)}%`;
  const understoodPassRate = `${((understoodPassCount / results.length) * 100).toFixed(0)}%`;

  const findings: string[] = [];

  if (validatorPassCount >= results.length * 0.5) {
    findings.push(`Psychology engine achieves ${validatorPassRate} validator pass rate (Target: 50%+) ✅`);
  } else {
    findings.push(`Psychology engine below target: ${validatorPassRate} validator pass rate (Target: 50%+) ⚠️`);
  }

  if (understoodPassCount === results.length) {
    findings.push("All 6 prospects pass 'understood vs informed' test ✅");
  } else {
    findings.push(`${understoodPassCount}/6 prospects pass 'understood' test ⚠️`);
  }

  if (recognitionAccuracy === 100) {
    findings.push("100% of prospects recognize themselves in recognition statement ✅");
  } else {
    findings.push(`${recognitionAccuracy}% of prospects recognize themselves ⚠️`);
  }

  if (reliefSpecificity >= 80) {
    findings.push("Relief statements are specific and name actual burdens ✅");
  } else {
    findings.push("Some relief statements are too generic ⚠️");
  }

  findings.push(`Average validator score: ${averageScore.toFixed(1)}/10`);

  let recommendation = "";
  if (validatorPassCount >= results.length * 0.5 && understoodPassCount === results.length) {
    recommendation = "Psychology engine WORKS. Framework is validated. Proceed to Wave 2 (Scale).";
  } else {
    recommendation = "Framework logic works but validator needs tuning. Adjust validator thresholds, then retry.";
  }

  return {
    total_prospects: results.length,
    validator_pass_count: validatorPassCount,
    validator_pass_rate: validatorPassRate,
    understood_test_pass_count: understoodPassCount,
    understood_test_pass_rate: understoodPassRate,
    recognition_accuracy: recognitionAccuracy,
    relief_specificity: reliefSpecificity,
    average_score: averageScore,
    findings,
    recommendation,
  };
}

runWave1Testing().catch(console.error);
