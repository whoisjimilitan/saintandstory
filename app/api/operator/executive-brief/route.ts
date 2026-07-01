import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[EXECUTIVE BRIEF] Generating intelligent CEO report");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // ===== OVERNIGHT ACTIVITY (last 24 hours) =====
    const overnightEmailsSent = await prisma.b2bCampaignEmail.count({
      where: {
        emailSentAt: { gte: yesterday },
      },
    });

    const overnightReplies = await prisma.b2bCampaignEmail.count({
      where: {
        repliedAt: { gte: yesterday },
      },
    });

    // ===== PERFORMANCE BY CATEGORY =====
    const categoryPerformance = await prisma.b2bCampaignEmail.groupBy({
      by: ["category"],
      where: {
        emailSentAt: { gte: yesterday },
      },
      _count: {
        id: true,
      },
    });

    // Get reply counts by category
    const categoryReplies = await prisma.b2bCampaignEmail.groupBy({
      by: ["category"],
      where: {
        repliedAt: { gte: yesterday },
      },
      _count: {
        id: true,
      },
    });

    const categoryStats = categoryPerformance.map(cat => {
      const sent = cat._count.id;
      const replied = categoryReplies.find(r => r.category === cat.category)?._count.id || 0;
      const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;

      return {
        category: cat.category || "Unknown",
        sent,
        replied,
        replyRate,
      };
    }).sort((a, b) => b.replyRate - a.replyRate);

    // ===== IDENTIFY PATTERNS =====
    const hotCategories = categoryStats.filter(c => c.replyRate >= 30);
    const coldCategories = categoryStats.filter(c => c.replyRate < 10);
    const bestPerformer = categoryStats[0];
    const worstPerformer = categoryStats[categoryStats.length - 1];

    // ===== REVENUE INSIGHT =====
    const recentContracts = await prisma.b2bStandingOrder.findMany({
      where: {
        createdAt: { gte: yesterday },
      },
      select: {
        price: true,
        businessName: true,
        frequency: true,
      },
    });

    const totalContractValue = recentContracts.reduce((sum, c) => sum + (c.price?.toNumber() || 0), 0);
    const averageContractValue = recentContracts.length > 0 ? totalContractValue / recentContracts.length : 0;

    // ===== FORECAST =====
    const projectedContracts = Math.ceil(overnightReplies * (averageContractValue > 0 ? 0.4 : 0.2)); // 40% reply to contract if we have data
    const projectedRevenue = projectedContracts * averageContractValue;

    // ===== RECOMMENDATIONS =====
    const recommendations: string[] = [];

    if (bestPerformer) {
      recommendations.push(
        `${bestPerformer.category} is your hottest category (${bestPerformer.replyRate}% reply rate). Send more campaigns there today.`
      );
    }

    if (coldCategories.length > 0) {
      const cold = coldCategories[0];
      recommendations.push(
        `${cold.category} is underperforming (${cold.replyRate}% reply). Consider pausing or optimizing the messaging.`
      );
    }

    if (overnightReplies > 0) {
      recommendations.push(
        `You have ${overnightReplies} fresh replies waiting. Review them in RESPONSES - high urgency.`
      );
    }

    if (overnightEmailsSent === 0) {
      recommendations.push(
        `No campaigns sent overnight. Start your day by uploading new leads in DISCOVER.`
      );
    }

    // ===== BUILD THE REPORT =====
    const report = {
      summary: {
        overnightEmailsSent,
        overnightReplies,
        replyRate: overnightEmailsSent > 0 ? Math.round((overnightReplies / overnightEmailsSent) * 100) : 0,
      },
      performance: {
        byCategory: categoryStats,
        hotCategories: hotCategories.map(c => c.category),
        coldCategories: coldCategories.map(c => c.category),
        bestPerformer: bestPerformer?.category || null,
        bestPerformerRate: bestPerformer?.replyRate || 0,
      },
      revenue: {
        newContractValue: totalContractValue,
        newContractCount: recentContracts.length,
        averageContractValue: Math.round(averageContractValue),
        projectedContracts,
        projectedRevenue: Math.round(projectedRevenue),
      },
      recommendations,
      actions: [
        {
          priority: "high",
          action: "Review replies",
          count: overnightReplies,
          link: "/operator/responses",
          reason: "Replies need quick follow-up",
        },
        {
          priority: bestPerformer ? "high" : "medium",
          action: `Focus on ${bestPerformer?.category || "hot categories"}`,
          count: bestPerformer?.replyRate || 0,
          link: "/operator/discover",
          reason: `${bestPerformer?.replyRate}% reply rate - highest ROI`,
        },
        {
          priority: "medium",
          action: "Check contracts",
          count: recentContracts.length,
          link: "/operator/contracts",
          reason: `£${Math.round(totalContractValue)} in new contracts`,
        },
      ].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }),
    };

    console.log("[EXECUTIVE BRIEF] ✓ Generated report");

    return NextResponse.json({
      success: true,
      report,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EXECUTIVE BRIEF] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate brief" },
      { status: 500 }
    );
  }
}
