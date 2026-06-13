import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  getLeadsByHeatScore,
  calculateHeatScore,
} from "@/lib/heat-score";
import {
  getHeatingUpProspects,
  getCoolingDownProspects,
  getHeatScoreMovement,
} from "@/lib/heat-score-timeline";

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
 * GET /api/b2b/intelligence/heat-dashboard
 *
 * Heat Score Dashboard Widgets
 * Shows hottest prospects, heating up, cooling down
 *
 * Views:
 * ?view=top - Top 20 hottest prospects
 * ?view=heating - Top 10 heating up fastest
 * ?view=cooling - Top 10 cooling down
 * ?view=distribution - Heat score distribution (all prospects)
 * ?view=all - All widgets combined (default)
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") || "all";
  const leadId = searchParams.get("lead_id");

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (leadId) {
      // Get heat score movement for specific lead
      const movement = await getHeatScoreMovement(sql, leadId);
      return NextResponse.json({
        lead_id: leadId,
        movement,
      });
    }

    const topHot = view === "top" || view === "all" ? await getLeadsByHeatScore(sql, 20) : [];
    const heatingUp = view === "heating" || view === "all" ? await getHeatingUpProspects(sql, 10) : [];
    const coolingDown = view === "cooling" || view === "all" ? await getCoolingDownProspects(sql, 10) : [];

    let distribution = null;
    if (view === "distribution" || view === "all") {
      const allLeads = await sql`
        SELECT engagement_score
        FROM b2b_leads
        WHERE status NOT IN ('dead')
      `;

      distribution = {
        hot: allLeads.filter((l: any) => l.engagement_score >= 75).length,
        warm: allLeads.filter((l: any) => l.engagement_score >= 50 && l.engagement_score < 75).length,
        cool: allLeads.filter((l: any) => l.engagement_score >= 25 && l.engagement_score < 50).length,
        cold: allLeads.filter((l: any) => l.engagement_score < 25).length,
        total: allLeads.length,
      };
    }

    const response: any = {
      view,
      generated_at: new Date().toISOString(),
    };

    if (view === "top" || view === "all") {
      response.top_hottest = topHot.map((item: any, index: number) => ({
        rank: index + 1,
        lead_id: item.lead_id,
        business_name: item.lead_id ? "..." : "...", // Will be populated by frontend
        heat_score: item.heat_score_breakdown.heat_score,
        heat_level: item.heat_score_breakdown.heat_level,
        breakdown: item.heat_score_breakdown,
      }));
    }

    if (view === "heating" || view === "all") {
      response.heating_up = heatingUp;
    }

    if (view === "cooling" || view === "all") {
      response.cooling_down = coolingDown;
    }

    if (view === "distribution" || view === "all") {
      response.distribution = distribution;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[HEAT-DASHBOARD API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch heat score dashboard",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
