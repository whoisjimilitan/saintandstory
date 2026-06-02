import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create a test business
  const business = await prisma.business.create({
    data: {
      name: "Northern Flower",
      placeId: "ChIJn6wCO...",
      createdAt: new Date("2026-05-20"),
    },
  });
  console.log("✅ Created business:", business.name);

  // Create reviews
  const review1 = await prisma.review.create({
    data: {
      businessId: business.id,
      text: "Hannah designed beautiful wedding flowers for us. Absolutely stunning and delivered perfectly on time.",
      rating: 5,
      author: "Sarah M.",
      createdAt: new Date("2026-04-15"),
    },
  });

  const review2 = await prisma.review.create({
    data: {
      businessId: business.id,
      text: "Perfect for our Mother's Day arrangements. Emma was so patient and coordinated everything brilliantly.",
      rating: 5,
      author: "James K.",
      createdAt: new Date("2026-03-20"),
    },
  });

  const review3 = await prisma.review.create({
    data: {
      businessId: business.id,
      text: "Wedding coordination was seamless. Owner Hannah personally helped with all custom design elements. Highly recommend!",
      rating: 5,
      author: "Michael T.",
      createdAt: new Date("2026-02-10"),
    },
  });

  console.log("✅ Created 3 reviews");

  // Create hypotheses
  const hypothesis1 = await prisma.hypothesis.create({
    data: {
      businessId: business.id,
      statement: "Owner is heavily involved in wedding coordination",
      status: "emerging",
      evidenceCount: 3,
      createdAt: new Date("2026-05-25"),
    },
  });

  const hypothesis2 = await prisma.hypothesis.create({
    data: {
      businessId: business.id,
      statement: "Seasonal peaks like Mother's Day create operational stress",
      status: "emerging",
      evidenceCount: 2,
      createdAt: new Date("2026-05-25"),
    },
  });

  console.log("✅ Created 2 hypotheses");

  // Create a conversation
  const conversation = await prisma.conversation.create({
    data: {
      businessId: business.id,
      question:
        "You handle a lot of wedding work. How many components does a typical wedding order have, and how much time does coordination take?",
      createdAt: new Date("2026-05-28T09:00:00"),
    },
  });

  console.log("✅ Created conversation");

  // Create outcome
  const outcome = await prisma.outcome.create({
    data: {
      conversationId: conversation.id,
      signalType: "contacted",
      truthLevel: "direct",
      signalClassification: "supports",
      notes: "Owner confirmed personal involvement in all wedding orders. Mentioned handling 5-10 components per wedding with 3-4 months coordination.",
      createdAt: new Date("2026-05-28T09:15:00"),
    },
  });

  console.log("✅ Created outcome");

  // Create assumption
  const assumption = await prisma.assumption.create({
    data: {
      statement: "Owner is heavily involved in operations",
      status: "emerging",
    },
  });

  console.log("✅ Created assumption");

  console.log("\n✅ SEED COMPLETE");
  console.log("Business created:", business.id);
  console.log("Reviews: 3");
  console.log("Hypotheses: 2");
  console.log("Conversation: 1");
  console.log("Outcome: 1");
  console.log("Assumption: 1");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
