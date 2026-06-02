import { prisma } from "@/lib/prisma";

/**
 * Read-only event fetchers. No mutations. No scoring.
 */

export async function getBusinessEvents(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      reviews: { orderBy: { createdAt: "desc" } },
      hypotheses: { orderBy: { createdAt: "desc" } },
      conversations: {
        include: { outcome: true },
        orderBy: { createdAt: "desc" }
      },
    },
  });

  return business;
}

export async function getConversationTimeline(businessId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { businessId },
    include: { outcome: true },
    orderBy: { createdAt: "asc" },
  });

  return conversations;
}

export async function getOutcomeHistory(businessId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { businessId },
    include: { outcome: true },
    orderBy: { createdAt: "asc" },
  });

  return conversations
    .filter(c => c.outcome)
    .map(c => ({
      conversationId: c.id,
      date: c.outcome?.createdAt,
      question: c.question,
      signalType: c.outcome?.signalType,
      truthLevel: c.outcome?.truthLevel,
      signalClassification: c.outcome?.signalClassification,
      notes: c.outcome?.notes,
    }));
}

export async function getAssumptionHistory(businessId: string) {
  // Get all assumptions mentioned in hypotheses for this business
  const hypotheses = await prisma.hypothesis.findMany({
    where: { businessId },
    select: { statement: true },
  });

  if (hypotheses.length === 0) return [];

  // For each hypothesis statement, find matching assumptions
  const assumptions = await Promise.all(
    hypotheses.map(h =>
      prisma.assumption.findUnique({
        where: { statement: h.statement },
      })
    )
  );

  return assumptions.filter(Boolean);
}

export async function getReviewExcerpts(businessId: string) {
  const reviews = await prisma.review.findMany({
    where: { businessId },
    select: {
      id: true,
      text: true,
      rating: true,
      author: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
}

export async function getHypotheses(businessId: string) {
  const hypotheses = await prisma.hypothesis.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return hypotheses;
}
