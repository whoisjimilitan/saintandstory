import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  getCategoryConversionStats,
  getCategoriesByConversionPerformance,
  getUnderperformingCategories,
  getCategoryPerformanceInsights,
} from "@/lib/category-analytics";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

/**
 * GET /api/b2b/intelligence/category-analytics
 * Get conversion analytics by category
 *
 * Query params:
 * ?view=all - All categories with stats
 * ?view=ranked - Ranked by conversion rate (default)
 * ?view=underperformers - Categories converting below threshold
 * ?view=insights - Executive summary with recommendations
 *
 * DORMANT: Data collection only. Not activating automatic behavior changes.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "insights";

  const sql = neon(process.env.DATABASE_URL!);

  try {
    switch (view) {
      case "all":
        {
          const stats = await getCategoryConversionStats(sql);
          return NextResponse.json({
            view: "all",
            total_categories: stats.length,
            categories: stats,
            note: "All categories with discovery metrics",
          });
        }

      case "ranked":
        {
          const ranked = await getCategoriesByConversionPerformance(sql);
          return NextResponse.json({
            view: "ranked",
            total_performing_categories: ranked.length,
            categories: ranked,
            note: "Categories ranked by conversion rate (filtered for meaningful data)",
          });
        }

      case "underperformers":
        {
          const underperformers = await getUnderperformingCategories(sql, 0.05);
          return NextResponse.json({
            view: "underperformers",
            total_underperforming: underperformers.length,
            categories: underperformers,
            note: "Categories converting below 5% (candidates for pausing)",
            recommendation:
              underperformers.length > 0
                ? `Consider pausing discovery missions for: ${underperformers.map((c) => c.category).join(", ")}`
                : "No underperforming categories",
          });
        }

      case "insights":
      default:
        {
          const insights = await getCategoryPerformanceInsights(sql);
          return NextResponse.json({
            view: "insights",
            ...insights,
            note: "DORMANT: Insights for review only. Not activating automatic discovery changes.",
          });
        }
    }
  } catch (error) {
    console.error("[CATEGORY-ANALYTICS API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch category analytics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
