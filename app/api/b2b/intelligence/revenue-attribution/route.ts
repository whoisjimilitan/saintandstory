import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  getCustomerJourney,
  getAllCustomerJourneys,
  getAttributionBySource,
} from "@/lib/revenue-attribution";

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
 * GET /api/b2b/intelligence/revenue-attribution
 * Get customer journey attribution data
 *
 * Query params:
 * ?lead_id=X - Full journey for one customer
 * ?view=all - All customer journeys (default)
 * ?view=by_source - Attribution summary by discovery source
 *
 * DORMANT: Data collection only
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");
  const view = searchParams.get("view") || "all";

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (leadId) {
      // Get single customer journey
      const journey = await getCustomerJourney(sql, leadId);

      if (!journey) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        lead_id: leadId,
        journey,
        note: "Full customer journey from discovery to revenue",
      });
    }

    switch (view) {
      case "by_source":
        {
          const attribution = await getAttributionBySource(sql);
          return NextResponse.json({
            view: "by_source",
            attribution,
            note: "Attribution summary by discovery source (mission, inbound, manual)",
          });
        }

      case "all":
      default:
        {
          const allJourneys = await getAllCustomerJourneys(sql);

          const summary = {
            total_customers: allJourneys.length,
            total_revenue: allJourneys.reduce((sum, j) => sum + j.revenue_generated, 0),
            average_days_to_conversion:
              allJourneys.length > 0
                ? Math.round(
                    allJourneys.reduce((sum, j) => sum + (j.days_to_conversion || 0), 0) /
                      allJourneys.length
                  )
                : 0,
            average_touches:
              allJourneys.length > 0
                ? Math.round(
                    allJourneys.reduce((sum, j) => sum + j.touches, 0) /
                      allJourneys.length
                  )
                : 0,
          };

          return NextResponse.json({
            view: "all",
            journeys: allJourneys,
            summary,
            note: "DORMANT: All customer journey data for analysis. No automatic behavior changes.",
          });
        }
    }
  } catch (error) {
    console.error("[REVENUE-ATTRIBUTION API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch revenue attribution",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
