import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[CEO REPORT] Generating money-focused brief");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get all replies from last week
    const allReplies = await prisma.b2bCampaignEmail.findMany({
      where: { status: "replied", repliedAt: { gte: lastWeek } },
      select: {
        id: true,
        category: true,
        tier: true,
        repliedAt: true,
      },
    });

    // Get contracts from last week
    const recentContracts = await prisma.b2bStandingOrder.findMany({
      where: { createdAt: { gte: lastWeek } },
      select: { price: true, createdAt: true },
    });

    // Overnight replies
    const overnightReplies = allReplies.filter(r => new Date(r.repliedAt!) >= yesterday);

    // Category breakdown
    const categoryStats: Record<string, any> = {};
    allReplies.forEach(reply => {
      const cat = reply.category || "Unknown";
      if (!categoryStats[cat]) {
        categoryStats[cat] = { replies: 0, overnight: 0, tier1: 0, tier2: 0, tier3: 0 };
      }
      categoryStats[cat].replies++;
      if (new Date(reply.repliedAt!) >= yesterday) categoryStats[cat].overnight++;
      if (reply.tier === 1) categoryStats[cat].tier1++;
      else if (reply.tier === 2) categoryStats[cat].tier2++;
      else categoryStats[cat].tier3++;
    });

    // Average contract value
    const avgValue = recentContracts.length > 0
      ? recentContracts.reduce((sum, c) => sum + (c.price?.toNumber() || 0), 0) / recentContracts.length
      : 400;

    // Calculate expected revenue per category (Tier 1: 60% conversion, Tier 2: 35%, Tier 3: 15%)
    const categoriesByRevenue = Object.entries(categoryStats)
      .map(([cat, stats]) => {
        const expected = (stats.tier1 * 0.6 + stats.tier2 * 0.35 + stats.tier3 * 0.15) * avgValue;
        return { category: cat, ...stats, expectedRevenue: Math.round(expected) };
      })
      .sort((a, b) => b.expectedRevenue - a.expectedRevenue);

    // Trend
    const lastWeekCount = allReplies.filter(r => new Date(r.repliedAt!) < yesterday).length;
    const trend = lastWeekCount > 0 ? Math.round(((overnightReplies.length - lastWeekCount) / lastWeekCount) * 100) : 0;

    // Total expected
    const totalExpected = categoriesByRevenue.reduce((sum, c) => sum + c.expectedRevenue, 0);
    const actualRevenue = recentContracts.reduce((sum, c) => sum + (c.price?.toNumber() || 0), 0);

    // Smart recommendations
    const recs = [];
    if (categoriesByRevenue[0]) {
      recs.push(`${categoriesByRevenue[0].category} is HOT: £${categoriesByRevenue[0].expectedRevenue} expected - send 50% more.`);
    }
    if (categoriesByRevenue[categoriesByRevenue.length - 1]?.expectedRevenue < 300) {
      recs.push(`${categoriesByRevenue[categoriesByRevenue.length - 1].category} is COLD (£${categoriesByRevenue[categoriesByRevenue.length - 1].expectedRevenue}) - pause it.`);
    }
    if (overnightReplies.length > 10) {
      recs.push(`${overnightReplies.length} fresh replies overnight. Contact within 2 hours - 60% of value is in response speed.`);
    }
    if (Math.abs(trend) > 20) {
      recs.push(`Replies ${trend > 0 ? 'UP' : 'DOWN'} ${Math.abs(trend)}% - your messaging is ${trend > 0 ? 'working' : 'declining'}.`);
    }

    return NextResponse.json({
      success: true,
      headline: {
        expectedThisWeek: totalExpected,
        actualThisWeek: Math.round(actualRevenue),
        overnightReplies: overnightReplies.length,
        trend: trend > 0 ? `+${trend}%` : `${trend}%`,
      },
      categories: categoriesByRevenue.slice(0, 10),
      recommendations: recs,
      actions: [
        {
          priority: "high",
          title: `Reply to ${overnightReplies.length} leads`,
          expectedValue: Math.round(overnightReplies.length * 0.4 * avgValue),
          link: "/operator/responses",
        },
        {
          priority: categoriesByRevenue[0]?.expectedRevenue > 2000 ? "high" : "medium",
          title: `Focus on ${categoriesByRevenue[0]?.category}`,
          expectedValue: categoriesByRevenue[0]?.expectedRevenue || 0,
          link: "/operator/discover",
        },
      ],
    });
  } catch (error) {
    console.error("[CEO REPORT] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
