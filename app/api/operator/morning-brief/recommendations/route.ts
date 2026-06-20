import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recommendations: Array<{
      title: string;
      description: string;
      actionText?: string;
      actionHref?: string;
    }> = [];

    // Get conversion data for today
    const conversions = await prisma.b2b_learning_outcomes.findMany({
      where: {
        created_at: {
          gte: today,
        },
        outcome_type: "converted",
      },
      select: {
        business_category: true,
        days_to_outcome: true,
        opportunity_score_at_outcome: true,
      },
      take: 10,
    });

    if (conversions.length > 0) {
      // Calculate average conversion time
      const avgDays =
        conversions.reduce((sum, c) => sum + (c.days_to_outcome || 0), 0) /
        conversions.length;

      // Most common category
      const categoryMap = new Map<string, number>();
      conversions.forEach((c) => {
        const cat = c.business_category || "Business";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });

      const topCategory = Array.from(categoryMap.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0];

      if (topCategory) {
        recommendations.push({
          title: `${topCategory[0]} sector showing strong conversion`,
          description: `${topCategory[1]} conversion${topCategory[1] > 1 ? "s" : ""} today with average ${Math.round(avgDays)}-day cycle. Continue focus on this category.`,
          actionText: "Review Strategy →",
          actionHref: "/operator/analytics",
        });
      }
    }

    // Add engagement recommendation
    const recentEngagement = await prisma.b2bLead.count({
      where: {
        last_engagement_at: {
          gte: today,
        },
        last_engagement_type: "reply",
      },
    });

    if (recentEngagement > 0) {
      recommendations.push({
        title: "Respond to prospect engagement",
        description: `${recentEngagement} prospect${recentEngagement > 1 ? "s" : ""} replied to outreach. High-intent signals require immediate follow-up.`,
        actionText: "View Responses →",
        actionHref: "/operator/pipeline",
      });
    }

    // Add default recommendation if needed
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Begin discovery phase",
        description:
          "No activity detected yet today. Start by discovering new opportunities in your target market.",
        actionText: "Start Discovery →",
        actionHref: "/operator/discover",
      });
    }

    return NextResponse.json(recommendations.slice(0, 3));
  } catch (error) {
    console.error("[Morning Brief Recommendations Error]", error);
    return NextResponse.json(
      { error: "Failed to load recommendations" },
      { status: 500 }
    );
  }
}
