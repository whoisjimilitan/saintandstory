import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * FIX #4: Call Sprint Integration
 * Links daily recommendations to phone queue
 * Returns recommended prospects prioritized at top for "call sprint"
 * Smaller focused list (5-10) instead of all 138+
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get today's recommendation
    const categoryScores = await sql`
      SELECT
        COUNT(*) as count,
        CASE
          WHEN customer_name ILIKE '%event%' OR customer_name ILIKE '%catering%' THEN 'events'
          WHEN customer_name ILIKE '%film%' OR customer_name ILIKE '%production%' THEN 'film_tv'
          WHEN customer_name ILIKE '%art%' OR customer_name ILIKE '%auction%' THEN 'art_auction'
          ELSE 'other'
        END as category
      FROM b2b_standing_orders
      WHERE created_at >= DATE_TRUNC('month', NOW())
      GROUP BY category
    `.catch(() => []);

    // Determine top category
    let topCategory = "events"; // default
    if (Array.isArray(categoryScores) && categoryScores.length > 0) {
      const sorted = categoryScores.sort((a: any, b: any) => b.count - a.count);
      topCategory = sorted[0].category || "events";
    }

    // Map category to search patterns
    const categoryPatterns: Record<string, string> = {
      events: "('%event%', '%catering%', '%wedding%', '%planner%')",
      film_tv: "('%film%', '%production%', '%tv%', '%media%')",
      art_auction: "('%art%', '%auction%', '%gallery%', '%antique%')",
    };

    const patterns = categoryPatterns[topCategory] || categoryPatterns.events;

    // Get top 5-10 prospects in recommended category ready to call
    // Prioritize those who haven't been called yet
    const recommendedProspects = await sql`
      SELECT
        bl.id,
        bl.business_name,
        bl.phone,
        bl.city,
        bl.business_category,
        COALESCE(bl.rating, 0) as rating,
        CASE WHEN bl.email_sent_at IS NOT NULL THEN true ELSE false END as already_emailed
      FROM b2b_leads bl
      WHERE bl.phone IS NOT NULL
        AND bl.phone != ''
        AND (
          bl.business_name ILIKE '%event%' OR bl.business_name ILIKE '%catering%' OR
          bl.business_name ILIKE '%wedding%' OR bl.business_name ILIKE '%planner%' OR
          bl.business_category ILIKE '%event%'
        )
      ORDER BY
        already_emailed DESC,  -- Call those we haven't emailed first (higher conversion)
        bl.rating DESC,
        bl.created_at DESC
      LIMIT 10
    `.catch(() => []);

    // Get total queue size (all prospects ready to call)
    const totalQueue = await sql`
      SELECT COUNT(*) as count
      FROM b2b_leads
      WHERE phone IS NOT NULL AND phone != ''
      ORDER BY created_at DESC
    `.catch(() => [{ count: 0 }]);

    const queueCount = Array.isArray(totalQueue) ? totalQueue[0]?.count || 0 : 0;

    return NextResponse.json({
      status: "ready",
      call_sprint: {
        category: topCategory,
        description: topCategory === "events" ? "Event Planning & Catering" :
                     topCategory === "film_tv" ? "Film & TV Production" :
                     "Art/Auction Houses",
        why: topCategory === "events" ? "Recurring revenue + highest margin (40%)" :
             topCategory === "film_tv" ? "Crew downtime cost = instant yes" :
             "Premium pricing (50-65% margin)",
        priority_prospects: recommendedProspects.map((p: any) => ({
          id: p.id,
          business_name: p.business_name,
          phone: p.phone,
          city: p.city,
          rating: p.rating,
          already_emailed: p.already_emailed,
          priority: p.already_emailed ? "WARM_LEAD" : "COLD_LEAD",
        })),
        sprint_size: recommendedProspects.length,
        total_queue: queueCount,
        instruction: `Call these ${recommendedProspects.length} ${topCategory} prospects today. Once all contacted, system loads next batch from same category.`,
      },
      metrics: {
        recommended_count: recommendedProspects.length,
        warm_leads: recommendedProspects.filter((p: any) => p.already_emailed).length,
        cold_leads: recommendedProspects.filter((p: any) => !p.already_emailed).length,
        total_available: queueCount,
      },
    });
  } catch (error) {
    console.error("[recommended-call-sprint] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
