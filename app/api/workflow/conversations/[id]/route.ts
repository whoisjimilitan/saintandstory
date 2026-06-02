import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CONVERSATIONS: Track outreach
 *
 * Shows:
 * - date contacted
 * - method
 * - question asked
 * - conversation notes
 *
 * Never overwrites history.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = id;

    const conversations = await prisma.conversation.findMany({
      where: { businessId },
      include: {
        outcome: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      businessId,
      totalConversations: conversations.length,
      conversations: conversations.map(c => ({
        id: c.id,
        date: c.createdAt,
        method: "phone", // Currently only phone supported
        question: c.question,
        outcome: c.outcome
          ? {
              signalType: c.outcome.signalType,
              truthLevel: c.outcome.truthLevel,
              signalClassification: c.outcome.signalClassification,
              notes: c.outcome.notes,
              recordedAt: c.outcome.createdAt,
            }
          : null,
        status: c.outcome ? "completed" : "pending",
      })),
      nextAction:
        conversations.length === 0
          ? { type: "schedule_call", label: "Schedule first conversation" }
          : { type: "log_outcome", label: "Log outcome from last call" },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
