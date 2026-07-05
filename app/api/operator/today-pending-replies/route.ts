import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count inbound messages (replies) from today across all channels
    const pendingReplies = await prisma.b2bConversationEvent.count({
      where: {
        direction: "inbound",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log(`[TODAY PENDING REPLIES] Count: ${pendingReplies}`);

    return NextResponse.json({
      count: pendingReplies,
    });
  } catch (error) {
    console.error("[TODAY PENDING REPLIES] Error:", error);
    return NextResponse.json(
      {
        count: 0,
      },
      { status: 200 }
    );
  }
}
