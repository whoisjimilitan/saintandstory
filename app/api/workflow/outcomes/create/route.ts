import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * OUTCOME CAPTURE: Save what reality said
 *
 * 3-step flow:
 * 1. What happened? (signal type)
 * 2. What surprised you? (unexpectedLearning)
 * 3. What does it say? (classification)
 *
 * Goal: Under 15 seconds to complete.
 * Design: Minimal friction, no analysis, store exactly as written.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      conversationId,
      signalType,
      signalClassification,
      unexpectedLearning,
    } = body;

    if (!conversationId || !signalType || !signalClassification) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if outcome already exists for this conversation
    const existingOutcome = await prisma.outcome.findUnique({
      where: { conversationId },
    });

    if (existingOutcome) {
      return NextResponse.json(
        { error: "Outcome already exists for this conversation" },
        { status: 409 }
      );
    }

    // Create the outcome
    const outcome = await prisma.outcome.create({
      data: {
        conversationId,
        signalType,
        signalClassification,
        unexpectedLearning: unexpectedLearning || null,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      outcome: {
        id: outcome.id,
        conversationId: outcome.conversationId,
        signalType: outcome.signalType,
        signalClassification: outcome.signalClassification,
        unexpectedLearning: outcome.unexpectedLearning,
        createdAt: outcome.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating outcome:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
