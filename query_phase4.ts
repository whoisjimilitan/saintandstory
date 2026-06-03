import { prisma } from "@/lib/prisma";

async function verifyPhase4() {
  console.log("=== PHASE 4 VERIFICATION ===\n");

  // 1. Count businesses
  const businessCount = await prisma.business.count({
    where: { pipelineState: "INBOX_READY" }
  });
  console.log(`✓ Inbox-ready businesses: ${businessCount}`);

  // 2. Get first 5 businesses with full data
  const businesses = await prisma.business.findMany({
    where: { pipelineState: "INBOX_READY" },
    include: {
      reviews: { take: 5 },
      hypotheses: { include: { evidencePattern: true } },
      conversations: { where: { status: "pending" }, take: 3 }
    },
    take: 5
  });

  console.log(`\n=== SAMPLE BUSINESSES ===\n`);

  for (const business of businesses) {
    console.log(`📍 Business: ${business.name}`);
    console.log(`   ID: ${business.id}`);
    console.log(`   Place ID: ${business.placeId}`);
    console.log(`   Discovered: ${business.discoveredAt}`);
    console.log(`   State: ${business.pipelineState}`);

    // Show reviews
    console.log(`\n   Reviews (${business.reviews.length} total):`);
    for (const review of business.reviews.slice(0, 2)) {
      console.log(`   - "${review.text.substring(0, 80)}..."`);
      console.log(`     Rating: ${review.rating}⭐`);
    }

    // Show hypotheses with patterns
    console.log(`\n   Hypotheses (${business.hypotheses.length} total):`);
    for (const hyp of business.hypotheses.slice(0, 2)) {
      console.log(`   - "${hyp.statement}"`);
      if (hyp.evidencePattern) {
        console.log(`     Pattern: ${hyp.evidencePattern.patternType}`);
        console.log(`     Examples: ${hyp.evidencePattern.examples}`);
      }
    }

    // Show questions
    console.log(`\n   Questions (${business.conversations.length} pending):`);
    for (const conv of business.conversations.slice(0, 2)) {
      console.log(`   - "${conv.question}"`);
    }

    console.log(`\n${"─".repeat(80)}\n`);
  }

  // 3. Totals
  const reviewCount = await prisma.review.count();
  const hypothesesCount = await prisma.hypothesis.count();
  const conversationCount = await prisma.conversation.count({ where: { status: "pending" } });
  const patternCount = await prisma.evidencePattern.count();

  console.log(`\n=== TOTALS ===`);
  console.log(`Businesses (INBOX_READY): ${businessCount}`);
  console.log(`Reviews collected: ${reviewCount}`);
  console.log(`Evidence patterns: ${patternCount}`);
  console.log(`Hypotheses generated: ${hypothesesCount}`);
  console.log(`Questions pending: ${conversationCount}`);

  await prisma.$disconnect();
}

verifyPhase4().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
