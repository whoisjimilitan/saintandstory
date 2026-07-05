import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[TODAY CAMPAIGN STATS] Fetching email campaign stats for today");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get email campaigns sent today
    const sentEmails = await prisma.b2bCampaignEmail.count({
      where: {
        emailSentAt: {
          gte: today,
        },
      },
    });

    // Get opened emails (marked as openedAt is not null)
    const openedEmails = await prisma.b2bCampaignEmail.count({
      where: {
        emailSentAt: {
          gte: today,
        },
        openedAt: {
          not: null,
        },
      },
    });

    // Get clicked emails
    const clickedEmails = await prisma.b2bCampaignEmail.count({
      where: {
        emailSentAt: {
          gte: today,
        },
        clickedAt: {
          not: null,
        },
      },
    });

    // Get replied emails
    const repliedEmails = await prisma.b2bCampaignEmail.count({
      where: {
        emailSentAt: {
          gte: today,
        },
        repliedAt: {
          not: null,
        },
      },
    });

    const stats = {
      sent: sentEmails,
      opened: openedEmails,
      clicked: clickedEmails,
      replied: repliedEmails,
    };

    console.log("[TODAY CAMPAIGN STATS] Stats:", stats);
    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("[TODAY CAMPAIGN STATS] Error:", error);
    // Fallback to zeros if database unavailable
    return NextResponse.json(
      { stats: { sent: 0, opened: 0, clicked: 0, replied: 0 } },
      { status: 200 }
    );
  }
}
