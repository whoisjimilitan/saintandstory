import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * INBOX: Businesses discovered but not yet reviewed
 *
 * Shows businesses that have no conversations or hypotheses yet.
 * This is the entry point for the workflow.
 */

export async function GET() {
  try {
    // Get all businesses that have no conversations yet
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

    // Filter to only those with no conversations
    const unreviewed = inboxBusinesses.filter(b => b._count.conversations === 0);

    return NextResponse.json({
      count: unreviewed.length,
      businesses: unreviewed.map(b => ({
        id: b.id,
        name: b.name,
        placeId: b.placeId,
        reviewCount: b._count.reviews,
        hypothesesCount: b._count.hypotheses,
        discoveredAt: b.createdAt,
        status: "inbox",
        actions: [
          { label: "Review", href: `/workflow/investigation/${b.id}` },
          { label: "Archive", action: "archive", businessId: b.id },
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
