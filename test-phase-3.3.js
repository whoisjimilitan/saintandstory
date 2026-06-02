const { PrismaClient } = require("@prisma/client");

const BASE_URL = "http://localhost:3000";
const prisma = new PrismaClient();

async function testPhase33() {
  console.log("===== PHASE 3.3: REALITY CAPTURE TEST =====\n");

  // Step 1: Create a test business and conversation
  console.log("Step 1: Creating test data...");
  const business = await prisma.business.create({
    data: {
      name: "Test Venue Co",
      placeId: "test-123",
      createdAt: new Date(),
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      businessId: business.id,
      question: "How many events do you coordinate per month?",
      createdAt: new Date(),
    },
  });

  console.log(`✓ Created business: ${business.id}`);
  console.log(`✓ Created conversation: ${conversation.id}\n`);

  // Step 2: Test outcome capture (3-step flow)
  console.log("Step 2: Testing outcome capture API...");
  const startTime = Date.now();

  const outcomeResponse = await fetch(`${BASE_URL}/api/workflow/outcomes/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId: conversation.id,
      signalType: "real_conversation",
      signalClassification: "supports",
      unexpectedLearning: "Owner mentioned 50+ weddings per year, much higher than expected.",
    }),
  });

  const captureTime = Date.now() - startTime;

  if (!outcomeResponse.ok) {
    console.log(`✗ Failed to capture outcome: ${outcomeResponse.status}`);
    console.log(await outcomeResponse.text());
    process.exit(1);
  }

  const outcome = await outcomeResponse.json();
  console.log(`✓ Outcome captured in ${captureTime}ms`);
  console.log(`  Signal: ${outcome.outcome.signalType}`);
  console.log(`  Classification: ${outcome.outcome.signalClassification}`);
  console.log(`  Learning: ${outcome.outcome.unexpectedLearning}\n`);

  // Step 3: Verify in Timeline
  console.log("Step 3: Verifying data in Timeline...");
  const timelineResponse = await fetch(
    `${BASE_URL}/api/workflow/timeline/${business.id}`
  );

  if (!timelineResponse.ok) {
    console.log(`✗ Failed to fetch timeline: ${timelineResponse.status}`);
    process.exit(1);
  }

  const timeline = await timelineResponse.json();
  const outcomeInTimeline = timeline.events.find((e) => e.type === "outcome");

  if (!outcomeInTimeline) {
    console.log(`✗ Outcome not found in timeline`);
    process.exit(1);
  }

  console.log(`✓ Outcome appears in timeline`);
  console.log(`  Type: ${outcomeInTimeline.type}`);
  console.log(`  Signal: ${outcomeInTimeline.data.signal}`);
  console.log(`  Learning: ${outcomeInTimeline.data.learning}\n`);

  // Step 4: Verify in Outcomes API
  console.log("Step 4: Verifying data in Outcomes view...");
  const outcomesResponse = await fetch(
    `${BASE_URL}/api/workflow/outcomes/${business.id}`
  );

  if (!outcomesResponse.ok) {
    console.log(`✗ Failed to fetch outcomes: ${outcomesResponse.status}`);
    process.exit(1);
  }

  const outcomesData = await outcomesResponse.json();
  const capturedOutcome = outcomesData.outcomes.find(
    (o) => o.conversationId === conversation.id
  );

  if (!capturedOutcome) {
    console.log(`✗ Outcome not found in outcomes view`);
    process.exit(1);
  }

  console.log(`✓ Outcome appears in Outcomes view`);
  console.log(`  Signal: ${capturedOutcome.signal.type}`);
  console.log(`  Classification: ${capturedOutcome.classification}`);
  console.log(`  Learning: ${capturedOutcome.unexpectedLearning}\n`);

  // Step 5: Summary
  console.log("===== PHASE 3.3 TEST SUMMARY =====\n");
  console.log(`✅ Outcome capture successful`);
  console.log(`   Capture time: ${captureTime}ms`);
  console.log(`   Data persisted to Timeline: ✓`);
  console.log(`   Data persisted to Outcomes: ✓`);
  console.log(`   unexpectedLearning field: ✓`);
  console.log(`\n🎯 Ready for UI testing at: http://localhost:3000`);

  // Cleanup
  await prisma.business.delete({ where: { id: business.id } });
  await prisma.$disconnect();
}

testPhase33().catch(async (e) => {
  console.error("Test failed:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
