import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count active conversations (any WhatsApp conversation in last 7 days)
    const activeConversations = await prisma.b2bConversationEvent.findMany({
      where: {
        type: "whatsapp",
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      distinct: ["leadId"],
      select: {
        leadId: true,
      },
    });

    const activeCount = activeConversations.length;

    // Count replies today (inbound messages from today)
    const repliedToday = await prisma.b2bConversationEvent.count({
      where: {
        type: "whatsapp",
        direction: "inbound",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log(
      `[TODAY WHATSAPP STATS] Active: ${activeCount}, Replied today: ${repliedToday}`
    );

    return NextResponse.json({
      active: activeCount,
      replied: repliedToday,
    });
  } catch (error) {
    console.error("[TODAY WHATSAPP STATS] Error:", error);
    return NextResponse.json(
      {
        active: 0,
        replied: 0,
      },
      { status: 200 }
    );
  }
}
