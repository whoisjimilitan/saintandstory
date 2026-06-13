import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  getMissionROI,
  getAllMissionROIs,
  getMissionsByROI,
  getHighPerformingMissions,
  getUnderperformingMissions,
} from "@/lib/mission-roi";

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
 * GET /api/b2b/intelligence/mission-roi
 * Get ROI for discovery missions
 *
 * Query params:
 * ?mission_id=X - ROI for specific mission
 * ?view=all - All missions with ROI (default)
 * ?view=ranked - Ranked by ROI percent
 * ?view=performers - High performers only
 * ?view=underperformers - Underperforming missions
 *
 * DORMANT: Data collection only. Not activating mission pausing/cancellation.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get("mission_id");
  const view = searchParams.get("view") || "all";

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (missionId) {
      // Get ROI for specific mission
      const roi = await getMissionROI(sql, missionId);

      if (!roi) {
        return NextResponse.json(
          { error: "Mission not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        mission: roi,
        note: "Mission ROI metrics. Data collection only.",
      });
    }

    // Get all missions
    switch (view) {
      case "ranked":
        {
          const ranked = await getMissionsByROI(sql);
          return NextResponse.json({
            view: "ranked",
            total_missions: ranked.length,
            missions: ranked,
            note: "Missions ranked by ROI percent",
          });
        }

      case "performers":
        {
          const performers = await getHighPerformingMissions(sql);
          return NextResponse.json({
            view: "high_performers",
            total: performers.length,
            missions: performers,
            note: "Missions with ROI > 100%",
          });
        }

      case "underperformers":
        {
          const underperformers = await getUnderperformingMissions(sql);
          return NextResponse.json({
            view: "underperformers",
            total: underperformers.length,
            missions: underperformers,
            note: "Missions with negative ROI (candidates for pausing)",
            recommendation:
              underperformers.length > 0
                ? `Consider pausing: ${underperformers.map((m) => `${m.niche} (${m.locations.join(", ")})`).join("; ")}`
                : "No underperforming missions",
          });
        }

      case "all":
      default:
        {
          const all = await getAllMissionROIs(sql);
          return NextResponse.json({
            view: "all",
            total_missions: all.length,
            missions: all,
            summary: {
              total_revenue: all.reduce((sum, m) => sum + m.revenue_generated, 0),
              average_roi: all.reduce((sum, m) => sum + m.roi_percent, 0) / (all.length || 1),
              total_discovered: all.reduce((sum, m) => sum + m.discovered_count, 0),
              total_converted: all.reduce((sum, m) => sum + m.converted_count, 0),
            },
            note: "DORMANT: Mission ROI for review. Not activating automatic behavior changes.",
          });
        }
    }
  } catch (error) {
    console.error("[MISSION-ROI API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch mission ROI",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
