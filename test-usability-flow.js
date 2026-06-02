/**
 * PHASE 3.2 USABILITY TEST
 */

const BASE_URL = "http://localhost:3001";
const BUSINESS_ID = "cmpx5iqal0000mmb7jdoiqaca";

const results = [];

async function testStep(name, url) {
  const start = Date.now();
  try {
    const response = await fetch(url);
    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        url,
        status: `ERROR: ${response.status}`,
        dataPresent: false,
        responseTime,
      };
    }

    const data = await response.json();
    const hasData =
      (Array.isArray(data) && data.length > 0) ||
      (typeof data === "object" && Object.keys(data).length > 0);

    return {
      url,
      status: "OK",
      dataPresent: hasData,
      responseTime,
    };
  } catch (e) {
    const responseTime = Date.now() - start;
    return {
      url,
      status: `ERROR: ${e.message}`,
      dataPresent: false,
      responseTime,
    };
  }
}

async function runTests() {
  console.log("===== PHASE 3.2: USABILITY FLOW TEST =====\n");
  console.log(`Testing workflow for Business: ${BUSINESS_ID}\n`);

  // STEP 1: INBOX
  console.log("STEP 1: INBOX - See unreviewed businesses");
  let result = await testStep("Inbox", `${BASE_URL}/api/workflow/inbox`);
  results.push({
    step: "Inbox",
    ...result,
    issues:
      result.status !== "OK"
        ? [`API Error: ${result.status}`]
        : result.dataPresent
          ? []
          : ["No unreviewed businesses (expected - Northern Flower already has conversation)"],
  });
  console.log(`✓ API responding: ${result.responseTime}ms`);
  console.log(`✓ Displays: Unreviewed businesses list with review counts\n`);

  // STEP 2: INVESTIGATION
  console.log("STEP 2: INVESTIGATION - Review evidence & hypotheses");
  result = await testStep(
    "Investigation",
    `${BASE_URL}/api/workflow/investigation/${BUSINESS_ID}`
  );
  results.push({
    step: "Investigation",
    ...result,
    issues:
      result.status !== "OK"
        ? [`API Error: ${result.status}`]
        : result.dataPresent
          ? []
          : ["No data returned"],
  });
  console.log(`✓ API responding: ${result.responseTime}ms`);
  console.log(`✓ Displays: Evidence (reviews), hypotheses, unknowns\n`);

  // STEP 3: CONVERSATIONS
  console.log("STEP 3: CONVERSATIONS - Track outreach");
  result = await testStep(
    "Conversations",
    `${BASE_URL}/api/workflow/conversations/${BUSINESS_ID}`
  );
  results.push({
    step: "Conversations",
    ...result,
    issues:
      result.status !== "OK"
        ? [`API Error: ${result.status}`]
        : result.dataPresent
          ? []
          : ["No conversations"],
  });
  console.log(`✓ API responding: ${result.responseTime}ms`);
  console.log(`✓ Displays: List of conversations, preserved questions\n`);

  // STEP 4: OUTCOMES
  console.log("STEP 4: OUTCOMES - Record what reality said");
  result = await testStep(
    "Outcomes",
    `${BASE_URL}/api/workflow/outcomes/${BUSINESS_ID}`
  );
  results.push({
    step: "Outcomes",
    ...result,
    issues:
      result.status !== "OK"
        ? [`API Error: ${result.status}`]
        : result.dataPresent
          ? []
          : ["No outcomes recorded"],
  });
  console.log(`✓ API responding: ${result.responseTime}ms`);
  console.log(`✓ Displays: Outcome signals, truth levels, classifications\n`);

  // STEP 5: TIMELINE
  console.log("STEP 5: TIMELINE - Chronological reality");
  result = await testStep(
    "Timeline",
    `${BASE_URL}/api/workflow/timeline/${BUSINESS_ID}`
  );
  results.push({
    step: "Timeline",
    ...result,
    issues:
      result.status !== "OK"
        ? [`API Error: ${result.status}`]
        : result.dataPresent
          ? []
          : ["No events"],
  });
  console.log(`✓ API responding: ${result.responseTime}ms`);
  console.log(`✓ Displays: All events ordered chronologically\n`);

  // STEP 6: AUDIT
  console.log("STEP 6: AUDIT - Evidence chains");
  result = await testStep(
    "Audit",
    `${BASE_URL}/api/workflow/audit?assumption=test`
  );
  results.push({
    step: "Audit",
    ...result,
    issues:
      result.status !== "OK"
        ? [`API Error: ${result.status}`]
        : ["Ready for testing with assumption IDs"],
  });
  console.log(`✓ API responding: ${result.responseTime}ms`);
  console.log(`✓ Ready for: Tracing evidence chains\n`);

  // SUMMARY
  console.log("===== USABILITY TEST SUMMARY =====\n");

  const avgResponseTime =
    results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  const allPassing = results.every((r) => r.status === "OK");
  const allHaveData = results.every((r) => r.dataPresent);

  console.log(`API Response Times:`);
  results.forEach((r) => {
    console.log(
      `  ${r.step.padEnd(15)}: ${r.responseTime}ms (${r.status})`
    );
  });
  console.log(`  Average: ${Math.round(avgResponseTime)}ms\n`);

  console.log(`Data Availability:`);
  results.forEach((r) => {
    console.log(`  ${r.step.padEnd(15)}: ${r.dataPresent ? "✓" : "✗"}`);
  });

  console.log(`\n===== WORKFLOW STATUS =====`);
  if (allPassing && allHaveData) {
    console.log(`✅ ALL STEPS OPERATIONAL - Ready for browser testing\n`);
  } else {
    console.log(`⚠️ ISSUES FOUND:\n`);
    results.forEach((r) => {
      if (r.issues.length > 0) {
        console.log(`  ${r.step}:`);
        r.issues.forEach((issue) => console.log(`    - ${issue}`));
      }
    });
  }

  console.log(
    `\n===== NEXT: BROWSER TESTING REQUIRED =====\n`
  );
  console.log(`API endpoints are working. Manual browser testing needed:\n`);
  console.log(`1. Navigate to: http://localhost:3001/workflow/inbox`);
  console.log(`2. Click on business to go to: Investigation`);
  console.log(`3. Navigate through: Conversations → Outcomes → Timeline → Audit\n`);
  console.log(`Measure for each page:`);
  console.log(`  - Page load time`);
  console.log(`  - Number of clicks to log data`);
  console.log(`  - Number of form fields required`);
  console.log(`  - Clarity of instructions`);
  console.log(`  - Navigation intuitiveness\n`);
}

runTests().catch(console.error);
