import { generatePsychologyEmail, PsychologyEmailOutput } from "../b2b-psychology-engine";
import { validatePsychologyEmail, passesUnderstoodTest } from "../b2b-psychology-validator";

/**
 * WAVE 1 TEST: Psychology Engine
 *
 * Demonstrates:
 * 1. Psychology engine generates RRAT-compliant emails
 * 2. Validator checks for component presence
 * 3. Email passes "understood vs informed" test
 */

async function testPsychologyEngine() {
  console.log("=== WAVE 1 TEST: Psychology Engine ===\n");

  // Test 1: Generate email for estate agent (Customer Acquisition Friction)
  console.log("TEST 1: Estate Agent (Customer Acquisition Friction)");
  const estateAgentLead = {
    name: "haart",
    category: "estate-agents",
    location: "Leeds",
    observations:
      "Your best branch gets 4.8★ reviews, your newer branch gets 3.2★. Clients consistently mention the difference.",
    pain_point_review: "inconsistent service across branches",
    business_pattern: "branch managers not equally polished",
    weekly_jobs: 12,
  };

  const estateEmail = await generatePsychologyEmail(estateAgentLead);
  console.log("Generated Email:");
  console.log(estateEmail.email_body);
  console.log("\nComponents:");
  console.log(`- Pressure Type: ${estateEmail.pressure_type}`);
  console.log(`- Recognition: ${estateEmail.recognition.substring(0, 60)}...`);
  console.log(`- Relief: ${estateEmail.relief.substring(0, 60)}...`);

  const estateValidation = validatePsychologyEmail(estateEmail.email_body);
  console.log("\nValidation:");
  console.log(`- Pass: ${estateValidation.pass}`);
  console.log(`- Score: ${estateValidation.score}/10`);
  console.log(`- Components: R=${estateValidation.components.recognition_present}, L=${estateValidation.components.relief_present}, T=${estateValidation.components.trust_present}, A=${estateValidation.components.action_present}`);
  console.log(`- Understood Test: ${passesUnderstoodTest(estateEmail.email_body) ? "✅ PASS" : "❌ FAIL"}`);

  // Test 2: Generate email for pharmacy (Customer Churn)
  console.log("\n\nTEST 2: Pharmacy (Customer Churn)");
  const pharmacyLead = {
    name: "Westpoint Pharmacy",
    category: "pharmacy",
    location: "Bristol",
    observations: "Regular customers mention relocation as reason for leaving",
    pain_point_review: "customer loss to relocation",
    business_pattern: "quiet customer churn",
    weekly_jobs: 8,
  };

  const pharmacyEmail = await generatePsychologyEmail(pharmacyLead);
  console.log("Generated Email:");
  console.log(pharmacyEmail.email_body);
  console.log(`\nPressure Type: ${pharmacyEmail.pressure_type}`);

  const pharmacyValidation = validatePsychologyEmail(pharmacyEmail.email_body);
  console.log("\nValidation:");
  console.log(`- Pass: ${pharmacyValidation.pass}`);
  console.log(`- Score: ${pharmacyValidation.score}/10`);
  console.log(`- Understood Test: ${passesUnderstoodTest(pharmacyEmail.email_body) ? "✅ PASS" : "❌ FAIL"}`);

  // Summary
  console.log("\n\n=== WAVE 1 SUMMARY ===");
  console.log(`Email 1: ${estateValidation.pass ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Email 2: ${pharmacyValidation.pass ? "✅ PASS" : "❌ FAIL"}`);
  console.log("\nBoth emails should:");
  console.log("- Contain specific recognition (prospect recognizes themselves)");
  console.log("- Acknowledge burden (not just state problem)");
  console.log("- Offer methodology (not just claim)");
  console.log("- End with validation question (not generic CTA)");
}

testPsychologyEngine().catch(console.error);
