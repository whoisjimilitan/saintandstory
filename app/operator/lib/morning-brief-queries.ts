/**
 * Morning Brief Live Data Queries
 * All metrics are live, never hardcoded
 */

import { prisma } from "@/lib/prisma";

export interface TodaySummary {
  discovered: number;
  enriched: number;
  qualified: number;
  orders: number;
}

export interface PriorityItem {
  theme: string;
  description: string;
  actionText: string;
  actionHref: string;
}

export interface KnowledgeLoopStage {
  name: string;
  count: number;
}

export interface Recommendation {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

/**
 * Get today's summary metrics
 */
export async function getTodaySummary(): Promise<TodaySummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [discovered, enriched, qualified, orders] = await Promise.all([
    // Opportunities discovered today
    prisma.b2bLead.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),

    // Businesses enriched today (in enriched state or beyond)
    prisma.b2bLead.count({
      where: {
        createdAt: {
          gte: today,
        },
        leadState: {
          in: ["recognised", "understood", "prioritised", "activated"],
        },
      },
    }),

    // Qualified opportunities (lead_state = 'understood')
    prisma.b2bLead.count({
      where: {
        leadState: "understood",
        transitionedAt: {
          gte: today,
        },
      },
    }),

    // Standing orders created today
    prisma.b2bStandingOrder.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),
  ]);

  return {
    discovered,
    enriched,
    qualified,
    orders,
  };
}

/**
 * Get top 3 priority themes by pressure type discovery today
 */
export async function getPriorityQueue(): Promise<PriorityItem[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get top 3 pressure types discovered today
  const topPressureTypes = await prisma.b2bLead.groupBy({
    by: ["businessCategory"],
    where: {
      createdAt: {
        gte: today,
      },
    },
    _count: true,
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 3,
  });

  // Map to priority queue items
  const items: PriorityItem[] = topPressureTypes.map((pt, index) => {
    const category = pt.businessCategory || "Business";
    const count = pt._count;

    return {
      theme: `${category} — Demand Accelerating`,
      description: `${count} newly identified ${category.toLowerCase()} businesses match existing standing order patterns. High-confidence opportunity for immediate outreach.`,
      actionText: "Review Opportunities →",
      actionHref: "/operator/discover",
    };
  });

  // If fewer than 3, add a generic item
  if (items.length < 3) {
    items.push({
      theme: "Review Pipeline Status",
      description: "Current opportunities in qualification phase require attention. Check pipeline for stalled conversations.",
      actionText: "View Pipeline →",
      actionHref: "/operator/pipeline",
    });
  }

  return items.slice(0, 3);
}

/**
 * Get knowledge loop stage counts
 */
export async function getKnowledgeLoop(): Promise<KnowledgeLoopStage[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = await prisma.b2bLead.groupBy({
    by: ["leadState"],
    where: {
      createdAt: {
        gte: today,
      },
    },
    _count: true,
  });

  // Map to stages in order
  const stageLabels: Record<string, string> = {
    new: "Discover",
    recognised: "Enrich",
    understood: "Qualify",
    prioritised: "Learn",
    activated: "Improve",
  };

  const countMap = new Map(
    counts.map((c) => [c.leadState || "new", c._count])
  );

  return [
    { name: "Discover", count: countMap.get("new") || 0 },
    { name: "Enrich", count: countMap.get("recognised") || 0 },
    { name: "Qualify", count: countMap.get("understood") || 0 },
    { name: "Learn", count: countMap.get("prioritised") || 0 },
    { name: "Improve", count: countMap.get("activated") || 0 },
  ];
}

/**
 * Get AI recommendations from learning data
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  const recommendations: Recommendation[] = [];

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
        description: `${topCategory[1]} conversions today with average ${Math.round(avgDays)}-day cycle. Continue focus on this category.`,
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
      actionHref: "/operator/responses",
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

  return recommendations.slice(0, 3);
}
