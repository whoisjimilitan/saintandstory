import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[DASHBOARD STATS] Fetching live operator dashboard data");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // CAMPAIGNS - Email campaigns
    const campaigns = await prisma.b2bCampaign.findMany({
      include: { emails: true, whatsapp: true },
      orderBy: { sentAt: "desc" },
    });

    // EMAIL STATS - From new B2bCampaignEmail
    const emailStats = {
      totalSent: await prisma.b2bCampaignEmail.count({
        where: { status: "sent" },
      }),
      totalOpened: await prisma.b2bCampaignEmail.count({
        where: { status: "opened" },
      }),
      totalClicked: await prisma.b2bCampaignEmail.count({
        where: { status: "clicked" },
      }),
      totalReplied: await prisma.b2bCampaignEmail.count({
        where: { status: "replied" },
      }),
      todayReplied: await prisma.b2bCampaignEmail.count({
        where: {
          status: "replied",
          repliedAt: {
            gte: today,
          },
        },
      }),
    };

    // WHATSAPP STATS - From new B2bCampaignWhatsApp
    const whatsappStats = {
      totalSent: await prisma.b2bCampaignWhatsApp.count({
        where: { status: "sent" },
      }),
      totalDelivered: await prisma.b2bCampaignWhatsApp.count({
        where: { status: "delivered" },
      }),
      totalReplied: await prisma.b2bCampaignWhatsApp.count({
        where: { status: "replied" },
      }),
    };

    // CONTRACT STATS - From B2bStandingOrder
    const contracts = await prisma.b2bStandingOrder.findMany();
    const contractStats = {
      total: contracts.length,
      active: contracts.filter(c => c.active).length,
      inactive: contracts.filter(c => !c.active).length,
      totalValue: contracts.reduce((sum, c) => sum + (c.price?.toNumber() || 0), 0),
    };

    // RECENT REPLIES - Last 5 replied emails
    const recentReplies = await prisma.b2bCampaignEmail.findMany({
      where: { status: "replied" },
      orderBy: { repliedAt: "desc" },
      take: 5,
      select: {
        id: true,
        prospectName: true,
        prospectEmail: true,
        category: true,
        repliedAt: true,
        campaign: { select: { campaignName: true } },
      },
    });

    // ACTIVE CAMPAIGNS - In progress
    const activeCampaigns = campaigns.filter(c => c.status === "sent").length;

    // TODAY'S ACTIVITY
    const todayEmailsReplied = await prisma.b2bCampaignEmail.count({
      where: {
        status: "replied",
        repliedAt: { gte: today },
      },
    });

    console.log("[DASHBOARD STATS] ✓ Loaded live stats");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      campaigns: {
        total: campaigns.length,
        active: activeCampaigns,
        byChannel: {
          email: campaigns.filter(c => c.channel === "email").length,
          whatsapp: campaigns.filter(c => c.channel === "whatsapp").length,
          phone: campaigns.filter(c => c.channel === "phone").length,
        },
      },
      email: emailStats,
      whatsapp: whatsappStats,
      contracts: contractStats,
      activity: {
        repliedToday: todayEmailsReplied,
        recentReplies: recentReplies,
      },
      command_center: {
        actionItems: {
          reviewReplies: emailStats.totalReplied,
          pendingContracts: contractStats.active,
          sendCampaigns: activeCampaigns,
        },
        priority: {
          hot: emailStats.totalReplied,
          needsAction: contractStats.total - contractStats.active,
          inProgress: activeCampaigns,
        },
      },
    });
  } catch (error) {
    console.error("[DASHBOARD STATS] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
