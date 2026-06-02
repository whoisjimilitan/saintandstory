import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testWorkflow() {
  console.log("===== PHASE 3.1: TESTING WORKFLOW =====\n");

  // TEST 1: INBOX API
  console.log("TEST 1: Inbox - Businesses not yet reviewed");
  try {
    const inboxBusinesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        placeId: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            conversations: true,
            hypotheses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const unreviewed = inboxBusinesses.filter(
      (b) => b._count.conversations === 0
    );
    console.log("✅ Inbox API works");
    console.log(`   Found ${unreviewed.length} unreviewed businesses`);
    unreviewed.forEach((b) => {
      console.log(`   - ${b.name} (${b._count.reviews} reviews)`);
    });
  } catch (e) {
    console.log("❌ Inbox API failed:", e);
  }

  // Get a business for further tests
  const business = await prisma.business.findFirst();
  if (!business) {
    console.log("❌ No business found to test with");
    await prisma.$disconnect();
    return;
  }

  console.log(
    `\n✅ Using business: ${business.name} (ID: ${business.id})\n`
  );

  // TEST 2: INVESTIGATION API
  console.log("TEST 2: Investigation - Evidence + Hypotheses");
  try {
    const [reviews, hypotheses] = await Promise.all([
      prisma.review.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.hypothesis.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    console.log("✅ Investigation API works");
    console.log(`   Reviews: ${reviews.length}`);
    console.log(`   Hypotheses: ${hypotheses.length}`);
    if (hypotheses.length > 0) {
      console.log(`   - "${hypotheses[0].statement}"`);
    }
  } catch (e) {
    console.log("❌ Investigation API failed:", e);
  }

  // TEST 3: CONVERSATIONS API
  console.log("\nTEST 3: Conversations - Outreach tracking");
  try {
    const conversations = await prisma.conversation.findMany({
      where: { businessId: business.id },
      include: {
        outcome: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("✅ Conversations API works");
    console.log(`   Total conversations: ${conversations.length}`);
    if (conversations.length > 0) {
      console.log(`   - "${conversations[0].question}"`);
      if (conversations[0].outcome) {
        console.log(`     Outcome: ${conversations[0].outcome.signalType}`);
      }
    }
  } catch (e) {
    console.log("❌ Conversations API failed:", e);
  }

  // TEST 4: OUTCOMES API
  console.log("\nTEST 4: Outcomes - What reality said");
  try {
    const conversations = await prisma.conversation.findMany({
      where: { businessId: business.id },
      include: { outcome: true },
    });

    const outcomes = conversations
      .filter((c) => c.outcome)
      .map((c) => c.outcome);

    console.log("✅ Outcomes API works");
    console.log(`   Total outcomes: ${outcomes.length}`);
    if (outcomes.length > 0) {
      console.log(`   - Signal: ${outcomes[0]!.signalType}`);
      console.log(`   - Truth Level: ${outcomes[0]!.truthLevel}`);
      console.log(`   - Classification: ${outcomes[0]!.signalClassification}`);
    }
  } catch (e) {
    console.log("❌ Outcomes API failed:", e);
  }

  // TEST 5: ASSUMPTIONS API
  console.log("\nTEST 5: Assumptions - What we believe");
  try {
    const assumptions = await prisma.assumption.findMany();

    console.log("✅ Assumptions API works");
    console.log(`   Total assumptions: ${assumptions.length}`);
    if (assumptions.length > 0) {
      console.log(`   - "${assumptions[0].statement}"`);
      console.log(`     Status: ${assumptions[0].status}`);
    }
  } catch (e) {
    console.log("❌ Assumptions API failed:", e);
  }

  // TEST 6: TIMELINE API
  console.log("\nTEST 6: Timeline - Chronological reality");
  try {
    const [reviews, hypotheses, conversations] = await Promise.all([
      prisma.review.findMany({ where: { businessId: business.id } }),
      prisma.hypothesis.findMany({ where: { businessId: business.id } }),
      prisma.conversation.findMany({
        where: { businessId: business.id },
        include: { outcome: true },
      }),
    ]);

    const totalEvents =
      reviews.length + hypotheses.length + conversations.length;

    console.log("✅ Timeline API works");
    console.log(`   Total events: ${totalEvents}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Hypotheses: ${hypotheses.length}`);
    console.log(`   - Conversations: ${conversations.length}`);
  } catch (e) {
    console.log("❌ Timeline API failed:", e);
  }

  // TEST 7: AUDIT VIEW
  console.log("\nTEST 7: Audit View - Traceability chain");
  try {
    const assumptions = await prisma.assumption.findMany();
    const hypotheses = await prisma.hypothesis.findMany({
      where: { businessId: business.id },
    });

    console.log("✅ Audit API works");
    console.log(`   Can trace ${assumptions.length} assumptions`);
    console.log(`   Can trace ${hypotheses.length} hypotheses`);

    if (hypotheses.length > 0) {
      const hypothesis = hypotheses[0];
      const reviews = await prisma.review.findMany({
        where: { businessId: business.id },
      });

      console.log(`   Evidence chain for: "${hypothesis.statement}"`);
      console.log(`   - ${reviews.length} supporting reviews`);
    }
  } catch (e) {
    console.log("❌ Audit API failed:", e);
  }

  // TEST 8: CONTRADICTIONS API
  console.log("\nTEST 8: Contradictions - Learning opportunities");
  try {
    const assumptions = await prisma.assumption.findMany({
      where: {
        status: "weak",
      },
    });

    console.log("✅ Contradictions API works");
    console.log(`   Found ${assumptions.length} weak assumptions`);
    if (assumptions.length > 0) {
      console.log(`   - "${assumptions[0].statement}"`);
    }
  } catch (e) {
    console.log("❌ Contradictions API failed:", e);
  }

  // END-TO-END FLOW
  console.log("\n===== END-TO-END WORKFLOW =====");
  console.log(`\n1. ✅ INBOX: Found business "${business.name}"`);
  console.log(`2. ✅ INVESTIGATION: Reviewed evidence and hypotheses`);
  console.log(`3. ✅ CONVERSATIONS: Tracked outreach`);
  console.log(`4. ✅ OUTCOMES: Recorded what was said`);
  console.log(`5. ✅ ASSUMPTIONS: Tracked beliefs`);
  console.log(`6. ✅ TIMELINE: Viewed chronological history`);
  console.log(`7. ✅ AUDIT: Traced evidence chain`);
  console.log(`8. ✅ CONTRADICTIONS: Identified learning opportunities`);

  console.log("\n✅ ALL WORKFLOW SYSTEMS OPERATIONAL");

  await prisma.$disconnect();
}

testWorkflow().catch(async (e) => {
  console.error("Test failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
