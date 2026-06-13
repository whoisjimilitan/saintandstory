import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { calculateHeatScore, getLeadsByHeatScore } from "@/lib/heat-score";

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
 * GET /api/b2b/intelligence/heat-score?lead_id=X
 * Get heat score breakdown for a specific lead
 *
 * GET /api/b2b/intelligence/heat-score?top=10
 * Get top 10 hottest prospects
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");
  const topN = parseInt(searchParams.get("top") || "10");

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (leadId) {
      // Get heat score for specific lead
      const breakdown = await calculateHeatScore(sql, leadId);

      return NextResponse.json({
        lead_id: leadId,
        heat_score_breakdown: breakdown,
        status: breakdown.heat_level,
      });
    } else {
      // Get top N hottest prospects
      const leadsWithScores = await getLeadsByHeatScore(sql, topN);

      return NextResponse.json({
        top_prospects: leadsWithScores.map((item, index) => ({
          rank: index + 1,
          lead_id: item.lead_id,
          heat_score: item.heat_score_breakdown.heat_score,
          heat_level: item.heat_score_breakdown.heat_level,
          breakdown: item.heat_score_breakdown,
        })),
        total_count: leadsWithScores.length,
      });
    }
  } catch (error) {
    console.error("[HEAT-SCORE API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate heat score",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
