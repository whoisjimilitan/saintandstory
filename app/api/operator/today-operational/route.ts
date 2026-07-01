import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[TODAY OPERATIONAL] Fetching actual operational state");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ===== DRIVERS AVAILABLE RIGHT NOW =====
    const allDrivers = await prisma.driver.findMany({
      select: { id: true, lastSeenAt: true },
    });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const driversOnline = allDrivers.filter(
      d => d.lastSeenAt && new Date(d.lastSeenAt) > fiveMinutesAgo
    ).length;

    const driversTotalPool = allDrivers.length;
    const driversOffline = driversTotalPool - driversOnline;

    // ===== ACTUAL PIPELINE MOVES TODAY =====
    const pipelineToday = await prisma.b2bLead.groupBy({
      by: ["stage"],
      where: {
        updatedAt: { gte: today },
      },
      _count: { id: true },
    });

    const pipelineQualified = pipelineToday.find(p => p.stage === "qualified")?._count.id || 0;
    const pipelineProposed = pipelineToday.find(p => p.stage === "proposed")?._count.id || 0;
    const pipelineClosedToday = pipelineToday.find(p => p.stage === "closed")?._count.id || 0;

    // ===== ACTUAL EMAIL REPLIES WAITING =====
    const repliesWaiting = await prisma.b2bCampaignEmail.count({
      where: {
        status: "replied",
      },
    });

    // Oldest reply
    const oldestReply = await prisma.b2bCampaignEmail.findFirst({
      where: { status: "replied" },
      orderBy: { repliedAt: "asc" },
      select: { repliedAt: true },
    });

    const oldestReplyHours = oldestReply?.repliedAt
      ? Math.floor((Date.now() - new Date(oldestReply.repliedAt).getTime()) / (1000 * 60 * 60))
      : 0;

    // ===== STALLED PROSPECTS =====
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const prospectsStalled = await prisma.b2bLead.count({
      where: {
        stage: { in: ["discover", "enrich"] },
        updatedAt: { lt: threeDaysAgo },
      },
    });

    // ===== EMAIL CAMPAIGN SNAPSHOT =====
    const emailSent = await prisma.b2bCampaignEmail.count({
      where: { emailSentAt: { gte: today } },
    });
    const emailOpened = await prisma.b2bCampaignEmail.count({
      where: { openedAt: { gte: today } },
    });
    const emailClicked = await prisma.b2bCampaignEmail.count({
      where: { clickedAt: { gte: today } },
    });
    const emailReplied = await prisma.b2bCampaignEmail.count({
      where: { repliedAt: { gte: today } },
    });

    // ===== WHATSAPP CAMPAIGN SNAPSHOT =====
    const whatsappActive = await prisma.b2bCampaignWhatsApp.count({
      where: { lastMessageAt: { gte: today } },
    });
    const whatsappReady = await prisma.b2bCampaignWhatsApp.count({
      where: { status: "ready" },
    });
    const whatsappReplied = await prisma.b2bCampaignWhatsApp.count({
      where: { messageCount: { gt: 1 } },
    });

    // ===== STATUS MESSAGE =====
    let statusMessage = "";
    if (driversOnline === 0) {
      statusMessage = "No drivers online — interception jobs will be queued.";
    } else if (repliesWaiting > 20) {
      statusMessage = `${repliesWaiting} replies waiting — prioritize oldest first (${oldestReplyHours}h old).`;
    } else if (prospectsStalled > 10) {
      statusMessage = `${prospectsStalled} prospects stuck for 3+ days — needs attention to keep pipeline moving.`;
    } else {
      statusMessage = "Pipeline healthy. Focus on converting waiting replies.";
    }

    console.log("[TODAY OPERATIONAL] ✓ Fetched");

    return NextResponse.json({
      success: true,
      data: {
        driversOnline,
        driversTotalPool,
        driversOffline,
        pipelineQualified,
        pipelineProposed,
        pipelineClosedToday,
        repliesWaiting,
        oldestReplyHours,
        prospectsStalled,
        statusMessage,
        emailSent,
        emailOpened,
        emailClicked,
        emailReplied,
        whatsappActive,
        whatsappReady,
        whatsappReplied,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[TODAY OPERATIONAL] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
