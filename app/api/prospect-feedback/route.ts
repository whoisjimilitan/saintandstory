import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FeedbackPayload } from "@/lib/prospect-types";

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    // Validate required fields
    if (!body.slug || !body.feedbackType) {
      return NextResponse.json(
        { error: "Missing required fields: slug, feedbackType" },
        { status: 400 }
      );
    }

    // Validate feedbackType
    if (!["yes", "partly", "no"].includes(body.feedbackType)) {
      return NextResponse.json(
        { error: "Invalid feedbackType. Must be 'yes', 'partly', or 'no'" },
        { status: 400 }
      );
    }

    // Insert feedback into database
    const feedback = await prisma.prospectFeedback.create({
      data: {
        slug: body.slug,
        feedbackType: body.feedbackType,
        referrer: body.referrer || null,
        userAgent: body.userAgent || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback recorded",
        id: feedback.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording feedback:", error);

    return NextResponse.json(
      { error: "Failed to record feedback" },
      { status: 500 }
    );
  }
}
