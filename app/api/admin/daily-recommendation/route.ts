import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Daily Recommendation Engine
 * Analyzes pipeline and recommends which category to target today
 * Scores by: margin + revenue + market demand + ease of reach
 */

const CATEGORY_INTEL = {
  events: {
    name: "Event Planning & Catering",
    margin_percent: 40,
    market_size: 8000,
    urgency: "Weekly (recurring)",
    pain_point: "Time-sensitive multi-location coordination",
  },
  film_tv: {
    name: "Film & TV Production",
    margin_percent: 50,
    market_size: 2500,
    urgency: "Daily during shoots (seasonal)",
    pain_point: "Crew downtime = £2-5k/hour lost",
  },
  art_auction: {
    name: "Art/Auction Houses",
    margin_percent: 65,
    market_size: 3000,
    urgency: "Monthly (3-10 deliveries)",
    pain_point: "£50k-500k pieces, damage liability critical",
  },
};

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get current standing orders by category (infer from customer_name patterns or explicit field)
    const standingOrders = await sql`
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(price), 0) as total_revenue,
        CASE
          WHEN customer_name ILIKE '%event%' OR customer_name ILIKE '%catering%' OR customer_name ILIKE '%wedding%' THEN 'events'
          WHEN customer_name ILIKE '%film%' OR customer_name ILIKE '%tv%' OR customer_name ILIKE '%production%' THEN 'film_tv'
          WHEN customer_name ILIKE '%art%' OR customer_name ILIKE '%auction%' OR customer_name ILIKE '%antique%' THEN 'art_auction'
          ELSE 'other'
        END as category
      FROM b2b_standing_orders
      WHERE created_at >= DATE_TRUNC('month', NOW())
      GROUP BY category
    `.catch(() => []);

    // Get this month's revenue by category
    const monthlyRevenue = await sql`
      SELECT
        COALESCE(SUM(amount), 0) as total_earned,
        COUNT(*) as jobs_completed
      FROM earnings
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `.catch(() => [{ total_earned: 0, jobs_completed: 0 }]);

    const monthData = Array.isArray(monthlyRevenue) ? monthlyRevenue[0] : { total_earned: 0, jobs_completed: 0 };
    const categoryData = Array.isArray(standingOrders) ? standingOrders : [];

    // Score each category
    interface CategoryScore {
      id: string;
      name: string;
      score: number;
      reason: string[];
      standing_orders: number;
      market_size: number;
      margin_percent: number;
      urgency: string;
      prospects_to_call: number;
    }

    const scores: CategoryScore[] = [
      {
        id: "events",
        name: CATEGORY_INTEL.events.name,
        score: 0,
        reason: [],
        standing_orders: categoryData.find((c: any) => c.category === "events")?.count || 0,
        market_size: CATEGORY_INTEL.events.market_size,
        margin_percent: CATEGORY_INTEL.events.margin_percent,
        urgency: CATEGORY_INTEL.events.urgency,
        prospects_to_call: 0,
      },
      {
        id: "film_tv",
        name: CATEGORY_INTEL.film_tv.name,
        score: 0,
        reason: [],
        standing_orders: categoryData.find((c: any) => c.category === "film_tv")?.count || 0,
        market_size: CATEGORY_INTEL.film_tv.market_size,
        margin_percent: CATEGORY_INTEL.film_tv.margin_percent,
        urgency: CATEGORY_INTEL.film_tv.urgency,
        prospects_to_call: 0,
      },
      {
        id: "art_auction",
        name: CATEGORY_INTEL.art_auction.name,
        score: 0,
        reason: [],
        standing_orders: categoryData.find((c: any) => c.category === "art_auction")?.count || 0,
        market_size: CATEGORY_INTEL.art_auction.market_size,
        margin_percent: CATEGORY_INTEL.art_auction.margin_percent,
        urgency: CATEGORY_INTEL.art_auction.urgency,
        prospects_to_call: 0,
      },
    ];

    // Calculate scores
    scores.forEach((cat) => {
      let score = 0;
      const reasons: string[] = [];

      // Margin (higher = better)
      score += cat.margin_percent;
      if (cat.margin_percent >= 50) reasons.push(`High margin (${cat.margin_percent}%)`);

      // Standing orders (if have some, boost it)
      if (cat.standing_orders > 0) {
        score += cat.standing_orders * 20;
        reasons.push(`Already have ${cat.standing_orders} standing order(s)`);
      } else {
        // If no standing orders, prioritize underserved (inverse to market size)
        score += (10000 - cat.market_size) / 100;
      }

      // Market size consideration (smaller = less competition)
      if (cat.market_size < 4000) {
        score += 30;
        reasons.push("Underserved market");
      }

      cat.score = Math.round(score);
    });

    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);

    const recommendation = scores[0];
    const topProspects = await getProspectsForCategory(sql, recommendation.id);

    return NextResponse.json({
      status: "ready",
      today_recommendation: {
        category: recommendation.name,
        category_id: recommendation.id,
        score: recommendation.score,
        why: recommendation.reason,
        key_insight: generateInsight(recommendation),
        margin: `${recommendation.margin_percent}% premium`,
        urgency: recommendation.urgency,
        market_size: recommendation.market_size,
        your_standing_orders: recommendation.standing_orders,
      },
      action_today: {
        focus: `Target ${recommendation.name.split(" &")[0]} companies`,
        phone_calls: topProspects.length,
        prospects: topProspects.slice(0, 5), // Top 5 to call
      },
      all_scores: scores, // Show scoring for transparency
      monthly_stats: {
        total_earned: `£${Number(monthData.total_earned).toFixed(2)}`,
        jobs_completed: monthData.jobs_completed,
      },
    });
  } catch (error) {
    console.error("[daily-recommendation] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function getProspectsForCategory(sql: any, categoryId: string): Promise<any[]> {
  try {
    // Get existing discovered prospects in this category
    const query = buildProspectQuery(categoryId);
    const prospects = await sql(query).catch(() => []);
    return Array.isArray(prospects) ? prospects : [];
  } catch (error) {
    console.error("[daily-recommendation] Failed to fetch prospects:", error);
    return [];
  }
}

function buildProspectQuery(categoryId: string): string {
  const whereClause = {
    events:
      `WHERE bl.business_category ILIKE '%event%' OR bl.business_name ILIKE '%event%' OR bl.business_name ILIKE '%catering%'`,
    film_tv: `WHERE bl.business_category ILIKE '%film%' OR bl.business_category ILIKE '%production%' OR bl.business_name ILIKE '%production%'`,
    art_auction: `WHERE bl.business_category ILIKE '%art%' OR bl.business_category ILIKE '%auction%' OR bl.business_name ILIKE '%gallery%'`,
  }[categoryId] || `WHERE 1=1`;

  return `
    SELECT
      bl.id,
      bl.business_name,
      bl.phone,
      bl.city,
      bl.business_category,
      COALESCE(bl.rating, 0) as rating
    FROM b2b_leads bl
    ${whereClause}
      AND bl.phone IS NOT NULL
      AND bl.phone != ''
      AND bl.email_sent_at IS NULL
    ORDER BY bl.rating DESC, bl.created_at DESC
    LIMIT 5
  `;
}

function generateInsight(recommendation: any): string {
  const insights = [
    `${recommendation.margin_percent}% margin potential`,
    `${recommendation.standing_orders > 0 ? "Proven demand" : "Underserved market"}`,
    recommendation.standing_orders > 0
      ? `Already delivering to ${recommendation.standing_orders} client(s)`
      : `Low competition vs ${recommendation.market_size} prospects`,
  ];

  return insights.join(" + ");
}
