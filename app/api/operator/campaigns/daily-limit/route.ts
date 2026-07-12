import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const RESEND_DAILY_LIMIT = 100;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emailsSentToday = await prisma.b2bCampaignEmail.count({
      where: {
        status: "sent",
        emailSentAt: { gte: today },
      },
    });

    const emailsInQueue = await prisma.b2bCampaignEmail.count({
      where: {
        status: "pending",
        scheduledFor: { not: null },
      },
    });

    const remaining = Math.max(0, RESEND_DAILY_LIMIT - emailsSentToday - emailsInQueue);
    const percentUsed = Math.round((emailsSentToday + emailsInQueue) / RESEND_DAILY_LIMIT * 100);

    return NextResponse.json({
      limit: RESEND_DAILY_LIMIT,
      sentToday: emailsSentToday,
      queuedToday: emailsInQueue,
      totalUsed: emailsSentToday + emailsInQueue,
      remaining: remaining,
      percentUsed: percentUsed,
      canSend: remaining > 0,
    });
  } catch (error) {
    console.error("[DAILY-LIMIT] Error:", error);
    return NextResponse.json(
      { error: "Failed to check daily limit" },
      { status: 500 }
    );
  }
}
