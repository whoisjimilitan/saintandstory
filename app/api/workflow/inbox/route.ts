import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * INBOX: Investigation-ready businesses
 *
 * Shows businesses with pipelineState = INBOX_READY.
 * These have: reviews + hypotheses + pending questions.
 * Ready for James to review and investigate.
 */

export async function GET() {
  try {
    const inboxBusinesses = await prisma.business.findMany({
      where: { pipelineState: "INBOX_READY" },
      include: {
        _count: {
          select: {
            reviews: true,
            hypotheses: true,
            conversations: true,
          },
        },
        hypotheses: {
          include: { evidencePattern: true },
        },
        conversations: {
          where: { status: "pending" },
          select: { id: true, question: true },
        },
      },
      orderBy: { discoveredAt: "desc" },
    });

    return NextResponse.json({
      count: inboxBusinesses.length,
      businesses: inboxBusinesses.map((b) => ({
        id: b.id,
        name: b.name,
        placeId: b.placeId,
        niche: b.niche,
        location: b.location,
        reviewCount: b._count.reviews,
        hypothesesCount: b._count.hypotheses,
        pendingQuestions: b.conversations.length,
        discoveredAt: b.discoveredAt,
        status: "inbox",
        hypotheses: b.hypotheses.map((h) => ({
          id: h.id,
          statement: h.statement,
          evidenceCount: h.evidenceCount,
          pattern: h.evidencePattern?.patternType,
        })),
        actions: [
          { label: "Review", href: `/workflow/investigation/${b.id}` },
          {
            label: "Questions",
            href: `/workflow/conversations/${b.id}`,
          },
        ],
      })),
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
